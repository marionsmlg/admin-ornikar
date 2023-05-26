import { readJSON, writeJSON } from "../utils.js";
import { customAlphabet } from "nanoid";
import { sessionId, user } from "./users.js";
import { z } from "zod";
import db from "../utils-database.js";
import { fetchDataFromTable } from "../utils-database.js";

const nanoid = customAlphabet("0123456789qwertyuiopasdfghjklzxcvbnm", 10);

///////////////////////////// CRUD WITH JSON////////////////////////////////////////////////////

// const ARTICLES_DATA_PATH = "src/data/articles.json";

// export async function addArticle(dataToAdd, sessionId) {
//   dataToAdd.categoryId = dataToAdd.categoryId;
//   dataToAdd.id = nanoid();
//   dataToAdd.createdAt = new Date().toISOString();
//   dataToAdd.updatedAt = "";
//   dataToAdd.created_by = await getUserId(sessionId);
//   dataToAdd.updated_by = "";
//   const data = await readJSON("src/data/articles.json");
//   data.unshift(dataToAdd);
//   await writeJSON("src/data/articles.json", data);
//   return data;
// }

// export async function editArticle(jsonData, articleId, sessionId) {
//   const data = await readJSON("src/data/articles.json");
//   const indexToModify = data.findIndex((article) => article.id === articleId);
//   const dataArticle = data[indexToModify];
//   dataArticle.categoryId = jsonData.categoryId;
//   dataArticle.title = jsonData.title;
//   dataArticle.img = jsonData.img;
//   dataArticle.content = jsonData.content;
//   dataArticle.updatedAt = new Date().toISOString();
//   dataArticle.status = jsonData.status;
//   dataArticle.description = jsonData.description;
//   dataArticle.updated_by = await getUserId(sessionId);

//   await writeJSON("src/data/articles.json", data);
//   return data;
// }

// export async function deleteArticle(jsonData) {
//   const data = await readJSON("src/data/articles.json");
//   const indexArticleToDelete = data.findIndex(
//     (article) => article.id === jsonData.id
//   );
//   data.splice(indexArticleToDelete, 1);

//   await writeJSON("src/data/articles.json", data);
//   return data;
// }

// export async function addArticleCategory(dataToAdd) {
//   const dataArticlesCategories = await readJSON(
//     "src/data/articles-categories.json"
//   );
//   dataToAdd.createdAt = new Date().toISOString();
//   dataToAdd.updatedAt = "";
//   dataToAdd.id = nanoid();
//   dataArticlesCategories.unshift(dataToAdd);
//   await writeJSON("src/data/articles-categories.json", dataArticlesCategories);
//   return dataArticlesCategories;
// }

// export async function deleteArticleCategory(jsonData) {
//   const data = await readJSON("src/data/articles-categories.json");
//   const indexArticleCategoryToDelete = data.findIndex(
//     (category) => category.id === jsonData.id
//   );

//   data.splice(indexArticleCategoryToDelete, 1);

//   await writeJSON("src/data/articles-categories.json", data);
//   return data;
// }

export async function editArticleCategory(jsonData) {
  const dataArticlesCategories = await readJSON(
    "src/data/articles-categories.json"
  );

  for (let i = 0; i < dataArticlesCategories.length; i++) {
    dataArticlesCategories[i].name = jsonData[`name_${i}`];
    dataArticlesCategories[i].updatedAt = new Date().toISOString();
  }

  await writeJSON("src/data/articles-categories.json", dataArticlesCategories);
  return dataArticlesCategories;
}
//////////////////////////////CRUD WITH DATABASE/////////////////////////////////////////////////////////////

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
    }
  },

  update: async function (form) {
    const trx = await db.transaction();
    try {
      await trx("article_category").where({ id: articleId }).update(form);
      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    } finally {
      await trx.destroy();
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
    }
  },
};
