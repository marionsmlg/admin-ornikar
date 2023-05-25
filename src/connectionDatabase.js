import createConnectionPool, { sql } from "@databases/pg";
import "dotenv/config";
export { sql };
import { readJSON } from "./utils.js";
const db = createConnectionPool({
  bigIntMode: "number",
});
export default db;

async function insertArticle() {
  const articles = await readJSON("src/data/articles.json");
  await db.tx(async (db) => {
    for (const article of articles) {
      await db.query(sql`
  INSERT INTO article (title, category_id, status, img, content, created_by, updated_by)
    VALUES (${article.title}, ${article.categoryId}, ${article.status}, ${article.img}, ${article.content}, ${article.created_by}, ${article.updated_by});
    `);
    }
  });
}

async function insertArticlesCategories() {
  const articlesCategories = await readJSON(
    "src/data/articles-categories.json"
  );
  await db.tx(async (db) => {
    for (const article of articlesCategories) {
      await db.query(sql`
  INSERT INTO article_category (name)
    VALUES (${article.name});
    `);
    }
  });
}

async function insertUsers() {
  const data = await readJSON("src/data/users.json");
  await db.tx(async (db) => {
    for (const user of data) {
      await db.query(sql`
  INSERT INTO "user" (email, password,session_id)
    VALUES (${user.email}, ${user.password}, ${user.sessionId});
    `);
    }
  });
}

async function insertFooter() {
  const json = await readJSON("src/data/footer.json");
  const data = json.footerSocialMedia;
  await db.tx(async (db) => {
    for (const item of data) {
      await db.query(sql`
  INSERT INTO "footer_social_media" (name, href)
    VALUES (${item.name}, ${item.href});
    `);
    }
  });
}

async function insertFooterLinks() {
  const json = await readJSON("src/data/footer.json");
  const data = json.footerLinks;
  await db.tx(async (db) => {
    for (const item of data) {
      await db.query(sql`
  INSERT INTO "footer_link" (title, href)
    VALUES (${item.title}, ${item.href});
    `);
    }
  });
}

async function insertHeader() {
  const json = await readJSON("src/data/header.json");
  const data = json.navlinks;
  await db.tx(async (db) => {
    for (const item of data) {
      await db.query(sql`
  INSERT INTO "header_link" (title, href)
    VALUES (${item.title}, ${item.href});
    `);
    }
  });
}

async function getArticles() {
  const articles = await db.query(sql`
    SELECT * FROM article
  `);
  return articles;
}
async function run() {
  await insertHeader(), await db.dispose();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
