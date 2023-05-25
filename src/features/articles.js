import { readJSON, writeJSON } from "../utils.js";
import { customAlphabet } from "nanoid";
import { z } from "zod";
const nanoid = customAlphabet("0123456789qwertyuiopasdfghjklzxcvbnm", 10);

const ARTICLES_DATA_PATH = "src/data/articles.json";

export async function addArticle(dataToAdd, sessionId) {
  dataToAdd.categoryId = dataToAdd.categoryId;
  dataToAdd.id = nanoid();
  dataToAdd.createdAt = new Date().toISOString();
  dataToAdd.updatedAt = "";
  dataToAdd.created_by = await getUserId(sessionId);
  dataToAdd.updated_by = "";
  const data = await readJSON("src/data/articles.json");
  data.unshift(dataToAdd);
  await writeJSON("src/data/articles.json", data);
  return data;
}

export async function editArticle(jsonData, articleId, sessionId) {
  const data = await readJSON("src/data/articles.json");
  const indexToModify = data.findIndex((article) => article.id === articleId);
  const dataArticle = data[indexToModify];
  dataArticle.categoryId = jsonData.categoryId;
  dataArticle.title = jsonData.title;
  dataArticle.img = jsonData.img;
  dataArticle.content = jsonData.content;
  dataArticle.updatedAt = new Date().toISOString();
  dataArticle.status = jsonData.status;
  dataArticle.description = jsonData.description;
  dataArticle.updated_by = await getUserId(sessionId);

  await writeJSON("src/data/articles.json", data);
  return data;
}

export async function deleteArticle(jsonData) {
  const data = await readJSON("src/data/articles.json");
  const indexArticleToDelete = data.findIndex(
    (article) => article.id === jsonData.id
  );
  data.splice(indexArticleToDelete, 1);

  await writeJSON("src/data/articles.json", data);
  return data;
}

export async function articleIDExists(id) {
  const articles = await readJSON(ARTICLES_DATA_PATH);
  const article = articles.find((article) => article.id === id);
  if (article === undefined) {
    return false;
  } else {
    return true;
  }
}

export async function addArticleCategory(dataToAdd) {
  const dataArticlesCategories = await readJSON(
    "src/data/articles-categories.json"
  );
  dataToAdd.createdAt = new Date().toISOString();
  dataToAdd.updatedAt = "";
  dataToAdd.id = nanoid();
  dataArticlesCategories.unshift(dataToAdd);
  await writeJSON("src/data/articles-categories.json", dataArticlesCategories);
  return dataArticlesCategories;
}

export async function deleteArticleCategory(jsonData) {
  const data = await readJSON("src/data/articles-categories.json");
  const indexArticleCategoryToDelete = data.findIndex(
    (category) => category.id === jsonData.id
  );

  data.splice(indexArticleCategoryToDelete, 1);

  await writeJSON("src/data/articles-categories.json", data);
  return data;
}

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
