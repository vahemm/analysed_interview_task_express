import {MigrationInterface, QueryRunner} from "typeorm"

export class Person1689873177423 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "person"
            (
                "id"         SERIAL            NOT NULL,
                "first_name" character varying NOT NULL,
                "last_name"  character varying NOT NULL,
                "age"        character varying NOT NULL,
                "sex"        character varying NOT NULL,
                "livingId"   integer,
                CONSTRAINT "PK_5fdaf670315c4b7e70cce85daa3" PRIMARY KEY ("id")
            );
        `);
        await queryRunner.query(`
            ALTER TABLE "person"
                ADD CONSTRAINT "FK_db57f98826ec0c3ee035d2dd84b" FOREIGN KEY ("livingId")
                    REFERENCES "city" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "person" DROP CONSTRAINT "FK_db57f98826ec0c3ee035d2dd84b"`,
        );
        await queryRunner.query(`DROP TABLE "person"`);
    }

}
