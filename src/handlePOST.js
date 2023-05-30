import { convertFormDataToJSON, readBody, render404 } from "./utils.js";
import {
  dataArticleAreValid,
  dataCategoryIsValid,
  article,
  articleCategory,
} from "./features/articles.js";
import {
  identifiersAreValid,
  userExists,
  dataUserAreValid,
  sessionId,
  user,
} from "./features/users.js";
import { update } from "./features/global.js";
import path from "path";
import cookie from "cookie";
import { v4 as uuidv4 } from "uuid";

export async function handlePOST(request, response, requestURLData) {
  const body = await readBody(request);
  const form = convertFormDataToJSON(body);
  const basenameURL = path.basename(requestURLData.pathname);

  const cookieLogin = cookie.parse(request.headers.cookie || "");
  const sessionIdInCookie = cookieLogin.sessionId;

  console.log({ form });
  if (
    requestURLData.pathname === `/articles/${basenameURL}` &&
    requestURLData.pathname !== "/articles/create"
  ) {
    if (dataArticleAreValid(form)) {
      await article.update(form, basenameURL, sessionIdInCookie);
      response.statusCode = 302;
      response.setHeader("Location", `/articles?editSuccess=true`);
      response.end();
    } else {
      response.statusCode = 302;
      response.setHeader(
        "Location",
        `/articles/${basenameURL}?editFailed=true`
      );
      response.end();
    }
  } else if (requestURLData.pathname === "/article/delete") {
    await article.delete(form);
    response.statusCode = 302;
    response.setHeader("Location", `/articles?deleteSuccess=true`);
    response.end();
  } else if (requestURLData.pathname === "/login") {
    if (await identifiersAreValid(form)) {
      const newSessionId = uuidv4();
      await sessionId.add(form, newSessionId);
      response.setHeader(
        "Set-Cookie",
        `sessionId=${newSessionId}; HttpOnly; Max-Age=(3600*7);Path=/`
      );
      response.statusCode = 302;
      response.setHeader("Location", `/`);
      response.end();
    } else {
      response.statusCode = 302;
      response.setHeader("Location", `/login?loginFailed=true`);
      response.end();
    }
  } else if (requestURLData.pathname === "/logout") {
    await sessionId.remove(sessionIdInCookie);
    response.statusCode = 302;
    response.setHeader("Set-Cookie", `sessionId=; HttpOnly; Max-Age=0;Path=/`);
    response.setHeader("Location", `/login`);
    response.end();
  } else if (requestURLData.pathname === "/articles/create") {
    if (dataArticleAreValid(form)) {
      await article.add(form, sessionIdInCookie);
      response.statusCode = 302;
      response.setHeader("Location", `/articles?createSuccess=true`);
      response.end();
    } else {
      response.statusCode = 302;
      response.setHeader("Location", `/articles/create?createFailed=true`);
      response.end();
    }
  } else if (requestURLData.pathname === "/header/link/edit") {
    await update.headerOrFooterLink(form, "header_link");
    response.statusCode = 302;
    response.setHeader("Location", `/header?editSuccess=true`);
    response.end();
  } else if (requestURLData.pathname === "/footer/link/edit") {
    await update.headerOrFooterLink(form, "footer_link");
    response.statusCode = 302;
    response.setHeader("Location", `/footer?editSuccess=true`);
    response.end();
  } else if (requestURLData.pathname === "/footer/socialmedia/edit") {
    await update.footerSocialMedia(form);
    response.statusCode = 302;
    response.setHeader("Location", `/footer?editSuccess=true`);
    response.end();
  } else if (requestURLData.pathname === "/article-category/add") {
    if (dataCategoryIsValid(form)) {
      await articleCategory.add(form);
      response.statusCode = 302;
      response.setHeader("Location", `/categories?createSuccess=true`);
      response.end();
    } else {
      response.statusCode = 302;
      response.setHeader("Location", `/categories?createFailed=true`);
      response.end();
    }
  } else if (requestURLData.pathname === "/article-category/delete") {
    await articleCategory.delete(form);
    response.statusCode = 302;
    response.setHeader("Location", `/categories?deleteSuccess=true`);
    response.end();
  } else if (requestURLData.pathname === "/article-category/edit") {
    await articleCategory.update(form);
    response.statusCode = 302;
    response.setHeader("Location", `/categories?editSuccess=true`);
    response.end();
  } else if (requestURLData.pathname === "/sign-up") {
    if (!(await userExists(form)) && dataUserAreValid(form)) {
      await user.add({ email: form.email, password: form.password });
      response.statusCode = 302;
      response.setHeader("Location", `/login`);
      response.end();
    } else {
      response.statusCode = 302;
      response.setHeader("Location", `/sign-up?signUpFailed=true`);
      response.end();
    }
  } else {
    render404(response);
  }
}
