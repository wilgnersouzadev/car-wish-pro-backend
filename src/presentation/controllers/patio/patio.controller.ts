import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PatioService } from '../../../core/application/services/patio/patio.service';
import { ShopId } from '../../../core/application/decorators/shop-id.decorator';

@ApiTags('Patio')
@Controller('patio')
export class PatioController {
  constructor(private readonly patioService: PatioService) {}

  @Get('board')
  @ApiOperation({ summary: 'Obter board do pátio com lavagens do dia' })
  @ApiResponse({ status: 200, description: 'Board com lavagens agrupadas por status' })
  async getBoard(@ShopId() shopId: number) {
    return this.patioService.getBoard(shopId);
  }
}
