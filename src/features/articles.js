import { user } from "./users.js";
import { z } from "zod";
import db from "../utils-database.js";

export async function articleIDExists(id) {
  const articles = await db("article")
    .select("*")
    .orderBy("created_at", "desc");
  const article = articles.find((article) => article.id === id);
  return Boolean(article);
}

export function getCategoryNameById(id, dataArticlesCategories) {
  const articleCategory = dataArticlesCategories.find(
    (category) => category.id === id
  );
  return articleCategory.name;
}

export function dataArticleAreValid(articleData) {
  const articleSchema = z.object({
    title: z.string().min(5).max(100),
    category_id: z.string().uuid(),
    img: z.string().url(),
    content: z.string(),
  });
  return articleSchema.safeParse(articleData).success;
}

export function dataCategoryIsValid(data) {
  const categorySchema = z.object({
    name: z.string().min(3).max(50),
  });

  return categorySchema.safeParse(data).success;
}

export const article = {
  add: async function (form, sessionId) {
    form.created_by = await user.getId(sessionId);
    await db("article").insert(form);
  },

  update: async function (form, articleId, sessionId) {
    form.updated_by = await user.getId(sessionId);
    await db("article").where({ id: articleId }).update(form);
  },

  delete: async function (articleId) {
    await db("article").where(articleId).del();
  },
};

export const articleCategory = {
  add: async function (form) {
    await db("article_category").insert(form);
  },

  update: async function (form) {
    const arrOfArticleId = Object.keys(form);
    for (const articleId of arrOfArticleId) {
      await db("article_category")
        .where({ id: articleId })
        .update({ name: form[articleId] });
    }
  },

  delete: async function (articleId) {
    const trx = await db.transaction();
    await db("article_category").where(articleId).del();
  },
};
