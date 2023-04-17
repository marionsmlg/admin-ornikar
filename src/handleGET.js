import {
  isDir,
  isFile,
  readJSON,
  render404,
  articleIDExists,
  renderFilePath,
  hasSessionId,
  getUserEmail,
} from "./utils.js";
import path from "path";
import nunjucks from "nunjucks";
import cookie from "cookie";

const ARTICLE_CATEGORIES_DATA_PATH = "src/data/articles-categories.json";
const FOOTER_DATA_PATH = "src/data/footer.json";
const HEADER_DATA_PATH = "src/data/header.json";
const ARTICLES_DATA_PATH = "src/data/articles.json";

export async function handleGET(request, response, requestURLData) {
  if (path.extname(requestURLData.pathname) !== "") {
    const assetsFilePath = `src/assets${requestURLData.pathname}`;
    console.log({ assetsFilePath });
    await renderFilePath(response, assetsFilePath);
    return;
  }
  const secret = "HaB>`[kP=3JNN),T";
  const authorizationApi = request.headers.authorization;
  // if (authorizationApi !== secret) {
  //   response.status = 403;
  //   response.end("Forbidden");
  // }
  if (
    requestURLData.pathname === "/api/articles" &&
    authorizationApi === secret
  ) {
    const dataArticles = await readJSON(ARTICLES_DATA_PATH);
    response.statusCode = 200;
    response.end(JSON.stringify(dataArticles));
    return;
  } else if (requestURLData.pathname === "/api/articles-categories") {
    const dataArticlesCategories = await readJSON(ARTICLE_CATEGORIES_DATA_PATH);
    response.statusCode = 200;
    response.end(JSON.stringify(dataArticlesCategories));
    return;
  } else if (requestURLData.pathname === "/api/header") {
    const dataHeader = await readJSON(HEADER_DATA_PATH);
    response.statusCode = 200;
    response.end(JSON.stringify(dataHeader));
    return;
  } else if (requestURLData.pathname === "/api/footer") {
    const dataFooter = await readJSON(FOOTER_DATA_PATH);
    response.statusCode = 200;
    response.end(JSON.stringify(dataFooter));
    return;
  }

  if (requestURLData.pathname !== `/login`) {
    const cookieLogin = cookie.parse(request.headers.cookie || "");
    const sessionId = cookieLogin.sessionId;
    if (!(await hasSessionId(sessionId))) {
      response.statusCode = 302;
      response.setHeader("Location", `/login`);
      response.end();
      return;
    }
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

  const cookieLogin = cookie.parse(request.headers.cookie || "");
  const sessionId = cookieLogin.sessionId;

  const templateData = {
    searchParams: searchParams,
    highlightArticles: articles.slice(0, 3),
    articles: articles,
    article: article,
    articleCategories: await readJSON(ARTICLE_CATEGORIES_DATA_PATH),
    dataNavbar: headerData.navlinks,
    footerLinks: footerData.footerLinks,
    footerSocialMedia: footerData.footerSocialMedia,
    userEmail: await getUserEmail(sessionId),
  };

  const html = nunjucks.render(templatePath, templateData);
  response.end(html);
}
