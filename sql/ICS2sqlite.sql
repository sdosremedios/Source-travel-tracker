CREATE TABLE {0} (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    evStart DATETIME, 
    evEnd DATETIME, 
    tzStart VARCHAR (32) DEFAULT (''), 
    tzEnd VARCHAR (32) DEFAULT (''), 
    Summary VARCHAR (512) DEFAULT (''), 
    Location VARCHAR (256) DEFAULT (''), 
    Organizer VARCHAR (256) DEFAULT (''), 
    Attendee VARCHAR (1024) DEFAULT (''), 
    Description VARCHAR (2048) DEFAULT ('')
    );