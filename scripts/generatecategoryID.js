export async function addCategoryIdToJSON() {
  const articles = await readJSON("src/data/articles.json");
  const categories = await readJSON("src/data/articles-categories.json");
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

async function removeCategory() {
  const array = await readJSON("src/data/articles.json");
  array.forEach((item) => delete item.category);

  await writeJSON("src/data/articles.json", array);
  return array;
}

await removeCategory();

// export async function editArticleCategory(jsonData) {
//   const dataArticlesCategories = await readJSON(
//     "src/data/articles-categories.json"
//   );
//   const dataArticles = await readJSON("src/data/articles.json");

//   for (let i = 0; i < dataArticlesCategories.length; i++) {
//     dataArticlesCategories[i].name = jsonData[`name${i}`];
//     dataArticlesCategories[i].updatedAt = new Date().toISOString();
//     const articleCategory = dataArticlesCategories.find(
//       (articleCategory) => articleCategory.name === jsonData[`name${i}`]
//     );
//     const articleID = articleCategory.id;
//     for (const article of dataArticles) {
//       if (article.categoryId === articleID) {
//         article.category = articleCategory.name;
//         await writeJSON("src/data/articles.json", dataArticles);
//       }
//     }
//   }
//   await writeJSON("src/data/articles-categories.json", dataArticlesCategories);
//   return dataArticlesCategories;
// }

export async function editCategoriesinArticles() {
  const dataArticlesCategories = await readJSON(
    "src/data/articles-categories.json"
  );
  const dataArticles = await readJSON("src/data/articles.json");
  for (let article of dataArticles) {
    for (let category of dataArticlesCategories) {
      if (article.categoryId === category.id) {
        article.category = category.name;
      }
    }
  }
  await writeJSON("src/data/articles.json", dataArticles);
}

export async function generateId() {
  const users = await readJSON("src/data/users.json");

  for (let user of users) {
    user.id = nanoid();
  }
  await writeJSON("src/data/users.json", users);
}

export async function generatePassewordHash() {
  const users = await readJSON("src/data/users.json");

  for (let user of users) {
    user.password = await argon2.hash(user.password);
  }
  await writeJSON("src/data/users.json", users);
  return users;
}

// console.log(await generatePassewordHash());
