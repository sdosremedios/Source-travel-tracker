--
-- File generated with SQLiteStudio v3.0.6 on Mon Dec 7 16:17:10 2015
--
-- Text encoding used: windows-1252
--
PRAGMA foreign_keys = off;
BEGIN TRANSACTION;

-- Table: file
CREATE TABLE file (
    id     INTEGER    PRIMARY KEY,
    pathid INTEGER    REFERENCES path (id) ON DELETE CASCADE,
    name   TEXT (256) DEFAULT (''),
    ext    TEXT (32)  DEFAULT (''),
    size   INTEGER    DEFAULT (0) 
);


-- Table: path
CREATE TABLE path (
    id    INTEGER    PRIMARY KEY,
    name  TEXT (256) DEFAULT ('') 
                     UNIQUE,
    fresh BOOLEAN    DEFAULT true
);


-- View: pano_jpg
CREATE VIEW pano_jpg AS
    SELECT *
      FROM full_name
     WHERE path LIKE '%pano%' AND 
           ext = '.jpg'
     ORDER BY file,
              path;


-- View: full_name
CREATE VIEW full_name AS
    SELECT file.id AS file_id,
           path.name AS path,
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
