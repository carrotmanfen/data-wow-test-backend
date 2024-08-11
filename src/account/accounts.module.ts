import { Module } from '@nestjs/common';
import { AccountService } from './accounts.service';
import { AccountController } from './accounts.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountSchema } from './schemas/account.model';

@Module({
  imports: [MongooseModule.forFeature([{name: 'Account', schema: AccountSchema}])],
  providers: [AccountService],
  controllers: [AccountController]
})
export class AccountModule {}
