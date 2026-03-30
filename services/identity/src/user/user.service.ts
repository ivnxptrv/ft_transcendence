import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { UpdateProfileDto } from './dto/update-profile.dto'
import { CreateProviderProfileDto } from './dto/create-provider-profile.dto'
import { UpdateProviderProfileDto } from './dto/update-provider-profile.dto'
import { UpdateTimeSlotsDto } from './dto/update-time-slots.dto'
import axios from 'axios'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  // PROFILE

  async getProfile(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: { providerProfile: { include: { timeSlots: true } } },
    })

    if (!profile) throw new NotFoundException('Profile not found')
    return profile
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } })
    if (!profile) throw new NotFoundException('Profile not found')

    return this.prisma.profile.update({
      where: { userId },
      data: dto,
    })
  }

  async getPublicProfile(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: {
        userId: true,
        firstName: true,
        lastName: true,
        displayName: true,
        avatarUrl: true,
        city: true,
        country: true,
      },
    })

    if (!profile) throw new NotFoundException('User not found')
    return profile
  }

  // PROVIDER PROFILE

  async createProviderProfile(userId: string, dto: CreateProviderProfileDto) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } })
    if (!profile) throw new NotFoundException('Profile not found')

    const existing = await this.prisma.providerProfile.findUnique({
      where: { userId },
    })
    if (existing) throw new ConflictException('Provider profile already exists')

    const providerProfile = await this.prisma.providerProfile.create({
      data: {
        profileId: profile.id,
        userId,
        title: dto.title,
        description: dto.description,
        hourlyRate: dto.hourlyRate,
        location: dto.location,
        languages: dto.languages ?? [],
        yearsExperience: dto.yearsExperience,
        timeSlots: dto.timeSlots
          ? {
              create: dto.timeSlots.map((slot) => ({
                day: slot.day as any,
                startTime: slot.startTime,
                endTime: slot.endTime,
              })),
            }
          : undefined,
      },
      include: { timeSlots: true },
    })

    await this.callAuthService(userId)
    await this.callSemanticService(userId, dto.title, dto.description, dto.location, dto.languages)

    return providerProfile
  }

  async getOwnProviderProfile(userId: string) {
    const providerProfile = await this.prisma.providerProfile.findUnique({
      where: { userId },
      include: { timeSlots: true },
    })

    if (!providerProfile) throw new NotFoundException('Provider profile not found')
    return providerProfile
  }

  async updateProviderProfile(userId: string, dto: UpdateProviderProfileDto) {
    const providerProfile = await this.prisma.providerProfile.findUnique({
      where: { userId },
    })

    if (!providerProfile) throw new NotFoundException('Provider profile not found')

    const updated = await this.prisma.providerProfile.update({
      where: { userId },
      data: {
        ...dto,
        hourlyRate: dto.hourlyRate !== undefined ? dto.hourlyRate : undefined,
        status: 'pending',
      },
      include: { timeSlots: true },
    })

    await this.callSemanticService(
      userId,
      updated.title,
      updated.description,
      updated.location ?? undefined,
      updated.languages,
    )

    return updated
  }

  async getPublicProviderProfile(providerId: string) {
    const providerProfile = await this.prisma.providerProfile.findUnique({
      where: { userId: providerId },
      include: {
        timeSlots: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    })

    if (!providerProfile) throw new NotFoundException('Provider not found')
    if (providerProfile.status !== 'active') throw new NotFoundException('Provider not found')

    return providerProfile
  }

  // TIME SLOTS

  async updateTimeSlots(userId: string, dto: UpdateTimeSlotsDto) {
    const providerProfile = await this.prisma.providerProfile.findUnique({
      where: { userId },
    })

    if (!providerProfile) throw new NotFoundException('Provider profile not found')

    await this.prisma.timeSlot.deleteMany({
      where: { providerProfileId: providerProfile.id },
    })

    return this.prisma.providerProfile.update({
      where: { userId },
      data: {
        timeSlots: {
          create: dto.timeSlots.map((slot) => ({
            day: slot.day as any,
            startTime: slot.startTime,
            endTime: slot.endTime,
          })),
        },
      },
      include: { timeSlots: true },
    })
  }
  
	async getAllUsers(params: {
	  page: number
	  limit: number
	  role?: string
	  isActive?: boolean
	  search?: string
	}) {
	  const { page, limit, role, isActive, search } = params
	  const skip = (page - 1) * limit

	  const where: any = {}
	  if (role) where.role = role
	  if (isActive !== undefined) where.isActive = isActive
	  if (search) {
	    where.OR = [
	      { email: { contains: search, mode: 'insensitive' } },
	      {
	        profile: {
	          OR: [
	            { firstName: { contains: search, mode: 'insensitive' } },
	            { lastName: { contains: search, mode: 'insensitive' } },
	          ],
	        },
	      },
	    ]
	  }

	  const [data, total] = await Promise.all([
	    this.prisma.user.findMany({
	      where,
	      skip,
	      take: limit,
	      include: { profile: true },
	      orderBy: { createdAt: 'desc' },
	    }),
	    this.prisma.user.count({ where }),
	  ])

	  return {
	    data,
	    total,
	    page,
	    limit,
	    totalPages: Math.ceil(total / limit),
	  }
	}

	async getAdminUserDetail(userId: string) {
	  const user = await this.prisma.user.findUnique({
	    where: { id: userId },
	    include: {
	      profile: {
	        include: {
	          providerProfile: { include: { timeSlots: true } },
	        },
	      },
	    },
	  })

	  if (!user) throw new NotFoundException('User not found')
	  return user
	}

	async updateUserStatus(userId: string, isActive: boolean, reason?: string) {
	  const user = await this.prisma.user.findUnique({ where: { id: userId } })
	  if (!user) throw new NotFoundException('User not found')

	  await this.prisma.user.update({
	    where: { id: userId },
	    data: { isActive },
	  })

	  return { userId, isActive, reason }
	}

	async flagProvider(providerId: string, flagged: boolean, reason?: string) {
	  const providerProfile = await this.prisma.providerProfile.findUnique({
	    where: { userId: providerId },
	  })

	  if (!providerProfile) throw new NotFoundException('Provider not found')

	  await this.prisma.providerProfile.update({
	    where: { userId: providerId },
	    data: { status: flagged ? 'flagged' : 'active' },
	  })

	  return { providerId, flagged, reason }
	}

	async editProviderTags(providerId: string, tags: string[]) {
	  const providerProfile = await this.prisma.providerProfile.findUnique({
	    where: { userId: providerId },
	  })

	  if (!providerProfile) throw new NotFoundException('Provider not found')

	  return this.prisma.providerProfile.update({
	    where: { userId: providerId },
	    data: { tags },
	  })
	}
  // INTERNAL

  async createProfileInternal(
    userId: string,
    firstName: string,
    lastName: string,
    email: string,
  ) {
    const existing = await this.prisma.profile.findUnique({ where: { userId } })
    if (existing) return existing

    return this.prisma.profile.create({
      data: {
        userId,
        firstName,
        lastName,
        displayName: `${firstName} ${lastName}`,
      },
    })
  }

  async getBasicUserInfo(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: {
        userId: true,
        firstName: true,
        lastName: true,
        displayName: true,
        avatarUrl: true,
      },
    })

    if (!profile) throw new NotFoundException('User not found')

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })

    return { ...profile, role: user?.role }
  }

  // HELPERS — INTER-SERVICE CALLS

  private async callAuthService(userId: string) {
    try {
      await axios.patch(
        `${this.config.get('IDENTITY_HOST')}:${this.config.get('IDENTITY_PORT')}/internal/auth/promote-role`,
        { userId },
      )
    } catch (err) {
      console.error('Failed to promote role:', err.message)
    }
  }

  private async callSemanticService(
    providerId: string,
    title: string,
    description: string,
    location?: string,
    languages?: string[],
  ) {
    try {
      await axios.post(
        `${this.config.get('SEMANTIC_SERVICE_URL')}/embed/provider`,
        { providerId, title, description, location, languages },
      )
    } catch (err) {
      console.error('Failed to call Semantic Service:', err.message)
    }
  }
}