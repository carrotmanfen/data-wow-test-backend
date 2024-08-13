import { Body, Controller, Post, HttpCode, HttpStatus, UseGuards, Get, Request, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBody, ApiProperty, ApiQuery, ApiParam, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { AccountService } from '../account/accounts.service';
import { IsString, IsNotEmpty } from 'class-validator';

class LoginDto {
    @ApiProperty({
        description: 'The username',
        example: 'username',
    })
    @IsString()
    @IsNotEmpty()
    username: string;
  
    @ApiProperty({
        description: 'The password',
        example: 'password',
    })
    @IsString()
    @IsNotEmpty()
    password: string;
  }

  class RefreshTokenDto {
    @ApiProperty({
      description: 'The refresh token',
      example: 'your_refresh_token_here',
    })
    @IsString()
    @IsNotEmpty()
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
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async signIn(@Body() signInDto: LoginDto) {
    try {
      const tokens = await this.authService.signIn(signInDto.username, signInDto.password);
      return {
        statusCode: HttpStatus.OK,
        message: 'Login successful',
        results: tokens,
      };
    } catch (error) {
        throw new UnauthorizedException('Invalid credentials');
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, description: 'Refresh Token to Receive a new access token.' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token.' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    try {
      const newAccessToken = await this.authService.refreshToken(refreshTokenDto.refresh_token);
      return {
        statusCode: HttpStatus.OK,
        message: 'Token refreshed successfully',
        result: newAccessToken,
      };
    } catch (error) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      
    }
  }

    

}