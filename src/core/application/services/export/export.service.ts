import { Injectable } from "@nestjs/common";
import PDFDocument from "pdfkit";
import * as ExcelJS from "exceljs";
import { CarWash } from "src/core/domain/entities/car-wash.entity";

export interface ReportData {
  carWashes: CarWash[];
  shopName: string;
  startDate: Date;
  endDate: Date;
}

@Injectable()
export class ExportService {
  async generatePdfReport(data: ReportData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: "A4", margin: 50 });
        const chunks: Buffer[] = [];

        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", reject);

        doc
          .fontSize(20)
          .fillColor("#1e40af")
          .text("Relatório de Lavagens", { align: "center" });

        doc.moveDown(0.5);

        doc
          .fontSize(12)
          .fillColor("#000000")
          .text(`Loja: ${data.shopName}`, { align: "center" });

        doc
          .fontSize(10)
          .fillColor("#6b7280")
          .text(
            `Período: ${data.startDate.toLocaleDateString("pt-BR")} a ${data.endDate.toLocaleDateString("pt-BR")}`,
            { align: "center" }
          );

        doc
          .fontSize(8)
          .text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, {
            align: "center",
          });

        doc.moveDown(2);

        const totalLavagens = data.carWashes.length;
        const faturamentoTotal = data.carWashes
          .filter((w) => w.paymentStatus === "paid")
          .reduce((sum, w) => sum + Number(w.amount), 0);
        const ticketMedio = totalLavagens > 0 ? faturamentoTotal / totalLavagens : 0;

        const lavagensCompletas = data.carWashes.filter(
          (w) => w.serviceType === "full"
        ).length;
        const lavagensSimples = data.carWashes.filter(
          (w) => w.serviceType === "basic"
        ).length;
        const polimentos = data.carWashes.filter(
          (w) => w.serviceType === "polish"
        ).length;

        const startY = doc.y;
        doc.rect(50, startY, 495, 100).fillAndStroke("#f3f4f6", "#d1d5db");

        doc.fillColor("#000000");
        doc.fontSize(14).text("Resumo Geral", 70, startY + 15);

        doc.fontSize(10);
        const col1X = 70;
        const col2X = 280;
        const valueY = startY + 40;

        doc.text("Total de Lavagens:", col1X, valueY);
        doc.text(totalLavagens.toString(), col1X + 130, valueY, { width: 100 });

        doc.text("Faturamento Total:", col2X, valueY);
        doc.text(
          `R$ ${faturamentoTotal.toFixed(2).replace(".", ",")}`,
          col2X + 130,
          valueY
        );

        doc.text("Ticket Médio:", col1X, valueY + 20);
        doc.text(
          `R$ ${ticketMedio.toFixed(2).replace(".", ",")}`,
          col1X + 130,
          valueY + 20
        );

        doc.text("Lavagens Completas:", col2X, valueY + 20);
        doc.text(lavagensCompletas.toString(), col2X + 130, valueY + 20);

        doc.text("Lavagens Simples:", col1X, valueY + 40);
        doc.text(lavagensSimples.toString(), col1X + 130, valueY + 40);

        doc.text("Polimentos:", col2X, valueY + 40);
        doc.text(polimentos.toString(), col2X + 130, valueY + 40);

        doc.y = startY + 120;
        doc.moveDown(2);

        doc.fontSize(14).fillColor("#1e40af").text("Detalhamento das Lavagens");
        doc.moveDown(1);

        const tableTop = doc.y;
        const colWidths = {
          data: 85,
          placa: 70,
          servico: 80,
          valor: 70,
          pagamento: 75,
          status: 70,
        };

        doc.fontSize(8).fillColor("#374151");

        doc
          .rect(50, tableTop, 495, 20)
          .fillAndStroke("#e5e7eb", "#d1d5db");

        doc.fillColor("#000000");
        let x = 55;
        doc.text("Data/Hora", x, tableTop + 7);
        x += colWidths.data;
        doc.text("Placa", x, tableTop + 7);
        x += colWidths.placa;
        doc.text("Serviço", x, tableTop + 7);
        x += colWidths.servico;
        doc.text("Valor", x, tableTop + 7);
        x += colWidths.valor;
        doc.text("Pagamento", x, tableTop + 7);
        x += colWidths.pagamento;
        doc.text("Status", x, tableTop + 7);

        let yPos = tableTop + 25;

        const sortedWashes = [...data.carWashes].sort(
          (a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
        );

        for (const wash of sortedWashes) {
          if (yPos > 700) {
            doc.addPage();
            yPos = 50;
          }

          const serviceTypeMap: Record<string, string> = {
            basic: "Simples",
            full: "Completa",
            polish: "Polimento",
          };

          const paymentMethodMap: Record<string, string> = {
            cash: "Dinheiro",
            pix: "PIX",
            card: "Cartão",
          };

          const statusMap: Record<string, string> = {
            paid: "Pago",
            pending: "Pendente",
          };

          x = 55;
          doc.fontSize(7).fillColor("#374151");
          doc.text(
            new Date(wash.dateTime).toLocaleString("pt-BR"),
            x,
            yPos,
            { width: colWidths.data - 5 }
          );
          x += colWidths.data;
          doc.text(wash.vehicle?.licensePlate || "-", x, yPos, {
            width: colWidths.placa - 5,
          });
          x += colWidths.placa;
          doc.text(serviceTypeMap[wash.serviceType] || wash.serviceType, x, yPos, {
            width: colWidths.servico - 5,
          });
          x += colWidths.servico;
          doc.text(`R$ ${Number(wash.amount).toFixed(2).replace(".", ",")}`, x, yPos, {
            width: colWidths.valor - 5,
          });
          x += colWidths.valor;
          doc.text(
            paymentMethodMap[wash.paymentMethod] || wash.paymentMethod,
            x,
            yPos,
            { width: colWidths.pagamento - 5 }
          );
          x += colWidths.pagamento;
          doc.text(statusMap[wash.paymentStatus] || wash.paymentStatus, x, yPos, {
            width: colWidths.status - 5,
          });

          yPos += 18;
        }

        doc
          .fontSize(8)
          .fillColor("#9ca3af")
          .text(
            `Car Wish - Sistema de Gestão de Lava-Jato`,
            50,
            doc.page.height - 50,
            { align: "center" }
          );

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  async generateExcelReport(data: ReportData): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Car Wish";
    workbook.created = new Date();

    const summarySheet = workbook.addWorksheet("Resumo");

    summarySheet.mergeCells("A1:D1");
    const titleCell = summarySheet.getCell("A1");
    titleCell.value = "Relatório de Lavagens";
    titleCell.font = { size: 18, bold: true, color: { argb: "FF1e40af" } };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };

    summarySheet.getRow(2).values = ["Loja:", data.shopName];
    summarySheet.getRow(3).values = [
      "Período:",
      `${data.startDate.toLocaleDateString("pt-BR")} a ${data.endDate.toLocaleDateString("pt-BR")}`,
    ];
    summarySheet.getRow(4).values = [
      "Gerado em:",
      new Date().toLocaleString("pt-BR"),
    ];

    const totalLavagens = data.carWashes.length;
    const faturamentoTotal = data.carWashes
      .filter((w) => w.paymentStatus === "paid")
      .reduce((sum, w) => sum + Number(w.amount), 0);
    const ticketMedio = totalLavagens > 0 ? faturamentoTotal / totalLavagens : 0;

    const lavagensCompletas = data.carWashes.filter(
      (w) => w.serviceType === "full"
    ).length;
    const lavagensSimples = data.carWashes.filter(
      (w) => w.serviceType === "basic"
    ).length;
    const polimentos = data.carWashes.filter(
      (w) => w.serviceType === "polish"
    ).length;

    summarySheet.addRow([]);
    summarySheet.addRow(["Indicador", "Valor"]);
    const headerRow = summarySheet.getRow(6);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFe5e7eb" },
    };

    summarySheet.addRow(["Total de Lavagens", totalLavagens]);
    summarySheet.addRow(["Faturamento Total", faturamentoTotal]);
    summarySheet.addRow(["Ticket Médio", ticketMedio]);
    summarySheet.addRow(["Lavagens Simples", lavagensSimples]);
    summarySheet.addRow(["Lavagens Completas", lavagensCompletas]);
    summarySheet.addRow(["Polimentos", polimentos]);

    summarySheet.getCell("B8").numFmt = 'R$ #,##0.00';
    summarySheet.getCell("B9").numFmt = 'R$ #,##0.00';

    summarySheet.getColumn(1).width = 25;
    summarySheet.getColumn(2).width = 20;

    const detailSheet = workbook.addWorksheet("Lavagens Detalhadas");

    detailSheet.columns = [
      { header: "Data/Hora", key: "dateTime", width: 20 },
      { header: "Cliente", key: "customer", width: 25 },
      { header: "Placa", key: "plate", width: 12 },
      { header: "Veículo", key: "vehicle", width: 25 },
      { header: "Tipo de Serviço", key: "serviceType", width: 18 },
      { header: "Valor", key: "amount", width: 15 },
      { header: "Forma de Pagamento", key: "paymentMethod", width: 20 },
      { header: "Status", key: "paymentStatus", width: 12 },
      { header: "Observações", key: "notes", width: 30 },
    ];

    const detailHeaderRow = detailSheet.getRow(1);
    detailHeaderRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    detailHeaderRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1e40af" },
    };
    detailHeaderRow.alignment = { horizontal: "center", vertical: "middle" };

    const serviceTypeMap: Record<string, string> = {
      basic: "Simples",
      full: "Completa",
      polish: "Polimento",
    };

    const paymentMethodMap: Record<string, string> = {
      cash: "Dinheiro",
      pix: "PIX",
      card: "Cartão",
    };

    const statusMap: Record<string, string> = {
      paid: "Pago",
      pending: "Pendente",
    };

    const sortedWashes = [...data.carWashes].sort(
      (a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
    );

    sortedWashes.forEach((wash) => {
      detailSheet.addRow({
        dateTime: new Date(wash.dateTime).toLocaleString("pt-BR"),
        customer: wash.customer?.name || "-",
        plate: wash.vehicle?.licensePlate || "-",
        vehicle: wash.vehicle
          ? `${wash.vehicle.model} (${wash.vehicle.color})`
          : "-",
        serviceType: serviceTypeMap[wash.serviceType] || wash.serviceType,
        amount: Number(wash.amount),
        paymentMethod:
          paymentMethodMap[wash.paymentMethod] || wash.paymentMethod,
        paymentStatus: statusMap[wash.paymentStatus] || wash.paymentStatus,
        notes: wash.notes || "",
      });
    });

    detailSheet.getColumn("amount").numFmt = 'R$ #,##0.00';

    const commissionSheet = workbook.addWorksheet("Comissões por Funcionário");

    commissionSheet.columns = [
      { header: "Funcionário", key: "employee", width: 30 },
      { header: "Total de Lavagens", key: "totalWashes", width: 20 },
      { header: "Valor Total", key: "totalAmount", width: 18 },
      { header: "Comissão (10%)", key: "commission", width: 18 },
    ];

    const commHeaderRow = commissionSheet.getRow(1);
    commHeaderRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    commHeaderRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF10b981" },
    };
    commHeaderRow.alignment = { horizontal: "center", vertical: "middle" };

    const employeeStats = new Map<
      number,
      { name: string; washes: number; total: number }
    >();

    data.carWashes.forEach((wash) => {
      if (wash.employees && wash.employees.length > 0) {
        wash.employees.forEach((emp) => {
          const existing = employeeStats.get(emp.id) || {
            name: emp.name,
            washes: 0,
            total: 0,
          };
          existing.washes++;
          if (wash.paymentStatus === "paid") {
            existing.total += Number(wash.amount) / wash.employees.length;
          }
          employeeStats.set(emp.id, existing);
        });
      }
    });

    Array.from(employeeStats.values())
      .sort((a, b) => b.total - a.total)
      .forEach((emp) => {
        const commission = emp.total * 0.1;
        commissionSheet.addRow({
          employee: emp.name,
          totalWashes: emp.washes,
          totalAmount: emp.total,
          commission: commission,
      });
    });

    commissionSheet.getColumn("totalAmount").numFmt = 'R$ #,##0.00';
    commissionSheet.getColumn("commission").numFmt = 'R$ #,##0.00';

    if (employeeStats.size > 0) {
      const totalRow = commissionSheet.lastRow.number + 2;
      commissionSheet.getCell(`A${totalRow}`).value = "TOTAL";
      commissionSheet.getCell(`A${totalRow}`).font = { bold: true };

      const totalWashes = Array.from(employeeStats.values()).reduce(
        (sum, emp) => sum + emp.washes,
        0
      );
      const totalAmount = Array.from(employeeStats.values()).reduce(
        (sum, emp) => sum + emp.total,
        0
      );
      const totalCommission = totalAmount * 0.1;

      commissionSheet.getCell(`B${totalRow}`).value = totalWashes;
      commissionSheet.getCell(`C${totalRow}`).value = totalAmount;
      commissionSheet.getCell(`D${totalRow}`).value = totalCommission;

      commissionSheet.getCell(`C${totalRow}`).numFmt = 'R$ #,##0.00';
      commissionSheet.getCell(`D${totalRow}`).numFmt = 'R$ #,##0.00';
    }

    return await workbook.xlsx.writeBuffer() as unknown as Buffer;
  }
}
