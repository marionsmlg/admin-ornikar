import db from "../utils-database.js";

export const update = {
  headerOrFooterLink: async function (form, tableName) {
    const trx = await db.transaction();
    const arrOfKeys = Object.keys(form);
    try {
      for (const key of arrOfKeys) {
        const arrOfKeyAndId = key.split("_");
        const keyName = arrOfKeyAndId[0];
        const id = arrOfKeyAndId[1];
        if (keyName === "title") {
          await trx(tableName).where({ id: id }).update({ title: form[key] });
        }
        if (keyName === "href") {
          await trx(tableName).where({ id: id }).update({ href: form[key] });
        }
      }
      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    } finally {
      await trx.destroy();
    }
  },

  footerSocialMedia: async function (form) {
    const arrOfArticleId = Object.keys(form);
    const trx = await db.transaction();
    try {
      for (const articleId of arrOfArticleId) {
        await trx("footer_social_media")
          .where({ id: articleId })
          .update({ href: form[articleId] });
      }
      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    } finally {
      await trx.destroy();
    }
  },
};
