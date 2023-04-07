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
} from "./utils.js";
import path from "path";

const ARTICLES_DATA_PATH = "src/data/articles.json";

export async function handlePOST(request, response, requestURLData) {
  const body = await readBody(request);
  const form = convertFormDataToJSON(body);

  const articles = await readJSON(ARTICLES_DATA_PATH);
  const basenameURL = path.basename(requestURLData.pathname);
  const indexToModify = articles.findIndex(
    (article) => article.id === basenameURL
  );

  const indexToDelete = form.index;
  console.log({ form });
  if (
    requestURLData.pathname === `/articles/${basenameURL}` &&
    requestURLData.pathname !== "/articles/create"
  ) {
    await editArticle(form, indexToModify);
    response.statusCode = 302;
    response.setHeader("Location", `/articles?editSuccess=true`);
    response.end();
  } else if (requestURLData.pathname === "/article/delete") {
    await deleteArticle(indexToDelete);
    response.statusCode = 302;
    response.setHeader("Location", `/articles?deleteSuccess=true`);
    response.end();
  } else if (requestURLData.pathname === "/login") {
    if (await identifiersAreValid(form)) {
      response.statusCode = 302;
      response.setHeader("Location", `/`);
      response.end();
    } else {
      response.statusCode = 302;
      response.setHeader("Location", `/login?loginFailed=true`);
      response.end();
    }
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
  } else if (requestURLData.pathname === "/articles/categories/add") {
    await addArticleCategory(form);
    response.statusCode = 302;
    response.setHeader("Location", `/categories?createSuccess=true`);
    response.end();
  } else if (requestURLData.pathname === "/articles/categories/delete") {
    await deleteArticleCategory(indexToDelete);
    response.statusCode = 302;
    response.setHeader("Location", `/categories?deleteSuccess=true`);
    response.end();
  } else if (requestURLData.pathname === "/articles/categories/edit") {
    await editArticleCategory(form);
    response.statusCode = 302;
    response.setHeader("Location", `/categories?createSuccess=true`);
    response.end();
  } else {
    render404(response);
  }
}
