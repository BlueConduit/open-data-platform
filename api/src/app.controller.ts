import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * Basic controller class.
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Basic GET route.
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
