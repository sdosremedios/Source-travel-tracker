$(document).ready(function(){   
    /* https://www.imdb.com/chart/toptv/?ref_=nv_tvv_250 */
	$('table.chart tbody.lister-list tr').each(function(index){
		var $this	=	$(this);	
		var $title	=	$this.find('td.titleColumn a')
		var year	=	$this.find('td.titleColumn span').text().trim() + '`';
		var title	=	$title.text() + '`';
		var cast	=	$title.attr('title') + '`';
		var	url		=	'https://www.imdb.com' + $title.attr('href').split('?',1)[0];
		var	rating	=	$this.find('td.imdbRating').text().trim() + '`';
		$('div#extract').append(title + year + rating + cast + url + '<br/>');
	});
});
