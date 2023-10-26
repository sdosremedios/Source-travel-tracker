CREATE VIEW vwBooks AS
    SELECT DISTINCT b.id AS bookID,
                    a.id AS authorID,
                    s.id AS seriesID,
                    title AS Title,
                    author_sort AS Author,
                    "D:\SdosRemedios\Calibre Library (local)\" || [replace](b.path, "/", "\") || "\" AS folder,
                    b.title || " - " || a.name || ".epub" AS Filename,
                    s.name AS Series,
                    b.series_index AS Number,
                    text AS Comment
      FROM books AS b
           JOIN
           books_authors_link AS l ON l.book = b.id
           JOIN
           authors AS a ON a.id = l.author
           LEFT JOIN
           books_series_link AS l2 ON l2.book = b.id
           LEFT JOIN
           series AS s ON s.id = l2.series
           JOIN
           comments AS c ON c.book = b.id
     ORDER BY b.sort;
