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
    hashedPassword VARCHAR(128),
    PRIMARY KEY(user_id)
);

CREATE TABLE topics (
	topic_id INT NOT NULL UNIQUE AUTO_INCREMENT,
    topic_title VARCHAR(20),
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

DROP VIEW IF EXISTS view_articles;

CREATE VIEW view_articles AS
	SELECT a.article_id, a.article_date, a.article_title, u.username, t.topic_title, a.article_content
    FROM articles a
    JOIN topics t ON t.topic_id = a.topic_id
    JOIN users u ON u.user_id = a.user_id
    ORDER BY article_date;
    
DROP PROCEDURE IF EXISTS sp_insert_article;

DELIMITER //
CREATE PROCEDURE sp_insert_article(IN a_article_title VARCHAR(30), IN a_article_content MEDIUMTEXT, IN a_topic_title VARCHAR(20), IN a_username VARCHAR(20))
BEGIN
	DECLARE v_user_id INT;
    DECLARE v_topic_id INT;
    
    SELECT user_id
    FROM users
    WHERE username = a_username
    INTO v_user_id;
    
    IF ISNULL(v_user_id) THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No matching username found';
	END IF;
    
    SELECT topic_id
    FROM topics
    WHERE topic_title = a_topic_title
    INTO v_topic_id;
    
    IF ISNULL(v_topic_id) THEN
		INSERT INTO topics (topic_title) VALUES (a_topic_title);
	END IF;
    
    INSERT INTO articles (article_date, article_title, article_content, user_id, topic_id)
    VALUES (now(), a_article_title, a_article_content, v_user_id, (SELECT topic_id FROM topics WHERE topic_title = a_topic_title));
    
    END //
    DELIMITER ;