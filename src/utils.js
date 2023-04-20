import fs from "fs/promises";
import { readFile } from "fs/promises";
import { customAlphabet } from "nanoid";
import nunjucks from "nunjucks";
import slugify from "@sindresorhus/slugify";
import argon2 from "argon2";

const nanoid = customAlphabet("0123456789qwertyuiopasdfghjklzxcvbnm", 10);

const ARTICLES_DATA_PATH = "src/data/articles.json";
const USERS_DATA_PATH = "src/data/users.json";

export async function pathExists(path) {
  try {
    await fs.access(path);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") {
      return false;
    } else {
      throw error;
    }
  }
}

export async function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk.toString(); // convert Buffer to string
    });
    request.on("error", (err) => {
      reject(err);
    });
    request.on("end", () => {
      resolve(body);
    });
  });
}

export function convertFormDataToJSON(formData) {
  return Object.fromEntries(new URLSearchParams(formData));
}

export async function readJSON(jsonPath) {
  const dataStr = await fs.readFile(jsonPath);
  const data = JSON.parse(dataStr);
  return data;
}

export async function isFile(filePath) {
  try {
    const stat = await fs.stat(filePath);
    return stat.isFile();
  } catch (error) {
    if (error.code === "ENOENT") {
      return false;
    } else {
      throw error;
    }
  }
}

export async function isDir(filePath) {
  try {
    const stat = await fs.stat(filePath);
    return stat.isDirectory();
  } catch (error) {
    if (error.code === "ENOENT") {
      return false;
    } else {
      throw error;
    }
  }
}

export async function writeJSON(jsonPath, jsonData) {
  // Convert the JSON data into a string
  const dataStr = JSON.stringify(jsonData, null, 2);

  // Use the "fs" module to write the stringified JSON data to a file located at "jsonPath"
  await fs.writeFile(jsonPath, dataStr);

  // Return the JSON data
  return jsonData;
}

export async function renderFilePath(response, filePath) {
  if (await isFile(filePath)) {
    const fileContent = await readFile(filePath);
    response.end(fileContent);
  } else {
    render404(response);
  }
}

export function render404(response) {
  response.statusCode = 404;
  const html = nunjucks.render("src/template/http404.njk", {});
  response.end(html);
}

export async function addArticle(dataToAdd) {
  dataToAdd.categoryId = dataToAdd.categoryId;
  dataToAdd.id = nanoid();
  dataToAdd.createdAt = new Date().toISOString();
  dataToAdd.updatedAt = "";
  const data = await readJSON("src/data/articles.json");
  data.unshift(dataToAdd);
  await writeJSON("src/data/articles.json", data);
  return data;
}

export async function editArticle(jsonData, articleId) {
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

export function formatDate(currentDate) {
  const date = new Date(currentDate);

  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
    timeZone: "Europe/Paris",
  };

  const formatter = new Intl.DateTimeFormat("fr-FR", options);
  const formattedDate = formatter.format(date);

  return formattedDate.replace(":", "h");
}

export async function identifiersAreValid(inputIdentifiers) {
  const arrOfUsers = await readJSON(USERS_DATA_PATH);
  const user = arrOfUsers.find((user) => user.email === inputIdentifiers.email);
  if (user === undefined) {
    return false;
  } else if (
    user.email === inputIdentifiers.email &&
    (await argon2.verify(user.password, inputIdentifiers.password))
  ) {
    return true;
  } else {
    return false;
  }
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

export async function addLinkInNavbar(dataToAdd) {
  const data = await readJSON("src/data/header.json");
  const navlinks = data.navlinks;
  navlinks.unshift(dataToAdd);
  await writeJSON("src/data/header.json", data);
  return data;
}
export async function editLinkInNavbar(jsonData) {
  const data = await readJSON("src/data/header.json");
  const dataNavbar = data.navlinks;

  for (let i = 0; i < dataNavbar.length; i++) {
    dataNavbar[i].title = jsonData[`title_${i}`];
    dataNavbar[i].href = jsonData[`href_${i}`];
  }

  await writeJSON("src/data/header.json", data);
  return data;
}

export async function deleteLinkInNavbar(indexToDelete) {
  const data = await readJSON("src/data/header.json");
  const navlinks = data.navlinks;
  navlinks.splice(indexToDelete, 1);

  await writeJSON("src/data/header.json", data);
  return data;
}

export async function addLinkInFooter(dataToAdd) {
  const data = await readJSON("src/data/footer.json");
  const footerLinks = data.footerLinks;
  footerLinks.unshift(dataToAdd);
  await writeJSON("src/data/footer.json", data);
  return data;
}

export async function deleteLinkInFooter(indexToDelete) {
  const data = await readJSON("src/data/footer.json");
  const footerLinks = data.footerLinks;
  footerLinks.splice(indexToDelete, 1);

  await writeJSON("src/data/footer.json", data);
  return data;
}

export async function editLinkInFooter(jsonData) {
  const data = await readJSON("src/data/footer.json");
  const footerLinks = data.footerLinks;

  for (let i = 0; i < footerLinks.length; i++) {
    footerLinks[i].title = jsonData[`title_${i}`];
    footerLinks[i].href = jsonData[`href_${i}`];
  }

  await writeJSON("src/data/footer.json", data);
  return data;
}

export async function editSocialMediaInFooter(jsonData) {
  const data = await readJSON("src/data/footer.json");
  const footerSocialMedia = data.footerSocialMedia;

  for (let i = 0; i < footerSocialMedia.length; i++) {
    footerSocialMedia[i].href = jsonData[`href_${i}`];
  }

  await writeJSON("src/data/footer.json", data);
  return data;
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

export function createArticleSlug(title, id) {
  const slug = `${slugify(title)}-${id}`;
  return slug;
}

export async function getSessionId(inputIdentifiers) {
  const arrOfUsers = await readJSON(USERS_DATA_PATH);
  const user = arrOfUsers.find((user) => user.email === inputIdentifiers.email);
  const nanoid = customAlphabet("0123456789qwertyuiopasdfghjklzxcvbnm", 20);
  const sessionId = (user.sessionId = nanoid());
  await writeJSON(USERS_DATA_PATH, arrOfUsers);
  return sessionId;
}

export async function removeSessionId(sessionId) {
  const arrOfUsers = await readJSON(USERS_DATA_PATH);
  const user = arrOfUsers.find((user) => user.sessionId === sessionId);
  delete user.sessionId;
  await writeJSON(USERS_DATA_PATH, arrOfUsers);
  return arrOfUsers;
}

export async function hasSessionId(sessionId) {
  if (sessionId) {
    const users = await readJSON(USERS_DATA_PATH);
    return !!users.find((user) => user.sessionId === sessionId);
  } else {
    return false;
  }
}
export async function getUserEmail(sessionId) {
  if (sessionId) {
    const users = await readJSON(USERS_DATA_PATH);
    const user = users.find((user) => user.sessionId === sessionId);
    if (user === undefined) {
      return "";
    } else {
      return user.email;
    }
  }
}
