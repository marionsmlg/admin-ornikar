import http from "http";
import nunjucks from "nunjucks";
import {
  convertFormDataToJSON,
  isDir,
  isFile,
  readBody,
  readJSON,
  writeJSON,
} from "./utils.js";
import path from "path";
import { readFile } from "fs/promises";
import fs from "fs/promises";
import { customAlphabet } from "nanoid";

let env = nunjucks.configure({
  noCache: true,
});
env.addFilter("formatDate", formatDate);

const nanoid = customAlphabet("0123456789qwertyuiopasdfghjklzxcvbnm", 10);
const ARTICLE_CATEGORIES = [
  "Assurance auto",
  "Code de la route",
  "Permis de conduire",
  "Conduite accompagnée",
  "Informations",
  "Mécanique",
  "Conduite",
];

const ARTICLES_DATA_PATH = "src/data/articles.json";
const USERS_DATA_PATH = "src/data/users.json";
const PORT = 3000;

const server = http.createServer(async (request, response) => {
  try {
    await handleServer(request, response);
  } catch (error) {
    console.error(error);
    response.statusCode = 500;
    response.end("Internal server error");
  }
});

async function handleServer(request, response) {
  const requestURLData = new URL(request.url, `http://localhost:${PORT}`);
  console.info(`\n---\nRequest ${new Date().getTime()}`, {
    method: request.method,
    url: request.url,
    requestURLData,
  });

  if (request.method === "GET") {
    if (path.extname(requestURLData.pathname) !== "") {
      const assetsFilePath = `src/assets${requestURLData.pathname}`;
      console.log({ assetsFilePath });
      await renderFilePath(response, assetsFilePath);
      return;
    }

    let templatePath = `src/template${requestURLData.pathname}`;
    const basenameURL = path.basename(requestURLData.pathname);

    if (await isDir(templatePath)) {
      templatePath = path.join(templatePath, "index.njk");
    } else if (await isFile(`${templatePath}.njk`)) {
      templatePath = `${templatePath}.njk`;
    } else if (
      (await articleIDExists(basenameURL)) &&
      requestURLData.pathname === `/articles/${basenameURL}`
    ) {
      templatePath = "src/template/articles/edit.njk";
    } else {
      render404(response);
      return;
    }

    const searchParams = Object.fromEntries(requestURLData.searchParams);
    const articles = await readJSON(ARTICLES_DATA_PATH);
    const article = articles.find((article) => article.id === basenameURL);

    const templateData = {
      searchParams: searchParams,
      highlightArticles: articles.slice(0, 3),
      articles: articles,
      article: article,
      articleCategories: ARTICLE_CATEGORIES,
    };

    const html = nunjucks.render(templatePath, templateData);
    response.end(html);
  } else if (request.method === "POST") {
    const body = await readBody(request);
    const form = convertFormDataToJSON(body);

    const articles = await readJSON(ARTICLES_DATA_PATH);
    const indexToDelete = articles.findIndex(
      (article) => article.id === form.id
    );
    const basenameURL = path.basename(requestURLData.pathname);
    const indexToModify = articles.findIndex(
      (article) => article.id === basenameURL
    );

    if (
      requestURLData.pathname === `/articles/${basenameURL}` &&
      requestURLData.pathname !== "/articles/create"
    ) {
      await modifyDataInJSONFile(ARTICLES_DATA_PATH, form, indexToModify);
      response.statusCode = 302;
      response.setHeader("Location", `/articles?editSuccess=true`);
      response.end();
    } else if (requestURLData.pathname === "/deleteArticle") {
      await deleteDataInJSONFile(ARTICLES_DATA_PATH, indexToDelete);
      response.statusCode = 302;
      response.setHeader("Location", `/articles?deleteSuccess=true`);
      response.end();
    } else if (requestURLData.pathname === "/login") {
      if (await identifiersAreValid(form)) {
        response.statusCode = 302;
        response.setHeader("Location", `/`);
        response.end();
      } else {
        response.statusCode = 302;
        response.setHeader("Location", `/login?loginFailed=true`);
        response.end();
      }
    } else if (requestURLData.pathname === "/articles/create") {
      await addDataInJSONFile(ARTICLES_DATA_PATH, form);
      response.statusCode = 302;
      response.setHeader("Location", `/articles?createSuccess=true`);
      response.end();
    } else {
      render404(response);
    }
  } else {
    render404(response);
  }
}

server.listen(PORT, () => {
  console.info(`Server started on port ${PORT}`);
});

async function renderFilePath(response, filePath) {
  if (await isFile(filePath)) {
    const fileContent = await readFile(filePath);
    response.end(fileContent);
  } else {
    render404(response);
  }
}

function render404(response) {
  response.statusCode = 404;
  const html = nunjucks.render("src/template/http404.njk", {});
  response.end(html);
}

async function addDataInJSONFile(jsonPath, dataToAdd) {
  dataToAdd.id = nanoid();
  dataToAdd.createdAt = new Date().toISOString();
  dataToAdd.updatedAt = "";
  const data = await readJSON(jsonPath);
  data.unshift(dataToAdd);
  const dataStr = JSON.stringify(data, null, 2);
  fs.writeFile(jsonPath, dataStr);
  return data;
}

async function modifyDataInJSONFile(jsonPath, jsonData, indexData) {
  const data = await readJSON(jsonPath);
  const dataArticle = data[indexData];
  dataArticle.title = jsonData.title;
  dataArticle.category = jsonData.category;
  dataArticle.img = jsonData.img;
  dataArticle.content = jsonData.content;
  dataArticle.updatedAt = new Date().toISOString();
  dataArticle.status = jsonData.status;
  dataArticle.description = jsonData.description;

  const dataStr = JSON.stringify(data, null, 2);
  fs.writeFile(jsonPath, dataStr);
  return data;
}

async function deleteDataInJSONFile(jsonPath, indexToDelete) {
  const data = await readJSON(jsonPath);
  data.splice(indexToDelete, 1);

  const dataStr = JSON.stringify(data, null, 2);
  fs.writeFile(jsonPath, dataStr);
  return data;
}

function formatDate(currentDate) {
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

async function identifiersAreValid(inputIdentifiers) {
  const arrOfUsers = await readJSON(USERS_DATA_PATH);
  const user = arrOfUsers.find((user) => user.email === inputIdentifiers.email);
  if (user === undefined) {
    return false;
  } else if (
    user.email === inputIdentifiers.email &&
    user.password === inputIdentifiers.password
  ) {
    return true;
  } else {
    return false;
  }
}

async function articleIDExists(id) {
  const articles = await readJSON(ARTICLES_DATA_PATH);
  const article = articles.find((article) => article.id === id);
  if (article === undefined) {
    return false;
  } else {
    return true;
  }
}
