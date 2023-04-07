import {
  isDir,
  isFile,
  readJSON,
  render404,
  articleIDExists,
  renderFilePath,
} from "./utils.js";
import path from "path";
import nunjucks from "nunjucks";

const ARTICLE_CATEGORIES_DATA_PATH = "src/data/articleCategories.json";
const FOOTER_DATA_PATH = "src/data/footer.json";
const HEADER_DATA_PATH = "src/data/header.json";
const ARTICLES_DATA_PATH = "src/data/articles.json";

export async function handleGET(response, requestURLData) {
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
  const footerData = await readJSON(FOOTER_DATA_PATH);
  const headerData = await readJSON(HEADER_DATA_PATH);

  const templateData = {
    searchParams: searchParams,
    highlightArticles: articles.slice(0, 3),
    articles: articles,
    article: article,
    articleCategories: await readJSON(ARTICLE_CATEGORIES_DATA_PATH),
    dataNavbar: headerData.navlinks,
    footerLinks: footerData.footerLinks,
    footerSocialMedia: footerData.footerSocialMedia,
  };

  const html = nunjucks.render(templatePath, templateData);
  response.end(html);
}
