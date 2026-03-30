import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy, VerifyCallback } from 'passport-google-oauth20'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly config: ConfigService) {
    super({
      clientID: config.get<string>('GOOGLE_CLIENT_ID') as string,
      clientSecret: config.get<string>('GOOGLE_CLIENT_SECRET') as string,
      callbackURL: config.get<string>('GOOGLE_CALLBACK_URL') as string,
      scope: ['email', 'profile'],
    } as any)
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    const { id, emails } = profile
    const email = emails[0].value

    done(null, {
      providerUserId: id,
      email,
      accessToken,
      refreshToken,
    })
  }
}