import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountModule } from './account/accounts.module';
import { PostDataService } from './postData/postData.service';
import { PostDataModule } from './postData/postData.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
        envFilePath:'.env',
        isGlobal:true
    }),
    MongooseModule.forRoot(process.env.DB_URL),
    AccountModule,
    PostDataModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
