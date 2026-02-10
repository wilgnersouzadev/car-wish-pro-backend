import { ApiProperty } from '@nestjs/swagger';

export class UploadShopLogoDTO {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Shop logo image file',
  })
  file: Express.Multer.File;
}
