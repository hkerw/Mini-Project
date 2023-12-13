USE theWikiDatabase;

INSERT INTO users (username, isEditor, isAdmin, hashedPassword)
VALUES ('Test1', TRUE, FALSE, '$2b$10$7BHq5IbMgHxPaMswBeSUj.pQnqLNQ9ImeqdDRW9ibdQ1h67RYd6Wy'),
	   ('Test2', TRUE, FALSE, '$2b$10$7BHq5IbMgHxPaMswBeSUj.pQnqLNQ9ImeqdDRW9ibdQ1h67RYd6Wy');
       
INSERT INTO topics(topic_title)
VALUES ('Fruit'),
	   ('Underwater');
       
INSERT INTO articles (article_date, article_title, article_content, user_id, topic_id)
VALUES (now(), 'Apples', 'Apples are a member of the rose family, along with other fruits such as pears, quinces, peaches, plums, strawberries, and raspberries.', 1, 1),
	   (now(), 'Fish', 'The worlds smallest fish is the stout floater (Schindleria brevipinguis), which is about the size of a large mosquito. Adult stout floaters typically measure around 7-8 millimeters in length.', 2, 2);
       
INSERT INTO comments (comment_date, comment_content, user_id, article_id)
VALUES (now(), 'I didnt know that, tbh', 2, 1),
	   (now(), 'Wow, thats pretty interesting', 1, 2);
       
INSERT INTO editorial (user_id, article_id)
VALUES (1, 1),
	   (2, 2);