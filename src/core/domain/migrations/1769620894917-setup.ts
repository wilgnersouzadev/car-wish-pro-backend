import { MigrationInterface, QueryRunner } from "typeorm";

export class Setup1769620894917 implements MigrationInterface {
    name = 'Setup1769620894917'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "shops" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" character varying(255) NOT NULL, "slug" character varying(100) NOT NULL, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_8c28ec876676eeb1dcb65c01b7f" UNIQUE ("slug"), CONSTRAINT "PK_3c6aaa6607d287de99815e60b96" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('super_admin', 'admin', 'employee')`);
        await queryRunner.query(`CREATE TYPE "public"."users_commissiontype_enum" AS ENUM('percentage', 'fixed')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, "shopId" integer, "password" character varying(255) NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'employee', "isActive" boolean NOT NULL DEFAULT true, "commissionType" "public"."users_commissiontype_enum", "commissionValue" numeric(10,2), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."car_washes_servicetype_enum" AS ENUM('basic', 'full', 'polish')`);
        await queryRunner.query(`CREATE TYPE "public"."car_washes_paymentmethod_enum" AS ENUM('cash', 'pix', 'card')`);
        await queryRunner.query(`CREATE TYPE "public"."car_washes_paymentstatus_enum" AS ENUM('paid', 'pending')`);
        await queryRunner.query(`CREATE TABLE "car_washes" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "vehicleId" integer NOT NULL, "customerId" integer NOT NULL, "shopId" integer NOT NULL, "serviceType" "public"."car_washes_servicetype_enum" NOT NULL, "amount" numeric(10,2) NOT NULL, "paymentMethod" "public"."car_washes_paymentmethod_enum" NOT NULL, "paymentStatus" "public"."car_washes_paymentstatus_enum" NOT NULL DEFAULT 'pending', "dateTime" TIMESTAMP NOT NULL, "notes" text, CONSTRAINT "PK_45e942ad3da1b9ba950209aacfb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."vehicles_type_enum" AS ENUM('car', 'motorcycle', 'pickup')`);
        await queryRunner.query(`CREATE TABLE "vehicles" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "licensePlate" character varying(10) NOT NULL, "model" character varying(255) NOT NULL, "color" character varying(50) NOT NULL, "type" "public"."vehicles_type_enum" NOT NULL DEFAULT 'car', "customerId" integer NOT NULL, "shopId" integer NOT NULL, CONSTRAINT "PK_18d8646b59304dce4af3a9e35b6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "customers" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" character varying(255) NOT NULL, "phone" character varying(20) NOT NULL, "notes" text, "isFrequentCustomer" boolean NOT NULL DEFAULT false, "shopId" integer NOT NULL, CONSTRAINT "PK_133ec679a801fab5e070f73d3ea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "services" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" character varying(255) NOT NULL, "value" numeric(10,2) NOT NULL, "icon" character varying(10), "active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_ba2d347a3168a296416c6c5ccb2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_shops" ("userId" integer NOT NULL, "shopId" integer NOT NULL, CONSTRAINT "PK_7d4bf9b22d2f3b083be199b7821" PRIMARY KEY ("userId", "shopId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_dca6d235e75c396497c573eac1" ON "user_shops" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_977bab94ee2c7cc34346e672f1" ON "user_shops" ("shopId") `);
        await queryRunner.query(`CREATE TABLE "car_wash_user" ("userId" integer NOT NULL, "carWashId" integer NOT NULL, CONSTRAINT "PK_0ae7f8595b7678c35bff2f61287" PRIMARY KEY ("userId", "carWashId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_34617c003a84f37c6183310cc8" ON "car_wash_user" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_432e2d3d6edaf1c6ec3aa01416" ON "car_wash_user" ("carWashId") `);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_7680babafb8b9ca907bfbd142c5" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "car_washes" ADD CONSTRAINT "FK_68cb96de0d5af1056815579c58b" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "car_washes" ADD CONSTRAINT "FK_3c202e71be3500e804ccbc2aaa0" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "car_washes" ADD CONSTRAINT "FK_e513a160a4a0999dbf9f9b7f222" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vehicles" ADD CONSTRAINT "FK_240833b28d18a25f383fad0db94" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vehicles" ADD CONSTRAINT "FK_ddb00709ac9788b3ded9296f2a8" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "customers" ADD CONSTRAINT "FK_45135fa52dfd3223f9b1fb62396" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_shops" ADD CONSTRAINT "FK_dca6d235e75c396497c573eac15" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_shops" ADD CONSTRAINT "FK_977bab94ee2c7cc34346e672f1d" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "car_wash_user" ADD CONSTRAINT "FK_34617c003a84f37c6183310cc84" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "car_wash_user" ADD CONSTRAINT "FK_432e2d3d6edaf1c6ec3aa014160" FOREIGN KEY ("carWashId") REFERENCES "car_washes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "car_wash_user" DROP CONSTRAINT "FK_432e2d3d6edaf1c6ec3aa014160"`);
        await queryRunner.query(`ALTER TABLE "car_wash_user" DROP CONSTRAINT "FK_34617c003a84f37c6183310cc84"`);
        await queryRunner.query(`ALTER TABLE "user_shops" DROP CONSTRAINT "FK_977bab94ee2c7cc34346e672f1d"`);
        await queryRunner.query(`ALTER TABLE "user_shops" DROP CONSTRAINT "FK_dca6d235e75c396497c573eac15"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP CONSTRAINT "FK_45135fa52dfd3223f9b1fb62396"`);
        await queryRunner.query(`ALTER TABLE "vehicles" DROP CONSTRAINT "FK_ddb00709ac9788b3ded9296f2a8"`);
        await queryRunner.query(`ALTER TABLE "vehicles" DROP CONSTRAINT "FK_240833b28d18a25f383fad0db94"`);
        await queryRunner.query(`ALTER TABLE "car_washes" DROP CONSTRAINT "FK_e513a160a4a0999dbf9f9b7f222"`);
        await queryRunner.query(`ALTER TABLE "car_washes" DROP CONSTRAINT "FK_3c202e71be3500e804ccbc2aaa0"`);
        await queryRunner.query(`ALTER TABLE "car_washes" DROP CONSTRAINT "FK_68cb96de0d5af1056815579c58b"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_7680babafb8b9ca907bfbd142c5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_432e2d3d6edaf1c6ec3aa01416"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_34617c003a84f37c6183310cc8"`);
        await queryRunner.query(`DROP TABLE "car_wash_user"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_977bab94ee2c7cc34346e672f1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_dca6d235e75c396497c573eac1"`);
        await queryRunner.query(`DROP TABLE "user_shops"`);
        await queryRunner.query(`DROP TABLE "services"`);
        await queryRunner.query(`DROP TABLE "customers"`);
        await queryRunner.query(`DROP TABLE "vehicles"`);
        await queryRunner.query(`DROP TYPE "public"."vehicles_type_enum"`);
        await queryRunner.query(`DROP TABLE "car_washes"`);
        await queryRunner.query(`DROP TYPE "public"."car_washes_paymentstatus_enum"`);
        await queryRunner.query(`DROP TYPE "public"."car_washes_paymentmethod_enum"`);
        await queryRunner.query(`DROP TYPE "public"."car_washes_servicetype_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_commissiontype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "shops"`);
    }

}
