import { ConfigService } from "@nestjs/config";
import { DataSource, DataSourceOptions } from "typeorm";
import { Customer } from "./entities/customer.entity";
import { Employee } from "./entities/employee.entity";
import { CarWash } from "./entities/car-wash.entity";
import { Service } from "./entities/service.entity";
import { User } from "./entities/user.entity";
import { Vehicle } from "./entities/vehicle.entity";

const configService = new ConfigService();

export const DatabaseDataSource: DataSourceOptions = {
  type: "postgres",
  host: configService.get<string>("DB_HOST", "localhost"),
  port: configService.get<number>("DB_PORT", 5432),
  username: configService.get<string>("DB_USERNAME", "postgres"),
  password: configService.get<string>("DB_PASSWORD", "postgres"),
  database: configService.get<string>("DB_NAME", "car_wish"),
  entities: [User, Customer, Vehicle, Employee, Service, CarWash],
  migrations: [__dirname + "/migrations/*.ts"],
  synchronize: false,
};

const dataSource = new DataSource(DatabaseDataSource);
export default dataSource;
