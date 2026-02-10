import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPhotosFields1770758603000 implements MigrationInterface {
    name = 'AddPhotosFields1770758603000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "car_washes" ADD "photosBefore" text array DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "car_washes" ADD "photosAfter" text array DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "shops" ADD "logoUrl" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shops" DROP COLUMN "logoUrl"`);
        await queryRunner.query(`ALTER TABLE "car_washes" DROP COLUMN "photosAfter"`);
        await queryRunner.query(`ALTER TABLE "car_washes" DROP COLUMN "photosBefore"`);
    }
}
