import http from "http";
import nunjucks from "nunjucks";
import { formatDate, createArticleSlug } from "./utils.js";
import { getCategoryNameById } from "./features/articles.js";
import { handlePOST } from "./handlePOST.js";
import { handleGET } from "./handleGET.js";

let env = nunjucks.configure({
  noCache: true,
});

env.addFilter("formatDate", formatDate);
env.addFilter("getCategoryNameById", getCategoryNameById);
env.addFilter("createArticleSlug", createArticleSlug);
const PORT = 3000;

const server = http.createServer(async (request, response) => {
  try {
    await handleServer(request, response);
  } catch (error) {
    console.error(error);
    response.statusCode = 500;
    response.end("Internal server error");
  }
});

async function handleServer(request, response) {
  const requestURLData = new URL(request.url, `http://localhost:${PORT}`);
  console.info(`\n---\nRequest ${new Date().getTime()}`, {
    method: request.method,
    url: request.url,
    requestURLData,
  });

  if (request.method === "GET") {
    await handleGET(request, response, requestURLData);
  } else if (request.method === "POST") {
    await handlePOST(request, response, requestURLData);
  } else {
    render404(response);
  }
}

server.listen(PORT, () => {
  console.info(`Server started on port ${PORT}`);
});
