import fsp from "fs/promises";
import path from "path";
import nunjucks from "nunjucks";
nunjucks.configure({ autoescape: true });

const dataHomePage = await getDataHomePage();

async function main() {
  await fsp.rm("./dist", { recursive: true, force: true });
  await fsp.mkdir("./dist");

  await handleNjkToHtml(
    "./src/template/index.njk",
    "./dist/index.html",
    dataHomePage
  );

  await handleNjkToHtml(
    "./src/template/articles.njk",
    "./dist/articles.html",
    dataHomePage
  );
}

main().catch(console.error);

async function getDataHomePage() {
  const data = await readJSON("./src/data/global.json");

  const articles = await readJSON("./src/data/articles.json");
  data.articles = articles;

  return data;
}

async function readJSON(jsonPath) {
  const dataStr = await fsp.readFile(jsonPath);
  const data = JSON.parse(dataStr);
  return data;
}

async function mergeJsonFiles(arrOfjsonPaths) {
  let mergedData = {};

  for (const jsonPath of arrOfjsonPaths) {
    const data = await readJSON(jsonPath);
    mergedData = { ...mergedData, ...data };
  }

  return mergedData;
}

async function handleNjkToHtml(src, dest, data) {
  const html = nunjucks.render(src, data);
  const dirDest = path.dirname(dest);
  await fsp.mkdir(dirDest, { recursive: true, force: true });

  await fsp.writeFile(dest, html);
  console.info(`${path.basename(dest)} file created`);
}
