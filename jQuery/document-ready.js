jQuery(document).ready(function(){
	/* accordion */
	$('.accordion').addClass('strong').next().hide();
	$('.accordion').click(function(){
		var $this = $(this);
		if ($this.next().is(':visible')) {
			$this.next().hide();
		}
		else {
			$this.next().show();
		}
	});
	jQuery(".readmore span").text('See more ...');
	jQuery("a.highslide").attr("onclick","return hs.expand(this)");
	jQuery('div.photoset').each(function(){
		var $setid = jQuery(this).attr('title');
		var $divid = jQuery(this).attr('id');
		displayPhotoSet($setid, $divid, 300);
	});
	
//	nav navbar-nav level0
	jQuery('ul.addTag a, ul.nav.navbar-nav.level0 a, .readmore a, .system-readmore a, h3 a, .pagination a, h2.article-title a').each(function(){
		var $this = $(this);
		var href = $this.attr('href') + '#t3-mainnav';
		$this.attr('href',href);
	});

/* <div class="videoBox" id="VIDEO_ID" title="Click on CC icon to view captions.">Video Slideshow</div> */	
    $('div.videoBox').each(function(){
		var $this = $(this).css('width','100%');
		var id = $this.attr('id');
		var h4 = $this.html(); $this.html('');
		var text = $this.attr('title');
		if (text != '') { text = '<br/>' + text; }
		var $frame = $('<iframe class="video" frameborder="0" '
			+ 'modestbranding="1" allow="autoplay; encrypted-media" allowfullscreen="allowfullscreen"></iframe>')
			.attr('src','https://www.youtube.com/embed/' + id + '?rel=0').css('width','100%').css('min-height','320px');
		var $p = $('<p></p>').html('For best results, play fullscreen at the highest resolution your network connection permits. ' + text);
		$this.append($('<h4></h4>').html(h4),$frame,$p);
    });

/*	<div class="photoDescription" data-file="IMAGE" data-class="photoLeft" ><p>DESCRIPTION</p></div> */
	jQuery('div.photoDescription').each(function(){
		var $this = $(this);
		var caption = $this.attr('title');
		var $caption = jQuery('<div class="highslide-caption">')
			.append(jQuery('<span class="caption">').text(caption));
		var srcImage = $this.attr('data-file');
		var pClass = $this.attr('data-class');
		
		var $p = $('<p/>').addClass(pClass ? pClass : 'photoLeft')
			.append($('<a class="highslide" title="Click to enlarge" onclick="return hs.expand(this)"></a>').attr('href',srcImage)
				.append($('<img alt="" style="width: 240px;"/>').attr('src',srcImage)),$caption,$('<br/>')).append(caption);
		$p.insertBefore($this.children('p').first());
	});

/*	<p class="photoDisplay" title="IMAGE_CAPTION" data-class="photoLeft" data-file="IMAGE_FILE"></p> */
    $('p.photoDisplay').each(function(){
		var $this = $(this);
		var caption = $this.attr('title');
		var srcImage = $this.attr('data-file');
		var pClass = $this.attr('data-class');
		var $caption = jQuery(jQuery('<div class="highslide-caption">')
			.append(jQuery('<span class="caption">').text(caption)));
		var $link = jQuery();

		
		$this.addClass(pClass ? pClass : 'photoLeft')
			.append($('<a class="highslide" title="Click to enlarge" onclick="return hs.expand(this)">').attr('href',srcImage)
				.append($('<img alt="" style="width: 240px;"/>').attr('src',srcImage)), $caption,'<br/>',caption);
   });

/*	<p><img class="showImage" src="IMAGE" data-class="photoLeft" title="CAPTION" data-width="WIDTH" style="width: 240px;" /></p> */
    $('img.showImage').each(function(){
		var $this = $(this);
		var width = $this.attr('data-width');
		$this.css('width',width ? width : '240px');
		
		var src = $this.attr('src');
		var pClass = $this.attr('data-class');
		var caption = $this.attr('title');
		var $caption = jQuery(jQuery('<div class="highslide-caption">'))
			.append(jQuery('<span class="caption">').text(caption));

		var $p = $this.parent().css('width',width ? width : '240px');
		var $link = $('<a/>').addClass('highslide').attr('href',src).attr('title',caption).attr('onclick','return hs.expand(this)').append($this);
		$p.addClass(pClass).append($link,$caption,'<br/>',caption);
    });

//  $("#cookieConsent").hide();
	var domain = 'DOMAIN_NAME';
    var cookie = getCookie(domain);
	if (cookie != 1) {
      $("#cookieConsent").fadeIn(200);
    }
    $("#closeCookieConsent").click(function() {
    	setCookie(domain,0,0);
        $("#cookieConsent").fadeOut(200);
    }); 
    $(".cookieConsentOK").click(function() {
    	setCookie(domain,1);
        $("#cookieConsent").hide();
    }); 
});
