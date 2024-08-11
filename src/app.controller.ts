import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiResponse({ status: 200, description: 'Returns the message how to use swagger' })
  getHello(): string {
    return this.appService.getHello();
  }
}
