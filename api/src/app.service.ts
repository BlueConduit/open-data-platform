import { Injectable } from '@nestjs/common';

/**
 * Basic service class.
 *
 * Used in AppController.
 */
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
