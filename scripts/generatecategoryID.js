export async function addCategoryIdToJSON() {
  const articles = await readJSON(ARTICLES_DATA_PATH);
  const categories = await readJSON("src/data/articleCategories.json");
  for (let article of articles) {
    for (let category of categories) {
      if (article.category === category.name) {
        article.categoryId = category.id;
      }
    }
  }
  await writeJSON("src/data/articles.json", articles);
}

await addCategoryIdToJSON();
