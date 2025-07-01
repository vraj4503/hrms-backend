import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ToDos } from './todos.entity';
import { mysqlPool } from '../config/mysql.config';
import { UserService } from '../user/user.service';
import { sendWhatsAppMessage } from '../utils/whatsapp';

@Injectable()
export class ToDosService {
  constructor(private readonly userService: UserService) {}

  async createToDo(
    todo: Partial<ToDos>,
  ): Promise<{ todo: ToDos; whatsappStatus: string }> {
    console.log('createToDo called with:', todo);
    const {
      BucketID,
      AssignTo,
      AssgnBy,
      NotificationTo,
      DueDateTime,
      Priority,
      StatusType,
      FilePath,
      Title,
      Description,
      CID,
      CreatedBy,
      UpdatedBy,
    } = todo;
    const connection = await mysqlPool.getConnection();
    let whatsappStatus = 'not_attempted';
    try {
      const [result] = await connection.execute(
        `INSERT INTO to_dos (BucketID, AssignTo, AssgnBy, NotificationTo, DueDateTime, Priority, StatusType, FilePath, Title, Description, CID, created, updated, CreatedBy, UpdatedBy)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?, ?)`,
        [
          BucketID ?? null,
          AssignTo ?? null,
          AssgnBy ?? null,
          NotificationTo ?? null,
          DueDateTime ?? null,
          Priority ?? null,
          StatusType ?? null,
          FilePath ?? null,
          Title ?? null,
          Description ?? null,
          CID ?? null,
          CreatedBy ?? null,
          UpdatedBy ?? null,
        ],
      );

      const insertedId = (result as { insertId: number }).insertId;
      const [rows] = await connection.execute(
        `SELECT * FROM to_dos WHERE ToDoId = ?`,
        [insertedId],
      );
      const createdToDo = (rows as ToDos[])[0];
      console.log('Created ToDo:', createdToDo);

      if (!createdToDo.AssignTo) {
        whatsappStatus = 'no_assignee';
        console.log(
          'No assignee for this task, WhatsApp notification not attempted.',
        );
      } else {
        try {
          const user = await this.userService.findOne(
            Number(createdToDo.AssignTo),
          );
          console.log('Fetched user for WhatsApp notification:', user);
          if (user && user.Phone) {
            const message = `Task: ${createdToDo.Title ?? ''}\nDescription: ${createdToDo.Description ?? ''}`;
            console.log(
              'Preparing to send WhatsApp message to user:',
              user.Phone,
              'with message:',
              message,
            );
            const whatsappResult = await sendWhatsAppMessage(
              user.Phone,
              message,
            );
            console.log('WhatsApp send result:', whatsappResult);
            whatsappStatus = whatsappResult.success ? 'success' : 'unsuccess';
          } else {
            console.log(
              'User has no phone number, skipping WhatsApp notification.',
            );
            whatsappStatus = 'no_phone';
          }
        } catch (err) {
          console.error('Failed to send WhatsApp notification:', err);
          whatsappStatus = 'unsuccess';
        }
      }
      return { todo: createdToDo, whatsappStatus };
    } catch (error) {
      console.error('Error creating ToDo:', error);
      throw new BadRequestException('Failed to create ToDo.');
    } finally {
      connection.release();
    }
  }

  async getAllToDos(cid?: number): Promise<ToDos[]> {
    const connection = await mysqlPool.getConnection();
    try {
      let query = 'SELECT * FROM to_dos';
      const params: unknown[] = [];
      if (cid) {
        query += ' WHERE CID = ?';
        params.push(cid);
      }
      const [rows] = await connection.execute(query, params);
      return rows as ToDos[];
    } catch (error) {
      console.error('Error fetching all ToDos:', error);
      throw new BadRequestException('Failed to fetch ToDos.');
    } finally {
      connection.release();
    }
  }

  async getToDoById(id: number): Promise<ToDos> {
    const connection = await mysqlPool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM to_dos WHERE ToDoId = ?',
        [id],
      );
      const todo = (rows as ToDos[])[0];
      if (!todo) {
        throw new NotFoundException(`ToDo with ID ${id} not found`);
      }
      return todo;
    } catch (error) {
      console.error(`Error fetching ToDo with ID ${id}:`, error);
      throw new BadRequestException('Failed to fetch ToDo.');
    } finally {
      connection.release();
    }
  }

  async updateToDo(id: number, todo: Partial<ToDos>): Promise<ToDos> {
    const connection = await mysqlPool.getConnection();
    try {
      const fieldsToUpdate = Object.keys(todo).filter(
        (key) => (todo as Record<string, unknown>)[key] !== undefined,
      );
      if (fieldsToUpdate.length === 0) {
        throw new BadRequestException('No fields to update.');
      }
      const setClauses = fieldsToUpdate
        .map((key) => `\`${key}\` = ?`)
        .join(', ');
      const values = fieldsToUpdate.map(
        (key) => (todo as Record<string, unknown>)[key],
      );
      values.push(id);
      const [result] = await connection.execute(
        `UPDATE to_dos SET ${setClauses}, \`updated\` = NOW() WHERE ToDoId = ?`,
        values,
      );
      if ((result as { affectedRows: number }).affectedRows === 0) {
        throw new NotFoundException(`ToDo with ID ${id} not found`);
      }
      const [rows] = await connection.execute(
        `SELECT * FROM to_dos WHERE ToDoId = ?`,
        [id],
      );
      return (rows as ToDos[])[0];
    } catch (error) {
      console.error(`Error updating ToDo with ID ${id}:`, error);
      throw new BadRequestException('Failed to update ToDo.');
    } finally {
      connection.release();
    }
  }

  async deleteToDo(id: number): Promise<void> {
    const connection = await mysqlPool.getConnection();
    try {
      const [result] = await connection.execute(
        'DELETE FROM to_dos WHERE ToDoId = ?',
        [id],
      );
      if ((result as { affectedRows: number }).affectedRows === 0) {
        throw new NotFoundException(`ToDo with ID ${id} not found`);
      }
    } catch (error) {
      console.error(`Error deleting ToDo with ID ${id}:`, error);
      throw new BadRequestException('Failed to delete ToDo.');
    } finally {
      connection.release();
    }
  }

  async getToDosByBucketId(bucketId: number): Promise<ToDos[]> {
    const connection = await mysqlPool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM to_dos WHERE BucketID = ?',
        [bucketId],
      );
      return rows as ToDos[];
    } catch (error) {
      console.error(`Error fetching ToDos by BucketID ${bucketId}:`, error);
      throw new BadRequestException('Failed to fetch ToDos by BucketID.');
    } finally {
      connection.release();
    }
  }
}
