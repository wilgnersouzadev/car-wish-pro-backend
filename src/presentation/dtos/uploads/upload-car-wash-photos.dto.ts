import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum PhotoType {
  BEFORE = 'before',
  AFTER = 'after',
}

export class UploadCarWashPhotosDTO {
  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'Array of photos (max 10 photos)',
  })
  files: Express.Multer.File[];

  @ApiProperty({
    enum: PhotoType,
    description: 'Type of photos: before or after',
  })
  @IsEnum(PhotoType)
  type: PhotoType;
}
