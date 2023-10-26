CREATE TABLE path (
    id   INTEGER    PRIMARY KEY,
    name TEXT (256) DEFAULT ('') 
                    UNIQUE
);
CREATE TABLE file (
    id     INTEGER    PRIMARY KEY,
    pathid INTEGER    REFERENCES path (id) ON DELETE CASCADE,
    name   TEXT (256) DEFAULT (''),
    size   INTEGER    DEFAULT (0) 
);
CREATE TABLE exif (
    id     INTEGER       PRIMARY KEY,
    fileid INTEGER       REFERENCES file (id) ON DELETE CASCADE,
    name   VARCHAR (64)  DEFAULT (''),
    value  VARCHAR (128) DEFAULT ('') 
);
