--
-- File generated with SQLiteStudio v3.0.6 on Wed Aug 24 11:22:38 2016
--
-- Text encoding used: windows-1252
--
PRAGMA foreign_keys = off;
BEGIN TRANSACTION;

-- Table: path
CREATE TABLE path (
    id   INTEGER    PRIMARY KEY,
    name TEXT (256) DEFAULT ('') 
                    UNIQUE
);


-- Table: file
CREATE TABLE file (
    id     INTEGER     PRIMARY KEY,
    pathid INTEGER     REFERENCES path (id) ON DELETE CASCADE,
    name   TEXT (256)  DEFAULT (''),
    size   INTEGER     DEFAULT (0),
    md5    STRING (32) DEFAULT ('0') 
);


-- View: files
CREATE VIEW files AS
    SELECT DISTINCT file.id,
                    path.name || file.name AS filepath,
                    file.size,
                    file.md5
      FROM file
           JOIN
           path ON file.pathid = path.id
     ORDER BY file.name,
              file.size DESC,
              path.name;


-- View: actual_duplicates
CREATE VIEW actual_duplicates AS
    SELECT DISTINCT file.id,
                    path.name || file.name AS filepath,
                    file.size,
                    b.md5
      FROM file
           JOIN
           file AS b ON file.md5 > '0' AND 
                        file.md5 = b.md5 AND 
                        file.size = b.size AND 
                        file.id <> b.id
           JOIN
           path ON file.pathid = path.id
     ORDER BY file.size DESC,
              file.name DESC;


-- View: possible_duplicates
CREATE VIEW possible_duplicates AS
    SELECT DISTINCT file.id,
                    p1.name || file.name AS filepath,
                    file.size,
                    file.md5
      FROM file,
           file AS b
           JOIN
           path AS p1 ON file.pathid = p1.id
     WHERE file.size > 8192 AND 
           file.size = b.size AND 
           file.id <> b.id AND 
           file.md5 = '0'
     ORDER BY file.size,
              file.name,
              b.name;


-- View: size_duplicates
CREATE VIEW size_duplicates AS
    SELECT DISTINCT file.id,
                    path.name || file.name AS filepath,
                    file.size,
                    b.md5
      FROM file
           JOIN
           file AS b ON file.size = b.size AND 
                        file.id <> b.id
           JOIN
           path ON file.pathid = path.id
     ORDER BY file.size DESC,
              file.name DESC;


COMMIT TRANSACTION;
PRAGMA foreign_keys = on;
