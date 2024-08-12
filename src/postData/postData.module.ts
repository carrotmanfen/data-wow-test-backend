import { forwardRef, Module } from '@nestjs/common';
import { PostDataController } from './postData.controller';
import { PostDataService } from './postData.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PostDataSchema } from './schemas/postData.model';
import { AccountService } from '../account/accounts.service';
import { AccountModule } from '../account/accounts.module';
import { AccountSchema } from '../account/schemas/account.model';

@Module({
  imports: [MongooseModule.forFeature([{name:'PostData', schema:PostDataSchema}, {name: 'Account', schema: AccountSchema}]), forwardRef(() => AccountModule)],
  providers:[PostDataService, AccountService],
  controllers: [PostDataController],
  exports: [PostDataService],
})
export class PostDataModule {}
