import { Column, Entity } from "typeorm";
import { BaseEntity } from "./base-entity.entity";

@Entity("users")
export class User extends BaseEntity {
  @Column({ length: 255 })
  name: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 255, select: false })
  password: string;

  @Column({ default: true })
  isActive: boolean;
}
