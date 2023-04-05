import fs from "fs/promises";
import { customAlphabet } from "nanoid";
import nunjucks from "nunjucks";

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

export async function addDataInJSONFile(jsonPath, dataToAdd) {
  dataToAdd.id = nanoid();
  dataToAdd.createdAt = new Date().toISOString();
  dataToAdd.updatedAt = "";
  const data = await readJSON(jsonPath);
  data.unshift(dataToAdd);
  await writeJSON(jsonPath, data);
  return data;
}

export async function modifyDataInJSONFile(jsonPath, jsonData, indexData) {
  const data = await readJSON(jsonPath);
  const dataArticle = data[indexData];
  dataArticle.title = jsonData.title;
  dataArticle.category = jsonData.category;
  dataArticle.img = jsonData.img;
  dataArticle.content = jsonData.content;
  dataArticle.updatedAt = new Date().toISOString();
  dataArticle.status = jsonData.status;
  dataArticle.description = jsonData.description;

  await writeJSON(jsonPath, data);
  return data;
}

export async function deleteDataInJSONFile(jsonPath, indexToDelete) {
  const data = await readJSON(jsonPath);
  data.splice(indexToDelete, 1);

  await writeJSON(jsonPath, data);
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
    user.password === inputIdentifiers.password
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

export async function addElementinNavbar(dataToAdd) {
  const data = await readJSON("src/data/global.json");
  const navlinks = data.navlinks;
  navlinks.unshift(dataToAdd);
  await writeJSON("src/data/global.json", data);
  return data;
}

export async function deleteElementInNavbar(indexToDelete) {
  const data = await readJSON("src/data/global.json");
  const navlinks = data.navlinks;
  navlinks.splice(indexToDelete, 1);

  await writeJSON("src/data/global.json", data);
  return data;
}

export async function addLinkinFooter(dataToAdd) {
  const data = await readJSON("src/data/global.json");
  const footerLinks = data.footerLinks;
  footerLinks.unshift(dataToAdd);
  await writeJSON("src/data/global.json", data);
  return data;
}

export async function deleteLinkinFooter(indexToDelete) {
  const data = await readJSON("src/data/global.json");
  const footerLinks = data.footerLinks;
  footerLinks.splice(indexToDelete, 1);

  await writeJSON("src/data/global.json", data);
  return data;
}

export async function modifyElementinNavbar(jsonData) {
  const data = await readJSON("src/data/global.json");
  const dataNavbar = data.navlinks;

  for (let i = 0; i < dataNavbar.length; i++) {
    dataNavbar[i].title = jsonData[`title${i}`];
    dataNavbar[i].href = jsonData[`href${i}`];
  }

  await writeJSON("src/data/global.json", data);
  return data;
}

export async function modifyLinkinFooter(jsonData) {
  const data = await readJSON("src/data/global.json");
  const footerLinks = data.footerLinks;

  for (let i = 0; i < footerLinks.length; i++) {
    footerLinks[i].title = jsonData[`title${i}`];
    footerLinks[i].href = jsonData[`href${i}`];
  }

  await writeJSON("src/data/global.json", data);
  return data;
}

export async function modifySocialMediainFooter(jsonData) {
  const data = await readJSON("src/data/global.json");
  const footerSocialMedia = data.footerSocialMedia;

  for (let i = 0; i < footerSocialMedia.length; i++) {
    footerSocialMedia[i].href = jsonData[`href${i}`];
  }

  await writeJSON("src/data/global.json", data);
  return data;
}

export async function addArticleCategory(dataToAdd) {
  const data = await readJSON("src/data/articleCategories.json");
  dataToAdd.createdAt = new Date().toISOString();
  dataToAdd.updatedAt = "";
  data.unshift(dataToAdd);
  await writeJSON("src/data/articleCategories.json", data);
  return data;
}
