import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  Res,
  Body,
  ParseEnumPipe,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { Response } from 'express';
import { StorageService } from 'src/core/application/services/storage/storage.service';
import { CarWashService } from 'src/core/application/services/washing/washing.service';
import { ShopService } from 'src/core/application/services/shop/shop.service';
import { ShopId } from 'src/core/application/decorators/shop-id.decorator';
import { PhotoType } from 'src/presentation/dtos/uploads/upload-car-wash-photos.dto';

@ApiTags('Uploads')
@Controller('uploads')
@ApiBearerAuth()
export class UploadsController {
  constructor(
    private readonly storageService: StorageService,
    private readonly carWashService: CarWashService,
    private readonly shopService: ShopService,
  ) {}

  @Post('car-wash/:id/photos')
  @ApiOperation({ summary: 'Upload fotos de uma lavagem' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['before', 'after'],
          description: 'Tipo de fotos: before ou after',
        },
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadCarWashPhotos(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Express.Multer.File[],
    @Body('type', new ParseEnumPipe(PhotoType)) type: PhotoType,
    @ShopId() shopId: number,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const maxSize = 5 * 1024 * 1024;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

    for (const file of files) {
      if (file.size > maxSize) {
        throw new BadRequestException(
          `File ${file.originalname} exceeds 5MB limit`,
        );
      }
      if (!allowedTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          `File ${file.originalname} is not a valid image type`,
        );
      }
    }

    const carWash = await this.carWashService.findOne(id, shopId);

    const uploadedUrls: string[] = [];
    for (const file of files) {
      const filename = `${id}-${type}-${Date.now()}-${file.originalname}`;
      await this.storageService.uploadFile(file, 'car-washes', filename);
      const url = await this.storageService.getFileUrl('car-washes', filename);
      uploadedUrls.push(url);
    }

    await this.carWashService.addPhotos(id, uploadedUrls, type, shopId);

    return {
      message: 'Photos uploaded successfully',
      urls: uploadedUrls,
    };
  }

  @Delete('car-wash/:id/photos/:photoUrl')
  @ApiOperation({ summary: 'Deletar foto de uma lavagem' })
  async deleteCarWashPhoto(
    @Param('id', ParseIntPipe) id: number,
    @Param('photoUrl') photoUrl: string,
    @ShopId() shopId: number,
  ) {
    const carWash = await this.carWashService.findOne(id, shopId);

    const filename = photoUrl.split('/').pop();

    await this.storageService.deleteFile('car-washes', filename);

    await this.carWashService.removePhoto(id, photoUrl, shopId);

    return {
      message: 'Photo deleted successfully',
    };
  }

  @Post('shop/:id/logo')
  @ApiOperation({ summary: 'Upload logo de uma loja' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadShopLogo(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @ShopId() shopId: number,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const maxSize = 5 * 1024 * 1024;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

    if (file.size > maxSize) {
      throw new BadRequestException('File exceeds 5MB limit');
    }
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('File is not a valid image type');
    }

    if (id !== shopId) {
      throw new BadRequestException('Cannot upload logo for another shop');
    }

    const shop = await this.shopService.findOne(id);
    if (shop.logoUrl) {
      const oldFilename = shop.logoUrl.split('/').pop();
      try {
        await this.storageService.deleteFile('shops', oldFilename);
      } catch (error) {
        console.error('Error deleting old logo:', error);
      }
    }

    const filename = `shop-${id}-logo-${Date.now()}-${file.originalname}`;
    await this.storageService.uploadFile(file, 'shops', filename);
    const url = await this.storageService.getFileUrl('shops', filename);

    await this.shopService.updateLogo(id, url);

    return {
      message: 'Logo uploaded successfully',
      url,
    };
  }

  @Delete('shop/:id/logo')
  @ApiOperation({ summary: 'Deletar logo de uma loja' })
  async deleteShopLogo(
    @Param('id', ParseIntPipe) id: number,
    @ShopId() shopId: number,
  ) {
    if (id !== shopId) {
      throw new BadRequestException('Cannot delete logo for another shop');
    }

    const shop = await this.shopService.findOne(id);
    if (!shop.logoUrl) {
      throw new BadRequestException('Shop does not have a logo');
    }

    const filename = shop.logoUrl.split('/').pop();

    await this.storageService.deleteFile('shops', filename);

    await this.shopService.updateLogo(id, null);

    return {
      message: 'Logo deleted successfully',
    };
  }

  @Get(':bucket/:filename')
  @ApiOperation({ summary: 'Obter imagem' })
  async getFile(
    @Param('bucket') bucket: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    try {
      const stat = await this.storageService.statFile(bucket, filename);
      const file = await this.storageService.getFile(bucket, filename);

      res.setHeader('Content-Type', stat.metaData['content-type']);
      res.setHeader('Content-Length', stat.size);
      res.send(file);
    } catch (error) {
      throw new BadRequestException('File not found');
    }
  }
}
