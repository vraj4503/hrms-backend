import { Controller, Post, Get, Body, Put, Param, Query, Delete } from '@nestjs/common';
import { BucketService } from './bucket.service';
import { Bucket } from './bucket.entity';

@Controller('bucket')
export class BucketController {
  constructor(private readonly bucketService: BucketService) {}

  @Post()
  async createBucket(@Body() bucket: Partial<Bucket>): Promise<Bucket> {
    return this.bucketService.createBucket(bucket);
  }

  @Get()
  async getAllBuckets(@Query('cid') cid?: number): Promise<Bucket[]> {
    return this.bucketService.getAllBuckets(cid);
  }

  @Put(':id')
  async updateBucket(
    @Param('id') id: number,
    @Body() bucket: Partial<Bucket>
  ): Promise<Bucket> {
    return this.bucketService.updateBucket(id, bucket);
  }

  @Delete(':id')
  async deleteBucket(@Param('id') id: number): Promise<{ success: boolean; message: string }> {
    await this.bucketService.deleteBucket(id);
    return { success: true, message: `Bucket with ID ${id} deleted successfully.` };
  }
}
