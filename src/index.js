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

nunjucks.configure({
  noCache: true,
});

const nanoid = customAlphabet("0123456789qwertyuiopasdfghjklzxcvbnm", 10);
const categories = [
  "Assurance auto",
  "Code de la route",
  "Permis de conduire",
  "Conduite accompagnée",
  "Informations",
  "Mécanique",
  "Conduite",
];

const ARTICLES_DATA_PATH = "src/data/articles.json";
const DRAFT_ARTICLES_DATA_PATH = "src/data/draft.json";
const articles = await readJSON(ARTICLES_DATA_PATH);
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
    const indexArticle = articles.findIndex(
      (article) => article.id === searchParams.id
    );

    const templateData = {
      searchParams: searchParams,
      highlightArticles: articles.slice(0, 3),
      articles: articles,
      indexArticle: indexArticle,
      categories: categories,
    };

    const html = nunjucks.render(templatePath, templateData);
    response.end(html);
  } else if (request.method === "POST") {
    const body = await readBody(request);
    const form = convertFormDataToJSON(body);
    const searchParams = Object.fromEntries(requestURLData.searchParams);
    const indexArticle = articles.findIndex(
      (article) => article.id === searchParams.id
    );

    if (request.url === `/edition?id=${searchParams.id}`) {
      await modifyDataInJSONFile(ARTICLES_DATA_PATH, form, indexArticle);
    } else {
      await addDataInJSONFile(ARTICLES_DATA_PATH, form);
    }
    response.statusCode = 302;
    response.setHeader(
      "Location",
      `${requestURLData.pathname}?submitSuccess=true`
    );
    response.end();
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
  dataToAdd.date = getDateAndTimeFormatFr(new Date());
  const data = await readJSON(jsonPath);
  data.unshift(dataToAdd);
  const dataStr = JSON.stringify(data, null, 2);
  fs.writeFile(jsonPath, dataStr);
  return data;
}

function getDateAndTimeFormatFr(date) {
  let dateFormat = new Date(date);
  let options = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  let dateFormatFr = dateFormat.toLocaleDateString("fr", options);
  let time = `${addZero(dateFormat.getHours())}h${addZero(
    dateFormat.getMinutes()
  )}`;

  return `${dateFormatFr} à ${time}`;
}

function addZero(n) {
  if (n < 10) {
    return "0" + n;
  } else {
    return n;
  }
}

async function modifyDataInJSONFile(jsonPath, jsonData, indexData) {
  const data = await readJSON(jsonPath);
  const dataArticle = data[indexData];
  dataArticle.title = jsonData.title;
  dataArticle.category = jsonData.category;
  dataArticle.img = jsonData.img;
  dataArticle.content = jsonData.content;
  dataArticle.date = getDateAndTimeFormatFr(new Date());
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
