import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AccountModule } from 'src/account/accounts.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constant';
import { AccountService } from 'src/account/accounts.service';
import { AccountSchema } from 'src/account/schemas/account.model';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports: [
      AccountModule,
      MongooseModule.forFeature([{name: 'Account', schema: AccountSchema}]),
      JwtModule.register({
        global: true,
        secret: jwtConstants.secret,
        signOptions: { expiresIn: '30m' },
      }),
    ],
    providers: [AuthService, AccountService],
    controllers: [AuthController],
    exports: [AuthService],
  })
  export class AuthModule {}