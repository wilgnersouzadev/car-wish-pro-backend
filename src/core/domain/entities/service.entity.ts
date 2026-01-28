import { Column, Entity } from "typeorm";
import { BaseEntity } from "./base-entity.entity";

@Entity("services")
export class Service extends BaseEntity {
  @Column({ length: 255 })
  name: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  value: number;

  @Column({ length: 10, nullable: true })
  icon?: string;

  @Column({ default: true })
  active: boolean;
}
