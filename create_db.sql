DROP DATABASE IF EXISTS theWikiDatabase;

CREATE DATABASE theWikiDatabase;

USE theWikiDatabase;

DROP USER IF EXISTS 'wikiapp'@'localhost';
CREATE USER 'wikiapp'@'localhost' IDENTIFIED WITH mysql_native_password BY 'wikipass';
GRANT ALL PRIVILEGES ON theWikiDatabase.* TO 'wikiapp'@'localhost';

DROP TABLE IF EXISTS articles;
DROP TABLE IF EXISTS editorial;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS topics;
DROP TABLE IF EXISTS comments;

CREATE TABLE users (
	user_id INT NOT NULL UNIQUE AUTO_INCREMENT,
    username VARCHAR(20) NOT NULL UNIQUE,
    isEditor BOOLEAN DEFAULT FALSE,
    isAdmin BOOLEAN DEFAULT FALSE,
    PRIMARY KEY(user_id)
);

CREATE TABLE topics (
	topic_id INT NOT NULL UNIQUE AUTO_INCREMENT,
    topic_title VARCHAR(20),
    topic_description VARCHAR(100),
    PRIMARY KEY(topic_id)
);

CREATE TABLE articles (
	article_id INT NOT NULL UNIQUE AUTO_INCREMENT,
    article_date DATETIME,
    article_title VARCHAR(30),
    article_content MEDIUMTEXT,
    user_id INT,
    topic_id INT,
    PRIMARY KEY(article_id),
    FOREIGN KEY(user_id) REFERENCES users(user_id),
    FOREIGN KEY(topic_id) REFERENCES topics(topic_id)
);

CREATE TABLE editorial (
	user_id INT,
    article_id INT,
    FOREIGN KEY(user_id) REFERENCES users(user_id),
    FOREIGN KEY(article_id) REFERENCES articles(article_id)
);

CREATE TABLE comments(
	comment_id INT NOT NULL UNIQUE AUTO_INCREMENT,
    comment_date DATETIME,
    comment_content MEDIUMTEXT,
    user_id INT,
    article_id INT,
    PRIMARY KEY(comment_id),
    FOREIGN KEY(user_id) REFERENCES users(user_id),
    FOREIGN KEY(article_id) REFERENCES articles(article_id)
);