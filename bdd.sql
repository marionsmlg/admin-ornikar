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