import { isDir, isFile, readJSON, render404, renderFilePath } from "./utils.js";
import { articleIDExists } from "./features/articles.js";
import { hasSessionId, user } from "./features/users.js";
import path from "path";
import nunjucks from "nunjucks";
import cookie from "cookie";
import "dotenv/config";
import { fetchDataFromTable } from "./utils-database.js";

export async function handleGET(request, response, requestURLData) {
  if (path.extname(requestURLData.pathname) !== "") {
    if (path.extname(requestURLData.pathname) === ".js") {
      const fileName = path.basename(requestURLData.pathname);
      const jsFilePath = `src/js/${fileName}`;
      response.setHeader("Content-Type", "application/javascript");
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
    { path: "/api/articles", tableName: "article" },
    {
      path: "/api/articles-categories",
      tableName: "article_category",
    },
    { path: "/api/header-link", tableName: "header_link" },
    { path: "/api/footer-link", tableName: "footer_link" },
    { path: "/api/footer-social-media", tableName: "footer_social_media" },
  ];

  for (const api of dataApi) {
    if (requestURLData.pathname === api.path) {
      if (authorizationApi !== ORNIKAR_ADMIN_API_KEY) {
        response.status = 403;
        response.end("Forbidden");
        return;
      }
      const data = await fetchDataFromTable(api.tableName);
      response.statusCode = 200;
      response.end(data);
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
  const articles = await fetchDataFromTable("article");
  const article = articles.find((article) => article.id === basenameURL);
  const cookieLogin = cookie.parse(request.headers.cookie || "");
  const sessionId = cookieLogin.sessionId;

  const templateData = {
    searchParams: searchParams,
    highlightArticles: articles.slice(0, 3),
    articles: articles,
    article: article,
    articleCategories: await fetchDataFromTable("article_category"),
    dataNavbar: await fetchDataFromTable("header_link"),
    footerLinks: await fetchDataFromTable("footer_link"),
    footerSocialMedia: await fetchDataFromTable("footer_social_media"),
    userEmail: await user.getEmail(sessionId),
  };

  const html = nunjucks.render(templatePath, templateData);
  response.end(html);
}
