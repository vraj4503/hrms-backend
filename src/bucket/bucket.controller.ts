import { Controller, Post, Get, Body, Put, Param, Query } from '@nestjs/common';
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
}
