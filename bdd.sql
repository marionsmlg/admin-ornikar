CREATE TABLE article_category (
  id VARCHAR(10) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP
);


CREATE TABLE article (
  id VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  categoryId VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL,
  img VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP,
  created_by VARCHAR(255) NOT NULL,
  updated_by VARCHAR(255),
  PRIMARY KEY (id)
);

CREATE TABLE "user" (
  id VARCHAR(20) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  session_id VARCHAR(20)
);

CREATE TABLE header_link (
  id VARCHAR(10) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  href VARCHAR(255) NOT NULL
);

CREATE TABLE "footer_link" (
    id VARCHAR(10) PRIMARY KEY,
    href VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL
);

-- /////////////////////////////////////////////////////////////////////////

CREATE TABLE article_category (
  id UUID DEFAULT uuid_generate_v4 () PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  "created_at" TIMESTAMPTZ DEFAULT (now()),
  "updated_at" TIMESTAMPTZ
);
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON "article_category"
FOR EACH ROW
EXECUTE PROCEDURE moddatetime(updated_at);



CREATE TYPE article_status AS ENUM ('published', 'draft');

CREATE TABLE article (
  id UUID DEFAULT uuid_generate_v4 () PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
category_id UUID NOT NULL,
  status article_status NOT NULL,
  img VARCHAR(1000) NOT NULL,
  content TEXT NOT NULL,
  "created_at" TIMESTAMPTZ DEFAULT (now()),
  "updated_at" TIMESTAMPTZ,
  created_by UUID NOT NULL,
  updated_by UUID
);
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON article
FOR EACH ROW
EXECUTE PROCEDURE moddatetime(updated_at);

CREATE TABLE "user" (
 id UUID DEFAULT uuid_generate_v4 () PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(100) NOT NULL,
  "created_at" TIMESTAMPTZ DEFAULT (now()),
  session_id UUID
);

CREATE TABLE header_link (
id UUID DEFAULT uuid_generate_v4 () PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  href VARCHAR(500) NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT (now()),
      "updated_at" TIMESTAMPTZ
);

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON "header_link"
FOR EACH ROW
EXECUTE PROCEDURE moddatetime(updated_at);


CREATE TABLE "footer_link" (
id UUID DEFAULT uuid_generate_v4 () PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  href VARCHAR(500) NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT (now()),
      "updated_at" TIMESTAMPTZ
);

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON "footer_link"
FOR EACH ROW
EXECUTE PROCEDURE moddatetime(updated_at);


CREATE TABLE "footer_social_media"(
id UUID DEFAULT uuid_generate_v4 () PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  href VARCHAR(500) NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT (now()),
      "updated_at" TIMESTAMPTZ
);

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON "footer_social_media"
FOR EACH ROW
EXECUTE PROCEDURE moddatetime(updated_at);
