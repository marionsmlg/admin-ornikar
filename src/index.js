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
import dateFilter from "nunjucks-date-filter";
import moment from "moment";

let env = nunjucks.configure({
  noCache: true,
});
env.addFilter("date", dateFilter);
env.addGlobal("moment", moment);

moment.locale("fr");

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

    if (await isDir(templatePath)) {
      templatePath = path.join(templatePath, "index.njk");
    } else if (await isFile(`${templatePath}.njk`)) {
      templatePath = `${templatePath}.njk`;
    } else {
      render404(response);
      return;
    }

    const searchParams = Object.fromEntries(requestURLData.searchParams);
    const articles = await readJSON(ARTICLES_DATA_PATH);
    const indexArticle = articles.findIndex(
      (article) => article.id === searchParams.id
    );

    const templateData = {
      searchParams: searchParams,
      highlightArticles: articles.slice(0, 3),
      articles: articles,
      article: articles[indexArticle],
      articleCategories: ARTICLE_CATEGORIES,
    };

    console.log({ templatePath });
    const html = nunjucks.render(templatePath, templateData);
    response.end(html);
  } else if (request.method === "POST") {
    const body = await readBody(request);
    const form = convertFormDataToJSON(body);
    const searchParams = Object.fromEntries(requestURLData.searchParams);
    const articles = await readJSON(ARTICLES_DATA_PATH);
    const indexArticle = articles.findIndex(
      (article) => article.id === searchParams.id
    );
    const indexToDelete = articles.findIndex(
      (article) => article.id === form.id
    );

    if (requestURLData.pathname === `/articles/edit`) {
      await modifyDataInJSONFile(ARTICLES_DATA_PATH, form, indexArticle);
      response.statusCode = 302;
      response.setHeader("Location", `/articles?editSuccess=true`);
      response.end();
    } else if (requestURLData.pathname === "/delete") {
      await deleteDataInJSONFile(ARTICLES_DATA_PATH, indexToDelete);
      response.statusCode = 302;
      response.setHeader("Location", `/articles?deleteSuccess=true`);
      response.end();
    } else {
      await addDataInJSONFile(ARTICLES_DATA_PATH, form);
      response.statusCode = 302;
      response.setHeader(
        "Location",
        `${requestURLData.pathname}?createSuccess=true`
      );
      response.end();
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

async function getIndexArticle(searchParams) {
  const articles = await readJSON(ARTICLES_DATA_PATH);
  const indexArticle = articles.findIndex(
    (article) => article.id === searchParams.id
  );
  return indexArticle;
}
