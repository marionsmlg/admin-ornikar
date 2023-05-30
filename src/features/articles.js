import { user } from "./users.js";
import { z } from "zod";
import db from "../utils-database.js";
import { fetchDataFromTable } from "../utils-database.js";

export async function articleIDExists(id) {
  const articles = await fetchDataFromTable("article");
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
    img: z.string().url(),
    content: z.string().min(100),
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
    const trx = await db.transaction();
    try {
      await trx("article").insert(form);
      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    } finally {
      await trx.destroy();
      await db.destroy();
    }
  },

  update: async function (form, articleId, sessionId) {
    form.updated_by = await user.getId(sessionId);
    const trx = await db.transaction();
    try {
      await trx("article").where({ id: articleId }).update(form);
      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    } finally {
      await trx.destroy();
      await db.destroy();
    }
  },

  delete: async function (articleId) {
    const trx = await db.transaction();
    try {
      await trx("article").where(articleId).del();
      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    } finally {
      await trx.destroy();
      await db.destroy();
    }
  },
};

export const articleCategory = {
  add: async function (form) {
    const trx = await db.transaction();
    try {
      await trx("article_category").insert(form);
      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    } finally {
      await trx.destroy();
      await db.destroy();
    }
  },

  update: async function (form) {
    const arrOfArticleId = Object.keys(form);
    const trx = await db.transaction();
    try {
      for (const articleId of arrOfArticleId) {
        await trx("article_category")
          .where({ id: articleId })
          .update({ name: form[articleId] });
      }
      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    } finally {
      await trx.destroy();
      await db.destroy();
    }
  },

  delete: async function (articleId) {
    const trx = await db.transaction();
    try {
      await trx("article_category").where(articleId).del();
      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    } finally {
      await trx.destroy();
      await db.destroy();
    }
  },
};
