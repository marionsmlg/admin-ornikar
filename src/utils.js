import fs from "fs/promises";
import { readFile } from "fs/promises";
import nunjucks from "nunjucks";
import slugify from "@sindresorhus/slugify";
import knex from "knex";
import "dotenv/config";

const db = knex({
  client: "pg",
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
});

export default db;

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
  const dataStr = JSON.stringify(jsonData, null, 2);
  await fs.writeFile(jsonPath, dataStr);
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

export function createArticleSlug(title, id) {
  const slug = `${slugify(title)}-${id}`;
  return slug;
}

////////////////////////////////////////////////////////////////////////
