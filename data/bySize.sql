select file.size, path.name || '\' || file.name from file 
join path on `file`.pathid = `path`.id
order by file.size