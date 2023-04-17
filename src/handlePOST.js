import {
  convertFormDataToJSON,
  readBody,
  readJSON,
  render404,
  editArticle,
  deleteArticle,
  identifiersAreValid,
  addArticle,
  addLinkInNavbar,
  addLinkInFooter,
  editLinkInNavbar,
  editLinkInFooter,
  editSocialMediaInFooter,
  addArticleCategory,
  deleteArticleCategory,
  editArticleCategory,
  getSessionId,
  removeSessionId,
} from "./utils.js";
import path from "path";
import cookie from "cookie";

export async function handlePOST(request, response, requestURLData) {
  const body = await readBody(request);
  const form = convertFormDataToJSON(body);
  const basenameURL = path.basename(requestURLData.pathname);

  console.log({ form });
  if (
    requestURLData.pathname === `/articles/${basenameURL}` &&
    requestURLData.pathname !== "/articles/create"
  ) {
    await editArticle(form, basenameURL);
    response.statusCode = 302;
    response.setHeader("Location", `/articles?editSuccess=true`);
    response.end();
  } else if (requestURLData.pathname === "/article/delete") {
    await deleteArticle(form);
    response.statusCode = 302;
    response.setHeader("Location", `/articles?deleteSuccess=true`);
    response.end();
  } else if (requestURLData.pathname === "/login") {
    console.log(await identifiersAreValid(form));
    if (await identifiersAreValid(form)) {
      const sessionId = await getSessionId(form);
      response.setHeader(
        "Set-Cookie",
        `sessionId=${sessionId}; HttpOnly; Max-Age=(3600*7);Path=/`
      );
      console.log(request.headers.cookie);
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
    await addArticle(form);
    response.statusCode = 302;
    response.setHeader("Location", `/articles?createSuccess=true`);
    response.end();
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
    await addArticleCategory(form);
    response.statusCode = 302;
    response.setHeader("Location", `/categories?createSuccess=true`);
    response.end();
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
  } else {
    render404(response);
  }
}
