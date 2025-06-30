import { Controller, Post, Body, Get, Param, Put, Delete, UseGuards, Request, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../auth/auth.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';


@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private authService: AuthService
  ) {}

  @Post()
   async create(@Body() createUserDto: CreateUserDto) {
     console.log('Controller received:', createUserDto);
     return this.userService.create(createUserDto);
   }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req: any) {
    return this.authService.login(req.user);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  @Get('company/:cid')
  findByCompany(@Param('cid') cid: string) {
    return this.userService.findByCompany(Number(cid));
  }

  @Post('/team-member')
  async addTeamMember(@Body() createUserDto: CreateUserDto) {
    console.log('Received DTO:', createUserDto);
    return this.userService.addTeamMember(createUserDto);
  }

   @Post('request-password-reset')
  async requestPasswordReset(@Body() body: RequestPasswordResetDto) {
    await this.userService.requestPasswordReset(body.email);
    return { message: 'If the email exists, an OTP has been sent.' };
  }

  @Post('verify-otp')
  async verifyOtp(@Body() body: VerifyOtpDto) {
    const isValid = await this.userService.verifyOtp(body.email, body.otp);
    return { valid: isValid };
  }

  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    if (body.newPassword !== body.confirmPassword) {
      return { success: false, message: 'Passwords do not match' };
    }
    const success = await this.userService.resetPassword(body.email, body.otp, body.newPassword);
    return { success };
  }
}

