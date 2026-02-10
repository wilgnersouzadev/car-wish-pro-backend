import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private minioClient: Minio.Client;
  private readonly buckets = ['car-washes', 'shops'];

  constructor(private configService: ConfigService) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT'),
      port: parseInt(this.configService.get<string>('MINIO_PORT')),
      useSSL: this.configService.get<string>('MINIO_USE_SSL') === 'true',
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY'),
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY'),
    });
  }

  async onModuleInit() {
    await this.ensureBucketsExist();
  }

  private async ensureBucketsExist() {
    for (const bucket of this.buckets) {
      try {
        const exists = await this.minioClient.bucketExists(bucket);
        if (!exists) {
          await this.minioClient.makeBucket(bucket, 'us-east-1');
          this.logger.log(`Bucket ${bucket} created successfully`);
        }

        // Always set public read policy for car-washes and shops buckets
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${bucket}/*`],
            },
          ],
        };
        await this.minioClient.setBucketPolicy(bucket, JSON.stringify(policy));
        this.logger.log(`Bucket ${bucket} policy set successfully`);
      } catch (error) {
        this.logger.error(`Error ensuring bucket ${bucket} exists:`, error);
      }
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    bucket: string,
    filename: string,
  ): Promise<string> {
    try {
      await this.minioClient.putObject(
        bucket,
        filename,
        file.buffer,
        file.size,
        {
          'Content-Type': file.mimetype,
        },
      );

      return filename;
    } catch (error) {
      this.logger.error('Error uploading file:', error);
      throw new Error('Failed to upload file');
    }
  }

  async getFileUrl(bucket: string, filename: string): Promise<string> {
    try {
      const externalEndpoint = this.configService.get<string>('MINIO_EXTERNAL_ENDPOINT');
      const externalPort = this.configService.get<string>('MINIO_EXTERNAL_PORT');
      const useSSL = this.configService.get<string>('MINIO_EXTERNAL_USE_SSL') === 'true';
      const protocol = useSSL ? 'https' : 'http';

      return `${protocol}://${externalEndpoint}:${externalPort}/${bucket}/${filename}`;
    } catch (error) {
      this.logger.error('Error generating file URL:', error);
      throw new Error('Failed to generate file URL');
    }
  }

  async deleteFile(bucket: string, filename: string): Promise<void> {
    try {
      await this.minioClient.removeObject(bucket, filename);
      this.logger.log(`File ${filename} deleted from ${bucket}`);
    } catch (error) {
      this.logger.error('Error deleting file:', error);
      throw new Error('Failed to delete file');
    }
  }

  async getFile(bucket: string, filename: string): Promise<Buffer> {
    try {
      const dataStream = await this.minioClient.getObject(bucket, filename);
      const chunks: Buffer[] = [];

      return new Promise((resolve, reject) => {
        dataStream.on('data', (chunk) => chunks.push(chunk));
        dataStream.on('end', () => resolve(Buffer.concat(chunks)));
        dataStream.on('error', reject);
      });
    } catch (error) {
      this.logger.error('Error getting file:', error);
      throw new Error('Failed to get file');
    }
  }

  async statFile(bucket: string, filename: string): Promise<Minio.BucketItemStat> {
    try {
      return await this.minioClient.statObject(bucket, filename);
    } catch (error) {
      this.logger.error('Error getting file stats:', error);
      throw new Error('Failed to get file stats');
    }
  }
}
