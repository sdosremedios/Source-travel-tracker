insert into show select null,i.title as name, i.rating,'','TV','','','imported' from IMDB as i

/*    showID      INTEGER        PRIMARY KEY AUTOINCREMENT
                               UNIQUE,
    name        VARCHAR (32),
    rating      NUMBER (4, 1)  DEFAULT (3),
    status      VARCHAR (64)   DEFAULT Waiting,
    programType VARCHAR (32)   DEFAULT Series,
    url         VARCHAR (256),
    IMDb        VARCHAR,
    note        VARCHAR (1024) 
*/