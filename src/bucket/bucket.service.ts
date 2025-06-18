import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Bucket } from './bucket.entity';
import { mysqlPool } from '../config/mysql.config';

@Injectable()
export class BucketService {
  constructor() {}

  async createBucket(bucket: Partial<Bucket>): Promise<Bucket> {
    const { BucketName, BucketDescription, CID, CreatedBy, UpdatedBy } = bucket;
    const connection = await mysqlPool.getConnection();
    try {
      const [result] = await connection.execute(
        `INSERT INTO bucket (BucketName, BucketDescription, CID, created, updated, CreatedBy, UpdatedBy) VALUES (?, ?, ?, NOW(), NOW(), ?, ?)`,
        [BucketName, BucketDescription, CID, CreatedBy || null, UpdatedBy || null]
      );

      const insertedId = (result as any).insertId;
      const [rows] = await connection.execute(`SELECT * FROM bucket WHERE BucketId = ?`, [insertedId]);
      return (rows as Bucket[])[0];
    } catch (error) {
      console.error('Error creating bucket:', error);
      throw new BadRequestException('Failed to create bucket.');
    } finally {
      connection.release();
    }
  }

  async getAllBuckets(cid?: number): Promise<Bucket[]> {
    const connection = await mysqlPool.getConnection();
    try {
      let query = 'SELECT * FROM bucket';
      const values: (string | number)[] = [];
      if (cid) {
        query += ' WHERE CID = ?';
        values.push(cid);
      }
      const [rows] = await connection.execute(query, values);
      return rows as Bucket[];
    } catch (error) {
      console.error('Error fetching all buckets:', error);
      throw new BadRequestException('Failed to fetch buckets.');
    } finally {
      connection.release();
    }
  }

  async updateBucket(id: number, bucket: Partial<Bucket>): Promise<Bucket> {
    const connection = await mysqlPool.getConnection();
    try {
      const fieldsToUpdate = Object.keys(bucket).filter(key => (bucket as any)[key] !== undefined);
      if (fieldsToUpdate.length === 0) {
        throw new BadRequestException('No fields to update.');
      }

      const setClauses = fieldsToUpdate.map(key => `\`${key}\` = ?`).join(', ');
      const values = fieldsToUpdate.map(key => (bucket as any)[key]);
      values.push(id);

      const [result] = await connection.execute(
        `UPDATE bucket SET ${setClauses}, \`updated\` = NOW() WHERE BucketId = ?`,
        values
      );

      if ((result as any).affectedRows === 0) {
        throw new NotFoundException(`Bucket with ID ${id} not found`);
      }
      const [rows] = await connection.execute(`SELECT * FROM bucket WHERE BucketId = ?`, [id]);
      return (rows as Bucket[])[0];
    } catch (error) {
      console.error(`Error updating bucket with ID ${id}:`, error);
      throw new BadRequestException('Failed to update bucket.');
    } finally {
      connection.release();
    }
  }

  async deleteBucket(id: number): Promise<void> {
    const connection = await mysqlPool.getConnection();
    try {
      const [result] = await connection.execute('DELETE FROM bucket WHERE BucketId = ?', [id]);
      if ((result as any).affectedRows === 0) {
        throw new NotFoundException(`Bucket with ID ${id} not found`);
      }
    } catch (error) {
      console.error(`Error deleting bucket with ID ${id}:`, error);
      throw new BadRequestException('Failed to delete bucket.');
    } finally {
      connection.release();
    }
  }
}
