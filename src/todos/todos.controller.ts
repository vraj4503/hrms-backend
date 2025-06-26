import { Controller, Post, Get, Body, Param, Put, Delete, NotFoundException, Query } from '@nestjs/common';
import { ToDosService } from './todos.service';
import { ToDos } from './todos.entity';

@Controller('todos')
export class ToDosController {
  constructor(private readonly todosService: ToDosService) {}

  @Post()
  async createToDo(@Body() todo: Partial<ToDos>): Promise<ToDos> {
    return this.todosService.createToDo(todo);
  }

  @Get()
  async getAllToDos(@Query('cid') cid?: number): Promise<ToDos[]> {
    return this.todosService.getAllToDos(cid);
  }

  @Get(':id')
  async getToDoById(@Param('id') id: string): Promise<ToDos> {
    return this.todosService.getToDoById(+id);
  }

  @Put(':id')
  async updateToDo(@Param('id') id: string, @Body() todo: Partial<ToDos>): Promise<ToDos> {
    return this.todosService.updateToDo(+id, todo);
  }

  @Delete(':id')
  async deleteToDo(@Param('id') id: string): Promise<void> {
    return this.todosService.deleteToDo(+id);
  }
  
  @Get('bucket/:bucketId')
  async getToDosByBucketId(@Param('bucketId') bucketId: string): Promise<ToDos[]> {
    return this.todosService.getToDosByBucketId(+bucketId);
  }
}
