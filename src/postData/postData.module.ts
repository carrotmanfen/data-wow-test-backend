import { Module } from '@nestjs/common';
import { PostDataController } from './postData.controller';
import { PostDataService } from './postData.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PostDataSchema } from './schemas/postData.model';
import { AccountService } from 'src/account/accounts.service';
import { AccountModule } from 'src/account/accounts.module';

@Module({
  imports: [MongooseModule.forFeature([{name:'PostData', schema:PostDataSchema}]), AccountModule],
  providers:[PostDataService],
  controllers: [PostDataController]
})
export class PostDataModule {}
