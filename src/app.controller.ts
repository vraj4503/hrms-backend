import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { sendMail } from './utils/email'; // adjust path as needed

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test-email')
  async testEmail() {
    return await sendMail('Urmi-Gurav@anantamit.com', 'Test Subject', 'Hello from HRMS!');
  }
}
