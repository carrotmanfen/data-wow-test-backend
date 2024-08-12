import { forwardRef, Module, Post } from '@nestjs/common';
import { AccountService } from './accounts.service';
import { AccountController } from './accounts.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountSchema } from './schemas/account.model';
import { PostDataService } from '../postData/postData.service';
import { PostDataModule } from '../postData/postData.module';
import { PostDataSchema } from '../postData/schemas/postData.model';

@Module({
  imports: [MongooseModule.forFeature([{name: 'Account', schema: AccountSchema}, {name:'PostData', schema:PostDataSchema}]), forwardRef(() => PostDataModule)],
  providers: [AccountService, PostDataService],
  controllers: [AccountController],
  exports: [AccountService],
})
export class AccountModule {}
