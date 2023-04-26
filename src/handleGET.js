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
import "dotenv/config";

const ARTICLE_CATEGORIES_DATA_PATH = "src/data/articles-categories.json";
const FOOTER_DATA_PATH = "src/data/footer.json";
const HEADER_DATA_PATH = "src/data/header.json";
const ARTICLES_DATA_PATH = "src/data/articles.json";

export async function handleGET(request, response, requestURLData) {
  if (path.extname(requestURLData.pathname) !== "") {
    if (path.extname(requestURLData.pathname) === ".js") {
      const jsFilePath = `src/js${requestURLData.pathname}`;
      await renderFilePath(response, jsFilePath);
      return;
    }
    const assetsFilePath = `src/assets${requestURLData.pathname}`;
    await renderFilePath(response, assetsFilePath);
    return;
  }

  const ORNIKAR_ADMIN_API_KEY = process.env.ORNIKAR_ADMIN_API_KEY;
  const authorizationApi = request.headers.authorization;
  const dataApi = [
    { path: "/api/articles", dataJsonPath: ARTICLES_DATA_PATH },
    {
      path: "/api/articles-categories",
      dataJsonPath: ARTICLE_CATEGORIES_DATA_PATH,
    },
    { path: "/api/header", dataJsonPath: HEADER_DATA_PATH },
    { path: "/api/footer", dataJsonPath: FOOTER_DATA_PATH },
  ];

  for (const api of dataApi) {
    if (requestURLData.pathname === api.path) {
      if (authorizationApi !== ORNIKAR_ADMIN_API_KEY) {
        response.status = 403;
        response.end("Forbidden");
        return;
      }
      const data = await readJSON(api.dataJsonPath);
      response.statusCode = 200;
      response.end(JSON.stringify(data));
      return;
    }
  }

  if (
    requestURLData.pathname !== `/login` &&
    requestURLData.pathname !== `/sign-up`
  ) {
    const cookieLogin = cookie.parse(request.headers.cookie || "");
    const sessionId = cookieLogin.sessionId;
    if (!(await hasSessionId(sessionId))) {
      response.statusCode = 302;
      response.setHeader("Location", `/login`);
      response.end();
      return;
    }
  } else {
    const cookieLogin = cookie.parse(request.headers.cookie || "");
    const sessionId = cookieLogin.sessionId;
    if (await hasSessionId(sessionId)) {
      response.statusCode = 302;
      response.setHeader("Location", `/`);
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
