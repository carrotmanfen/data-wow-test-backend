import { Body, Controller, Post, HttpCode, HttpStatus, UseGuards, Get, Request } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBody, ApiProperty, ApiQuery, ApiParam, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { AccountService } from 'src/account/accounts.service';

class LoginDto {
    @ApiProperty({
        description: 'The username',
        example: 'username',
    })
    username: string;
  
    @ApiProperty({
        description: 'The password',
        example: 'password',
    })
    password: string;
  }

  class RefreshTokenDto {
    @ApiProperty({
      description: 'The refresh token',
      example: 'your-refresh-token-here',
    })
    refresh_token: string;
  }

@Controller('auth')
@ApiTags('auth') 
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login and receive access and refresh tokens.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async signIn(@Body() signInDto: LoginDto) {
    try {
      const tokens = await this.authService.signIn(signInDto.username, signInDto.password);
      return {
        statusCode: HttpStatus.OK,
        message: 'Login successful',
        data: tokens,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Invalid credentials',
      };
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, description: 'Refresh Token to Receive a new access token.' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token.' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    try {
      const newAccessToken = await this.authService.refreshToken(refreshTokenDto.refresh_token);
      return {
        statusCode: HttpStatus.OK,
        message: 'Token refreshed successfully',
        data: newAccessToken,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Invalid or expired refresh token',
      };
    }
  }

    

}