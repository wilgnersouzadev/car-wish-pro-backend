import {
  Controller,
  Get,
  Query,
  Res,
  BadRequestException,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { Response } from "express";
import { ExportService } from "src/core/application/services/export/export.service";
import { CarWashService } from "src/core/application/services/washing/washing.service";
import { ShopService } from "src/core/application/services/shop/shop.service";
import { ShopId } from "src/core/application/decorators/shop-id.decorator";

@ApiTags("Reports")
@Controller("reports")
@ApiBearerAuth()
export class ReportsController {
  constructor(
    private readonly exportService: ExportService,
    private readonly carWashService: CarWashService,
    private readonly shopService: ShopService,
  ) {}

  @Get("export/pdf")
  @ApiOperation({ summary: "Exportar relatório em PDF" })
  @ApiQuery({ name: "startDate", required: true, type: String })
  @ApiQuery({ name: "endDate", required: true, type: String })
  @ApiQuery({ name: "shopId", required: false, type: Number })
  async exportPdf(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
    @Query("shopId") shopId: string,
    @ShopId() contextShopId: number,
    @Res() res: Response,
  ): Promise<void> {
    if (!startDate || !endDate) {
      throw new BadRequestException("startDate e endDate são obrigatórios");
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException("Datas inválidas");
    }

    // Se shopId foi passado na query, usa ele, senão usa o contexto
    const targetShopId = shopId ? Number(shopId) : contextShopId;

    // Buscar dados
    const carWashes = await this.carWashService.findByDateRangeAllShops(
      start,
      end,
      targetShopId,
    );

    let shopName = "Todas as lojas";
    if (targetShopId) {
      const shop = await this.shopService.findOne(targetShopId);
      shopName = shop?.name || "Loja desconhecida";
    }

    // Gerar PDF
    const pdfBuffer = await this.exportService.generatePdfReport({
      carWashes,
      shopName,
      startDate: start,
      endDate: end,
    });

    // Enviar arquivo
    const filename = `relatorio-lavagens-${start.toISOString().split("T")[0]}-${end.toISOString().split("T")[0]}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    res.send(pdfBuffer);
  }

  @Get("export/excel")
  @ApiOperation({ summary: "Exportar relatório em Excel" })
  @ApiQuery({ name: "startDate", required: true, type: String })
  @ApiQuery({ name: "endDate", required: true, type: String })
  @ApiQuery({ name: "shopId", required: false, type: Number })
  async exportExcel(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
    @Query("shopId") shopId: string,
    @ShopId() contextShopId: number,
    @Res() res: Response,
  ): Promise<void> {
    if (!startDate || !endDate) {
      throw new BadRequestException("startDate e endDate são obrigatórios");
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException("Datas inválidas");
    }

    // Se shopId foi passado na query, usa ele, senão usa o contexto
    const targetShopId = shopId ? Number(shopId) : contextShopId;

    // Buscar dados
    const carWashes = await this.carWashService.findByDateRangeAllShops(
      start,
      end,
      targetShopId,
    );

    let shopName = "Todas as lojas";
    if (targetShopId) {
      const shop = await this.shopService.findOne(targetShopId);
      shopName = shop?.name || "Loja desconhecida";
    }

    // Gerar Excel
    const excelBuffer = await this.exportService.generateExcelReport({
      carWashes,
      shopName,
      startDate: start,
      endDate: end,
    });

    // Enviar arquivo
    const filename = `relatorio-lavagens-${start.toISOString().split("T")[0]}-${end.toISOString().split("T")[0]}.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", excelBuffer.length);
    res.send(excelBuffer);
  }
}
