import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CompanyModule } from './company/company.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { BucketModule } from './bucket/bucket.module';
import { ToDosModule } from './todos/todos.module';


@Module({
  imports: [
    
    CompanyModule,
    UserModule,
    AuthModule,
    BucketModule,
    ToDosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
