import {
  convertFormDataToJSON,
  readBody,
  readJSON,
  render404,
  modifyDataInJSONFile,
  deleteDataInJSONFile,
  identifiersAreValid,
  addDataInJSONFile,
  addElementinNavbar,
  deleteElementInNavbar,
  addLinkinFooter,
  deleteLinkinFooter,
  modifyElementinNavbar,
  modifyLinkinFooter,
  modifySocialMediainFooter,
  addArticleCategory,
} from "./utils.js";
import path from "path";

const ARTICLES_DATA_PATH = "src/data/articles.json";
const GLOBAL_DATA_PATH = "src/data/global.json";

export async function handlePOST(request, response, requestURLData) {
  const body = await readBody(request);
  const form = convertFormDataToJSON(body);

  const articles = await readJSON(ARTICLES_DATA_PATH);
  const globalData = await readJSON(GLOBAL_DATA_PATH);
  const navlinks = globalData.navlinks;
  const footerLinks = globalData.footerLinks;
  const indexToDelete = articles.findIndex((article) => article.id === form.id);
  const basenameURL = path.basename(requestURLData.pathname);
  const indexToModify = articles.findIndex(
    (article) => article.id === basenameURL
  );
  const indexElementNavbarToDelete = navlinks.findIndex(
    (element) => element.title === form.title
  );
  const indexLinkFooterToDelete = footerLinks.findIndex(
    (element) => element.title === form.title
  );

  if (
    requestURLData.pathname === `/articles/${basenameURL}` &&
    requestURLData.pathname !== "/articles/create"
  ) {
    await modifyDataInJSONFile(ARTICLES_DATA_PATH, form, indexToModify);
    response.statusCode = 302;
    response.setHeader("Location", `/articles?editSuccess=true`);
    response.end();
  } else if (requestURLData.pathname === "/deleteArticle") {
    await deleteDataInJSONFile(ARTICLES_DATA_PATH, indexToDelete);
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
    await addDataInJSONFile(ARTICLES_DATA_PATH, form);
    response.statusCode = 302;
    response.setHeader("Location", `/articles?createSuccess=true`);
    response.end();
  } else if (requestURLData.pathname === "/header") {
    await addElementinNavbar(form);
    response.statusCode = 302;
    response.setHeader("Location", `/header?createSuccess=true`);
    response.end();
  } else if (requestURLData.pathname === "/deleteElementHeader") {
    await deleteElementInNavbar(indexElementNavbarToDelete);
    response.statusCode = 302;
    response.setHeader("Location", `/header?createSuccess=true`);
    response.end();
  } else if (requestURLData.pathname === "/modifyHeader") {
    await modifyElementinNavbar(form);
    response.statusCode = 302;
    response.setHeader("Location", `/header?createSuccess=true`);
    response.end();
  } else if (requestURLData.pathname === "/footer") {
    await addLinkinFooter(form);
    response.statusCode = 302;
    response.setHeader("Location", `/footer?createSuccess=true`);
    response.end();
  } else if (requestURLData.pathname === "/deleteLinkFooter") {
    await deleteLinkinFooter(indexLinkFooterToDelete);
    response.statusCode = 302;
    response.setHeader("Location", `/footer?createSuccess=true`);
    response.end();
  } else if (requestURLData.pathname === "/modifyLinkFooter") {
    await modifyLinkinFooter(form);
    response.statusCode = 302;
    response.setHeader("Location", `/footer?createSuccess=true`);
    response.end();
  } else if (requestURLData.pathname === "/modifySocialMediaFooter") {
    await modifySocialMediainFooter(form);
    response.statusCode = 302;
    response.setHeader("Location", `/footer?createSuccess=true`);
    response.end();
  } else if (requestURLData.pathname === "/categories") {
    await addArticleCategory(form);
    response.statusCode = 302;
    response.setHeader("Location", `/categories?createSuccess=true`);
    response.end();
  } else {
    render404(response);
  }
}
