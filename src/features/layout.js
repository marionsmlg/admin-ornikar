import db from "../utils-database.js";

export const update = {
  headerOrFooterLink: async function (form, tableName) {
    const arrOfKeys = Object.keys(form);

    for (const key of arrOfKeys) {
      const arrOfKeyAndId = key.split("_");
      const keyName = arrOfKeyAndId[0];
      const id = arrOfKeyAndId[1];
      if (keyName === "title") {
        await db(tableName).where({ id: id }).update({ title: form[key] });
      }
      if (keyName === "href") {
        await db(tableName).where({ id: id }).update({ href: form[key] });
      }
    }
  },

  footerSocialMedia: async function (form) {
    const arrOfArticleId = Object.keys(form);
    for (const articleId of arrOfArticleId) {
      await db("footer_social_media")
        .where({ id: articleId })
        .update({ href: form[articleId] });
    }
  },
};
