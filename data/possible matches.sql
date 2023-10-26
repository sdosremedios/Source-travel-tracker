select distinct p1.name || '\' || file.name as filepath, file.size
from file, file as b 
join path as p1 on file.pathid = p1.id 
where file.size = b.size and file.name <> b.name
order by file.size desc, file.name, b.name