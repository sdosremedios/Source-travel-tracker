select distinct file.id, p1.name || '\' || file.name as filepath, file.size, file.md5
from file, file as b 
join path as p1 on file.pathid = p1.id 
where file.md5 = b.md5 and file.name <> b.name
order by file.size desc, file.name, b.name