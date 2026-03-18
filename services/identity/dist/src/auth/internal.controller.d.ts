import { AuthService } from './auth.service';
import { PromoteRoleDto } from './dto/promote-role.dto';
export declare class InternalController {
    private readonly authService;
    constructor(authService: AuthService);
    validateToken(token: string): Promise<{
        userId: string;
        email: string;
        role: import("src/generated").$Enums.Role;
        isVerified: boolean;
    }>;
    promoteRole(dto: PromoteRoleDto): Promise<{
        userId: string;
        role: string;
    }>;
}
