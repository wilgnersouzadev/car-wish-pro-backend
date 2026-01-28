import { MigrationInterface, QueryRunner } from "typeorm";

export class Setup1769620894917 implements MigrationInterface {
    name = 'Setup1769620894917'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."car_washes_servicetype_enum" AS ENUM('basic', 'full', 'polish')`);
        await queryRunner.query(`CREATE TYPE "public"."car_washes_paymentmethod_enum" AS ENUM('cash', 'pix', 'card')`);
        await queryRunner.query(`CREATE TYPE "public"."car_washes_paymentstatus_enum" AS ENUM('paid', 'pending')`);
        await queryRunner.query(`CREATE TABLE "car_washes" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "vehicleId" integer NOT NULL, "customerId" integer NOT NULL, "serviceType" "public"."car_washes_servicetype_enum" NOT NULL, "amount" numeric(10,2) NOT NULL, "paymentMethod" "public"."car_washes_paymentmethod_enum" NOT NULL, "paymentStatus" "public"."car_washes_paymentstatus_enum" NOT NULL DEFAULT 'pending', "dateTime" TIMESTAMP NOT NULL, "notes" text, CONSTRAINT "PK_45e942ad3da1b9ba950209aacfb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."vehicles_type_enum" AS ENUM('car', 'motorcycle', 'pickup')`);
        await queryRunner.query(`CREATE TABLE "vehicles" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "licensePlate" character varying(10) NOT NULL, "model" character varying(255) NOT NULL, "color" character varying(50) NOT NULL, "type" "public"."vehicles_type_enum" NOT NULL DEFAULT 'car', "customerId" integer NOT NULL, CONSTRAINT "UQ_79a273823977d25c7523162cd5a" UNIQUE ("licensePlate"), CONSTRAINT "PK_18d8646b59304dce4af3a9e35b6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "customers" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" character varying(255) NOT NULL, "phone" character varying(20) NOT NULL, "notes" text, "isFrequentCustomer" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_133ec679a801fab5e070f73d3ea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "services" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" character varying(255) NOT NULL, "value" numeric(10,2) NOT NULL, "icon" character varying(10), "active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_ba2d347a3168a296416c6c5ccb2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'employee')`);
        await queryRunner.query(`CREATE TYPE "public"."users_commissiontype_enum" AS ENUM('percentage', 'fixed')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, "password" character varying(255) NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'employee', "isActive" boolean NOT NULL DEFAULT true, "commissionType" "public"."users_commissiontype_enum", "commissionValue" numeric(10,2), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "car_wash_user" ("userId" integer NOT NULL, "carWashId" integer NOT NULL, CONSTRAINT "PK_car_wash_user" PRIMARY KEY ("userId", "carWashId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_car_wash_user_userId" ON "car_wash_user" ("userId")`);
        await queryRunner.query(`CREATE INDEX "IDX_car_wash_user_carWashId" ON "car_wash_user" ("carWashId")`);
        await queryRunner.query(`ALTER TABLE "car_washes" ADD CONSTRAINT "FK_3c202e71be3500e804ccbc2aaa0" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "car_washes" ADD CONSTRAINT "FK_e513a160a4a0999dbf9f9b7f222" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vehicles" ADD CONSTRAINT "FK_ddb00709ac9788b3ded9296f2a8" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "car_wash_user" ADD CONSTRAINT "FK_car_wash_user_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "car_wash_user" ADD CONSTRAINT "FK_car_wash_user_carWashId" FOREIGN KEY ("carWashId") REFERENCES "car_washes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "car_wash_user" DROP CONSTRAINT "FK_car_wash_user_carWashId"`);
        await queryRunner.query(`ALTER TABLE "car_wash_user" DROP CONSTRAINT "FK_car_wash_user_userId"`);
        await queryRunner.query(`ALTER TABLE "vehicles" DROP CONSTRAINT "FK_ddb00709ac9788b3ded9296f2a8"`);
        await queryRunner.query(`ALTER TABLE "car_washes" DROP CONSTRAINT "FK_e513a160a4a0999dbf9f9b7f222"`);
        await queryRunner.query(`ALTER TABLE "car_washes" DROP CONSTRAINT "FK_3c202e71be3500e804ccbc2aaa0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_car_wash_user_carWashId"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_car_wash_user_userId"`);
        await queryRunner.query(`DROP TABLE "car_wash_user"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_commissiontype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "services"`);
        await queryRunner.query(`DROP TABLE "customers"`);
        await queryRunner.query(`DROP TABLE "vehicles"`);
        await queryRunner.query(`DROP TYPE "public"."vehicles_type_enum"`);
        await queryRunner.query(`DROP TABLE "car_washes"`);
        await queryRunner.query(`DROP TYPE "public"."car_washes_paymentstatus_enum"`);
        await queryRunner.query(`DROP TYPE "public"."car_washes_paymentmethod_enum"`);
        await queryRunner.query(`DROP TYPE "public"."car_washes_servicetype_enum"`);
    }

}
