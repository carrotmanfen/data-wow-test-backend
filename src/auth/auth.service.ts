import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AccountService } from 'src/account/accounts.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private accountService: AccountService,
    private jwtService: JwtService
  ) {}

  async signIn(
    username: string,
    pass: string,
  ): Promise<{ access_token: string }> {
    const user = await this.accountService.findOne(username);
    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }
    const payload = { sub: user._id, username: user.username , name: user.name};
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

}