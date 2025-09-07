import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World! 찐막최종 자동배포 성공! 🚀';
  }
}
