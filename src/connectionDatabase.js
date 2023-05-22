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
  INSERT INTO article (title, category_id, status, img, content, id, created_at, updated_at, created_by, updated_by)
    VALUES (${article.title}, ${article.categoryId}, ${article.status}, ${article.img}, ${article.content}, ${article.id}, ${article.createdAt}, ${article.updatedAt}, ${article.created_by}, ${article.updated_by});
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
  INSERT INTO article_category (name, created_at, updated_at, id)
    VALUES (${article.name}, ${article.createdAt}, ${article.updatedAt}, ${article.id});
    `);
    }
  });
}

async function insertUsers() {
  const data = await readJSON("src/data/users.json");
  await db.tx(async (db) => {
    for (const user of data) {
      await db.query(sql`
  INSERT INTO "user" (email, password, created_at, session_id, id)
    VALUES (${user.email}, ${user.password}, ${user.createdAt}, ${user.sessionId}, ${user.id});
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
  INSERT INTO "footer_social_media" (id, name, href)
    VALUES (${item.id}, ${item.name}, ${item.href});
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
// async function run() {
//   console.log(await getArticles());
//   await db.dispose();
// }

// run().catch((err) => {
//   console.error(err);
//   process.exit(1);
// });
