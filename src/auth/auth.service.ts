import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AccountService } from '../account/accounts.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private accountService: AccountService,
        private jwtService: JwtService
    ) { }

    async signIn(
        username: string,
        pass: string,
    ): Promise<{ access_token: string, refresh_token: string }> {
        const user = await this.accountService.findOne(username);
        if (user?.password !== pass) {
            throw new UnauthorizedException();
        }
        const payload = { sub: user._id, username: user.username, name: user.name };
        const payload2 = { sub: user._id };

        const access_token = await this.jwtService.signAsync(payload, { expiresIn: '15m' });
        const refresh_token = await this.jwtService.signAsync(payload2, { expiresIn: '7d' }); 

        return {
            access_token,
            refresh_token,
        };
    }

    async refreshToken(refresh_token: string): Promise<{ access_token: string }> {
        try {
            const payload = await this.jwtService.verifyAsync(refresh_token);
            const user = await this.accountService.findById(payload.sub);
            const new_access_token = await this.jwtService.signAsync({ sub: payload.sub, username: user.username, name: user.name }, {expiresIn: '15m'});
            return {
                access_token: new_access_token,
            };
        } catch (e) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

}