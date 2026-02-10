import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { CarWashService } from "src/core/application/services/washing/washing.service";
import { UserService } from "src/core/application/services/user/user.service";
import { ShopId } from "src/core/application/decorators/shop-id.decorator";
import { CurrentUser } from "src/core/application/decorators/current-user.decorator";
import { RolesGuard, Roles } from "src/core/application/guards/roles.guard";
import { UserRole } from "src/core/domain/entities/user.entity";
import { ServiceType } from "src/core/domain/entities/car-wash.entity";

function defaultPeriod(): { start: Date; end: Date } {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

function parsePeriod(startDate?: string, endDate?: string): { start: Date; end: Date } {
  if (startDate && endDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }
  return defaultPeriod();
}

function buildWashesByType(washes: { serviceType: string }[]): Record<string, number> {
  const counts = { [ServiceType.BASIC]: 0, [ServiceType.FULL]: 0, [ServiceType.POLISH]: 0 };
  washes.forEach((w) => {
    if (counts[w.serviceType] !== undefined) counts[w.serviceType]++;
  });
  return counts;
}

function buildCommissionsForEmployees(
  employees: { id: number; commissionType?: string; commissionValue?: number }[],
  paidWashes: { amount: number; employees: { id: number }[] }[],
) {
  return employees.map((employee) => {
    const employeeWashes = paidWashes.filter((wash) =>
      wash.employees.some((e) => e.id === employee.id),
    );
    const totalCommission = employeeWashes.reduce((sum, wash) => {
      if (!employee.commissionType || employee.commissionValue == null) return sum;
      const commission =
        employee.commissionType === "percentage"
          ? (Number(wash.amount) * Number(employee.commissionValue)) / 100
          : Number(employee.commissionValue);
      return sum + commission;
    }, 0);
    return { employee, commission: totalCommission };
  });
}

@ApiTags("Dashboard")
@Controller("dashboard")
@ApiBearerAuth()
export class DashboardController {
  constructor(
    private readonly carWashService: CarWashService,
    private readonly userService: UserService,
  ) {}

  @Get("summary")
  @ApiOperation({
    summary: "Resumo do dashboard",
    description:
      "Admin/Employee: resumo da loja atual. Super admin sem shopId: resumo de todas as lojas.",
  })
  @ApiQuery({ name: "startDate", required: false, description: "Início do período (ISO)" })
  @ApiQuery({ name: "endDate", required: false, description: "Fim do período (ISO)" })
  async getSummary(
    @ShopId() shopId: number | null,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    const { start, end } = parsePeriod(startDate, endDate);

    if (shopId == null) {
      const washes = await this.carWashService.findByDateRangeAllShops(start, end, null);
      const byShop = new Map<number, typeof washes>();
      washes.forEach((w) => {
        const list = byShop.get(w.shopId) || [];
        list.push(w);
        byShop.set(w.shopId, list);
      });

      const shopsSummary: Array<{
        shopId: number;
        shopName: string;
        totalCars: number;
        revenue: number;
        totalCommissions: number;
        commissions: Array<{ employee: unknown; commission: number }>;
        washesByType: Record<string, number>;
        lastWashes: unknown[];
      }> = [];

      let globalCars = 0;
      let globalRevenue = 0;
      let globalCommissions = 0;

      for (const [sid, shopWashes] of byShop) {
        const paidWashes = shopWashes.filter((w) => w.paymentStatus === "paid");
        const employees = await this.userService.findEmployees(sid);
        const commissions = buildCommissionsForEmployees(employees, paidWashes);
        const totalCommissions = commissions.reduce((s, c) => s + c.commission, 0);
        const shopName = (shopWashes[0] as any)?.shop?.name ?? `Loja ${sid}`;

        shopsSummary.push({
          shopId: sid,
          shopName,
          totalCars: shopWashes.length,
          revenue: paidWashes.reduce((s, w) => s + Number(w.amount), 0),
          totalCommissions,
          commissions,
          washesByType: buildWashesByType(shopWashes),
          lastWashes: shopWashes.slice(0, 5),
        });
        globalCars += shopWashes.length;
        globalRevenue += paidWashes.reduce((s, w) => s + Number(w.amount), 0);
        globalCommissions += totalCommissions;
      }

      return {
        period: { startDate: start, endDate: end },
        shops: shopsSummary,
        global: { totalCars: globalCars, revenue: globalRevenue, totalCommissions: globalCommissions },
      };
    }

    const washes = await this.carWashService.findByDateRange(start, end, shopId);
    const paidWashes = washes.filter((w) => w.paymentStatus === "paid");
    const employees = await this.userService.findEmployees(shopId);
    const commissions = buildCommissionsForEmployees(employees, paidWashes);
    const totalCommissions = commissions.reduce((sum, c) => sum + c.commission, 0);

    return {
      period: { startDate: start, endDate: end },
      totalCars: washes.length,
      revenue: paidWashes.reduce((sum, w) => sum + Number(w.amount), 0),
      totalCommissions,
      commissions,
      washesByType: buildWashesByType(washes),
      lastWashes: washes.slice(0, 5),
    };
  }

  @Get("me")
  @UseGuards(RolesGuard)
  @Roles(UserRole.EMPLOYEE)
  @ApiOperation({
    summary: "Dashboard do funcionário",
    description: "Minhas lavagens, veículos lavados e minhas comissões no período.",
  })
  @ApiQuery({ name: "startDate", required: false })
  @ApiQuery({ name: "endDate", required: false })
  async getMyDashboard(
    @CurrentUser() user: { sub: number },
    @ShopId() shopId: number,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    const { start, end } = parsePeriod(startDate, endDate);
    const myWashes = await this.carWashService.findMyWashes(user.sub, shopId, start, end);
    const paidWashes = myWashes.filter((w) => w.paymentStatus === "paid");
    const me = await this.userService.findMe(user.sub);
    let myCommission = 0;
    if (me?.commissionType && me?.commissionValue != null) {
      myCommission = paidWashes.reduce((sum, wash) => {
        const commission =
          me.commissionType === "percentage"
            ? (Number(wash.amount) * Number(me.commissionValue)) / 100
            : Number(me.commissionValue);
        return sum + commission;
      }, 0);
    }
    return {
      period: { startDate: start, endDate: end },
      myWashes,
      vehiclesWashed: myWashes.length,
      washesByType: buildWashesByType(myWashes),
      myCommission,
    };
  }

  @Get("charts")
  @ApiOperation({
    summary: "Dados para gráficos do dashboard",
    description: "Retorna séries temporais de receita e lavagens por tipo.",
  })
  @ApiQuery({ name: "days", required: false, description: "Número de dias (padrão: 7)" })
  async getCharts(@ShopId() shopId: number | null, @Query("days") days?: string) {
    const numDays = days ? Number.parseInt(days, 10) : 7;
    return await this.carWashService.getChartData(shopId, numDays);
  }
}
