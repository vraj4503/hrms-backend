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
  ): Promise<{ todo: ToDos; whatsappStatus: any }> {
    console.log('[DEBUG] createToDo called with:', todo);
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
    let whatsappStatus: any = 'not_attempted';
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

      // Notify the assignee
      if (createdToDo.AssignTo) {
        try {
          const assignee = await this.userService.findOne(
            Number(createdToDo.AssignTo),
          );
          if (assignee && assignee.Phone) {
            const message = `Task: ${createdToDo.Title ?? ''}\nDescription: ${createdToDo.Description ?? ''}`;
            const whatsappResult = await sendWhatsAppMessage(
              assignee.Phone,
              message,
            );
            whatsappStatus = whatsappResult;
            console.log(
              '[WhatsApp DEBUG] Assignee send result:',
              whatsappResult,
            );
          } else {
            console.log('[WhatsApp DEBUG] Assignee has no phone number.');
          }
        } catch (err) {
          whatsappStatus = { success: false, message: err?.message || String(err) };
          console.error('[WhatsApp DEBUG] Error sending to assignee:', err);
        }
      }

      
      if (createdToDo.NotificationTo) {
        try {
          const assigner = createdToDo.AssgnBy
            ? await this.userService.findOne(Number(createdToDo.AssgnBy))
            : null;
          const assignee = createdToDo.AssignTo
            ? await this.userService.findOne(Number(createdToDo.AssignTo))
            : null;
          const notifyUser = await this.userService.findOne(
            Number(createdToDo.NotificationTo),
          );
          if (notifyUser && notifyUser.Phone) {
            const notifyMessage = `Task assigned by ${assigner ? assigner.Fname + ' ' + (assigner.Lname || '') : 'Unknown'} to ${assignee ? assignee.Fname + ' ' + (assignee.Lname || '') : 'Unknown'}.\nTask: ${createdToDo.Title ?? ''}\nDescription: ${createdToDo.Description ?? ''}`;
            const notifyResult = await sendWhatsAppMessage(
              notifyUser.Phone,
              notifyMessage,
            );
            console.log(
              '[WhatsApp DEBUG] NotificationTo send result:',
              notifyResult,
            );
          } else {
            console.log(
              '[WhatsApp DEBUG] NotificationTo user has no phone number.',
            );
          }
        } catch (err) {
          console.error(
            '[WhatsApp DEBUG] Error sending to NotificationTo user:',
            err,
          );
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
      const updatedToDo = (rows as ToDos[])[0];

      // Notify the assignee
      if (updatedToDo.AssignTo) {
        try {
          const assignee = await this.userService.findOne(Number(updatedToDo.AssignTo));
          if (assignee && assignee.Phone) {
            const message = `Task Updated: ${updatedToDo.Title ?? ''}\nDescription: ${updatedToDo.Description ?? ''}`;
            await sendWhatsAppMessage(assignee.Phone, message);
          }
        } catch (err) {
          console.error('[WhatsApp DEBUG] Error sending update to assignee:', err);
        }
      }
      // Notify third person if NotificationTo is set
      if (updatedToDo.NotificationTo) {
        try {
          const assigner = updatedToDo.AssgnBy ? await this.userService.findOne(Number(updatedToDo.AssgnBy)) : null;
          const assignee = updatedToDo.AssignTo ? await this.userService.findOne(Number(updatedToDo.AssignTo)) : null;
          const notifyUser = await this.userService.findOne(Number(updatedToDo.NotificationTo));
          if (notifyUser && notifyUser.Phone) {
            const notifyMessage = `Task updated by ${assigner ? assigner.Fname + ' ' + (assigner.Lname || '') : 'Unknown'} for ${assignee ? assignee.Fname + ' ' + (assignee.Lname || '') : 'Unknown'}.\nTask: ${updatedToDo.Title ?? ''}\nDescription: ${updatedToDo.Description ?? ''}`;
            await sendWhatsAppMessage(notifyUser.Phone, notifyMessage);
          }
        } catch (err) {
          console.error('[WhatsApp DEBUG] Error sending update to NotificationTo user:', err);
        }
      }
      return updatedToDo;
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
