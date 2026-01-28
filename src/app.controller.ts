import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("App")
@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return "Car Wish API - Sistema de Gestão de Lava-Jato";
  }

  @Get("health")
  getHealth() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }
}
