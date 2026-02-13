import { Controller, Get, Param, Patch, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TrackingService } from '../../../core/application/services/tracking/tracking.service';
import { WashStatus } from '../../../core/domain/entities/car-wash.entity';
import { Public } from '../../../core/application/decorators/public.decorator';

@ApiTags('Tracking')
@Controller('tracking')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Public()
  @Get(':token')
  @ApiOperation({ summary: 'Buscar lavagem por token de rastreamento (público)' })
  @ApiParam({ name: 'token', description: 'Token de rastreamento único' })
  @ApiResponse({ status: 200, description: 'Detalhes da lavagem' })
  @ApiResponse({ status: 404, description: 'Lavagem não encontrada' })
  async getByToken(@Param('token') token: string) {
    return this.trackingService.getByTrackingToken(token);
  }

  @Patch(':token/status')
  @ApiOperation({ summary: 'Atualizar status da lavagem' })
  @ApiParam({ name: 'token', description: 'Token de rastreamento' })
  @ApiResponse({ status: 200, description: 'Status atualizado' })
  @ApiResponse({ status: 404, description: 'Lavagem não encontrada' })
  async updateStatus(
    @Param('token') token: string,
    @Body('status') status: WashStatus,
  ) {
    return this.trackingService.updateStatus(token, status);
  }
}
