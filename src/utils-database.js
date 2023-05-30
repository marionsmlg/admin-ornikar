import knex from "knex";
import "dotenv/config";

const db = knex({
  client: "pg",
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
  },
  pool: { min: 0, max: 20 },
});
export default db;

export async function fetchDataFromTable(tableName) {
  const trx = await db.transaction();
  try {
    const data = await trx(tableName).select("*").orderBy("created_at", "desc");
    await trx.commit();
    return data;
  } catch (error) {
    await trx.rollback();
    throw error;
  } finally {
    await trx.destroy();
  }
}
