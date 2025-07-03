import { Controller, Post, Request, UseGuards, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';


@Controller('auth')
export class AuthController {
  

  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req: any) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const encryptedToken = authHeader.split(' ')[1];
      try {
        
        const validationResult = await this.authService.validateToken(encryptedToken);
    
        const newLoginResult = await this.authService.login(req.user);
        return {
          ...validationResult,
          access_token: newLoginResult.access_token
        };
      } catch (error) {
        return this.authService.login(req.user);
      }
    }
    return this.authService.login(req.user);
  }
} 