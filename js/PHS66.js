/* http://phs1966.from-ca.com/000/8/9/9/28998/userfiles/file/js/PHS66.js

	Remove ads and enable accordion feature
	
	Requires phs66.css

*/
/*
if (location.protocol != 'https:') {
//	location.href = 'https:' + window.location.href.substring(window.location.protocol.length);
//	location.href = 'https://www.classcreator.com/Piedmont-California-1966/';
	location.href = 'https://www.classcreator.com/Piedmont-California-1966' + location.pathname + location.search + location.hash;
}
*/
$(document).ready(function () {
	$('.adsbygoogle').css('display', 'none');
	$('img[src="/Graphics/ccnarrowad.jpg"]').css('display', 'none');
	/* hide the location list */
	var $h1 = $('h1:contains("WHERE WE LIVE")');
	var $p = $h1.next().next();
	$p.hide();
	$h1.hover(function(){
		$p.show();
	});
	$p.hover(null,function(){
		$p.hide();
	});
	/* accordion */
	$('.accordion').removeClass('visible').addClass('hidden').next().hide();
	$('.accordion').click(function(){
		var $this = $(this);
		if ($this.next().is(':visible')) {
			$this.removeClass('visible').addClass('hidden');
			$this.next().hide();
		}
		else {
			$('.accordion').removeClass('visible').addClass('hidden').next().hide();
			$this.removeClass('hidden').addClass('visible');
			$this.next().show();
		}
	});
});