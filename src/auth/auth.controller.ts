import { Body, Controller, Post, HttpCode, HttpStatus, UseGuards, Get, Request } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBody, ApiProperty, ApiQuery, ApiParam, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { AccountService } from 'src/account/accounts.service';

class LoginDto {
    @ApiProperty()
    username: string;
  
    @ApiProperty()
    password: string;
  }

@Controller('auth')
@ApiTags('auth') 
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiBody({type:LoginDto})
  @ApiResponse({ status: 201, description: 'Login and get accessToken' })
  signIn(@Body() signInDto: Record<string, any>) {
    return this.authService.signIn(signInDto.username, signInDto.password);
  }

}