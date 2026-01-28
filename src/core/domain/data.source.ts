import { ConfigService } from "@nestjs/config";
import { DataSource, DataSourceOptions } from "typeorm";
import { Customer } from "./entities/customer.entity";
import { CarWash } from "./entities/car-wash.entity";
import { Service } from "./entities/service.entity";
import { User } from "./entities/user.entity";
import { Vehicle } from "./entities/vehicle.entity";
import { Shop } from "./entities/shop.entity";

const configService = new ConfigService();

export const DatabaseDataSource: DataSourceOptions = {
  type: "postgres",
  host: configService.get<string>("DB_HOST", "database"),
  port: configService.get<number>("DB_PORT", 5432),
  username: configService.get<string>("DB_USERNAME", "postgres"),
  password: configService.get<string>("DB_PASSWORD", "postgres"),
  database: configService.get<string>("DB_NAME", "car_wish"),
  entities: [User, Customer, Vehicle, Service, CarWash, Shop],
  migrations: [__dirname + "/migrations/*.ts"],
  synchronize: false,
};

const dataSource = new DataSource(DatabaseDataSource);
export default dataSource;
