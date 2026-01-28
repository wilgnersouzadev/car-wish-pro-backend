import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { CarWashService } from "src/core/application/services/washing/washing.service";
import { UserService } from "src/core/application/services/user/user.service";
import { ShopId } from "src/core/application/decorators/shop-id.decorator";

@ApiTags("Dashboard")
@Controller("dashboard")
@ApiBearerAuth()
export class DashboardController {
  constructor(
    private readonly carWashService: CarWashService,
    private readonly userService: UserService,
  ) {}

  @Get("summary")
  @ApiOperation({ summary: "Resumo do dashboard" })
  async getSummary(@ShopId() shopId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const washesToday = await this.carWashService.findByDateRange(today, tomorrow, shopId);
    const paidWashes = washesToday.filter((wash) => wash.paymentStatus === "paid");

    const totalCars = washesToday.length;
    const revenue = paidWashes.reduce((sum, wash) => sum + Number(wash.amount), 0);

    const employees = await this.userService.findEmployees(shopId);
    const commissions = employees.map((employee) => {
      const employeeWashes = paidWashes.filter((wash) =>
        wash.employees.some((w) => w.id === employee.id),
      );

      const totalCommission = employeeWashes.reduce((sum, wash) => {
        if (!employee.commissionType || employee.commissionValue == null) return sum;
        const commission =
          employee.commissionType === "percentage"
            ? (Number(wash.amount) * Number(employee.commissionValue)) / 100
            : Number(employee.commissionValue);
        return sum + commission;
      }, 0);

      return {
        employee,
        commission: totalCommission,
      };
    });

    const totalCommissions = commissions.reduce((sum, c) => sum + c.commission, 0);

    return {
      totalCars,
      revenue,
      totalCommissions,
      commissions,
      lastWashes: washesToday.slice(0, 5),
    };
  }
}
