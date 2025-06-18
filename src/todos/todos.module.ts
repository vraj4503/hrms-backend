import { Module } from '@nestjs/common';
import { ToDosController } from './todos.controller';
import { ToDosService } from './todos.service';

@Module({
  imports: [],
  controllers: [ToDosController],
  providers: [ToDosService],
  exports: [ToDosService],
})
export class ToDosModule {}
