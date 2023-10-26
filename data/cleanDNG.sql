--
-- File generated with SQLiteStudio v3.0.6 on Tue Dec 1 11:07:58 2015
--
-- Text encoding used: windows-1252
--
PRAGMA foreign_keys = off;
BEGIN TRANSACTION;

-- Table: path
DROP TABLE IF EXISTS path;

CREATE TABLE path (
    id   INTEGER    PRIMARY KEY,
    name TEXT (256) DEFAULT ('') 
                    UNIQUE
);


-- Table: file
DROP TABLE IF EXISTS file;

CREATE TABLE file (
    id     INTEGER    PRIMARY KEY,
    pathid INTEGER    REFERENCES path (id) ON DELETE CASCADE,
    name   TEXT (256) DEFAULT (''),
    ext    TEXT (32)  DEFAULT (''),
    size   INTEGER    DEFAULT (0) 
);


-- View: full_name
DROP VIEW IF EXISTS full_name;
CREATE VIEW full_name AS
    SELECT path.name AS path,
           file.name AS file,
           file.ext,
           size
      FROM file
           LEFT JOIN
           path ON file.pathid = path.id
     ORDER BY file.name,
              file.ext;


COMMIT TRANSACTION;
PRAGMA foreign_keys = on;
