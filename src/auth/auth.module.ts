import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AccountModule } from '../account/accounts.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constant';
import { AccountService } from '../account/accounts.service';
import { AccountSchema } from '../account/schemas/account.model';
import { MongooseModule } from '@nestjs/mongoose';
import { PostDataModule } from '../postData/postData.module';

@Module({
    imports: [
        forwardRef(() => AccountModule),
        forwardRef(() => PostDataModule),
      MongooseModule.forFeature([{name: 'Account', schema: AccountSchema}]),
      JwtModule.register({
        global: true,
        secret: jwtConstants.secret,
        signOptions: { expiresIn: '30m' },
      }),
    ],
    providers: [AuthService, ],
    controllers: [AuthController],
    exports: [AuthService],
  })
  export class AuthModule {}