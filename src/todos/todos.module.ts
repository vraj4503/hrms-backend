import { Module } from '@nestjs/common';
import { ToDosController } from './todos.controller';
import { ToDosService } from './todos.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [ToDosController],
  providers: [ToDosService],
  exports: [ToDosService],
})
export class ToDosModule {}
