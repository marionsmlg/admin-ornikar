import knex from "knex";
import "dotenv/config";

const db = knex({
  client: "pg",
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
});

export async function fetchDataFromTable(tableName) {
  const data = await db(tableName).select("*");
  await db.destroy();
  return data;
}

const form = {
  title: "Coucou1234",
  category_id: "ybz8xq1xds",
  status: "draft",
  img: "https://picsum.photos/300/200?ovt6gpfm2h",
  content:
    "<p>orem Ipsum&nbsp;is simply drem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>\r\n<h2>Why do we use it?</h2>\r\n<p>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).</p>\r\n<h2>Where does it come from?</h2>\r\n<p>Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock,&nbsp;</p>\r\n<p>vxvxvxv</p>",
  id: "w55p36nt63",
  created_at: "2023-05-08T09:51:42.606Z",
  updated_at: "2023-05-08T09:55:29.141Z",
  created_by: "vuqv83hazz",
  updated_by: "vuqv83hazz",
};

async function addFormData(form) {
  // form.categoryId = form.categoryId;
  // form.id = nanoid();
  // form.createdAt = new Date().toISOString();
  // form.updatedAt = "";
  // form.created_by = await getUserId(sessionId);
  // form.updated_by = "";
  await db.transaction(async (trx) => {
    await trx("article").insert(form);
    await trx.commit();
    await db.destroy();
  });
}

// await addFormData(form);
