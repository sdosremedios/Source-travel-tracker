--
-- File generated with SQLiteStudio v3.0.6 on Tue Jan 17 15:12:22 2017
--
-- Text encoding used: windows-1252
--
PRAGMA foreign_keys = off;
BEGIN TRANSACTION;

-- Table: folder
CREATE TABLE folder (id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE NOT NULL, name VARCHAR (256) UNIQUE NOT NULL, modified DATETIME, count INTEGER DEFAULT (0));

COMMIT TRANSACTION;
PRAGMA foreign_keys = on;
