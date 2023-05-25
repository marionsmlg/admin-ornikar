import { convertFormDataToJSON, readBody, render404 } from "./utils.js";
import {
  addArticle,
  editArticle,
  deleteArticle,
  addArticleCategory,
  deleteArticleCategory,
  editArticleCategory,
  dataArticleAreValid,
  dataCategoryIsValid,
} from "./features/articles.js";
import {
  identifiersAreValid,
  getSessionId,
  removeSessionId,
  addNewUser,
  userExists,
  dataUserAreValid,
} from "./features/users.js";
import {
  addLinkInNavbar,
  addLinkInFooter,
  editLinkInNavbar,
  editLinkInFooter,
  editSocialMediaInFooter,
} from "./features/global.js";
import path from "path";
import cookie from "cookie";

export async function handlePOST(request, response, requestURLData) {
  const body = await readBody(request);
  const form = convertFormDataToJSON(body);
  const basenameURL = path.basename(requestURLData.pathname);

  const cookieLogin = cookie.parse(request.headers.cookie || "");
  const sessionId = cookieLogin.sessionId;

  console.log({ form });
  if (
    requestURLData.pathname === `/articles/${basenameURL}` &&
    requestURLData.pathname !== "/articles/create"
  ) {
    if (dataArticleAreValid(form)) {
      await editArticle(form, basenameURL, sessionId);
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
    await deleteArticle(form);
    response.statusCode = 302;
    response.setHeader("Location", `/articles?deleteSuccess=true`);
    response.end();
  } else if (requestURLData.pathname === "/login") {
    if (await identifiersAreValid(form)) {
      const sessionId = await getSessionId(form);
      response.setHeader(
        "Set-Cookie",
        `sessionId=${sessionId}; HttpOnly; Max-Age=(3600*7);Path=/`
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
    const cookieLogin = cookie.parse(request.headers.cookie || "");
    const sessionId = cookieLogin.sessionId;
    await removeSessionId(sessionId);
    response.statusCode = 302;
    response.setHeader("Set-Cookie", `sessionId=; HttpOnly; Max-Age=0;Path=/`);
    response.setHeader("Location", `/login`);
    response.end();
  } else if (requestURLData.pathname === "/articles/create") {
    if (dataArticleAreValid(form)) {
      await addArticle(form, sessionId);
      response.statusCode = 302;
      response.setHeader("Location", `/articles?createSuccess=true`);
      response.end();
    } else {
      response.statusCode = 302;
      response.setHeader("Location", `/articles/create?createFailed=true`);
      response.end();
    }
  } else if (requestURLData.pathname === "/header/link/add") {
    await addLinkInNavbar(form);
    response.statusCode = 302;
    response.setHeader("Location", `/header?createSuccess=true`);
    response.end();
  } else if (requestURLData.pathname === "/header/link/edit") {
    await editLinkInNavbar(form);
    response.statusCode = 302;
    response.setHeader("Location", `/header?editSuccess=true`);
    response.end();
  } else if (requestURLData.pathname === "/footer/link/add") {
    await addLinkInFooter(form);
    response.statusCode = 302;
    response.setHeader("Location", `/footer?createSuccess=true`);
    response.end();
  } else if (requestURLData.pathname === "/footer/link/edit") {
    await editLinkInFooter(form);
    response.statusCode = 302;
    response.setHeader("Location", `/footer?editSuccess=true`);
    response.end();
  } else if (requestURLData.pathname === "/footer/socialmedia/edit") {
    await editSocialMediaInFooter(form);
    response.statusCode = 302;
    response.setHeader("Location", `/footer?editSuccess=true`);
    response.end();
  } else if (requestURLData.pathname === "/article-category/add") {
    if (dataCategoryIsValid(form)) {
      await addArticleCategory(form);
      response.statusCode = 302;
      response.setHeader("Location", `/categories?createSuccess=true`);
      response.end();
    } else {
      response.statusCode = 302;
      response.setHeader("Location", `/categories?createFailed=true`);
      response.end();
    }
  } else if (requestURLData.pathname === "/article-category/delete") {
    await deleteArticleCategory(form);
    response.statusCode = 302;
    response.setHeader("Location", `/categories?deleteSuccess=true`);
    response.end();
  } else if (requestURLData.pathname === "/article-category/edit") {
    await editArticleCategory(form);
    response.statusCode = 302;
    response.setHeader("Location", `/categories?editSuccess=true`);
    response.end();
  } else if (requestURLData.pathname === "/sign-up") {
    if (!(await userExists(form)) && dataUserAreValid(form)) {
      await addNewUser(form);
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
