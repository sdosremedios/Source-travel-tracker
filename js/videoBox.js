/* <div class="videoBox" id="VIDEO_ID" title="Click on CC icon to view captions.">Video Slideshow</div> */

function videoBox($this) {
    var id = $this.attr('id');
    var h4 = $this.html(); $this.html('');
    var text = $this.attr('title');
	if (text != '') { text = '<br/>' + text; }
    var $frame = $('<iframe class="video" frameborder="0" '
		+ 'modestbranding="1" allow="autoplay; encrypted-media" allowfullscreen="allowfullscreen"></iframe>')
        .attr('src','https://www.youtube.com/embed/' + id + '?rel=0');
    var $p = $('<p></p>').html('For best results, play fullscreen at the highest resolution your network connection permits. ' + text);
    $this.append($('<h4></h4>').html(h4),$frame,$p);
}
