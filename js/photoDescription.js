/* <div class="photoDescription" title="IMAGE_CAPTION" data-class="photoLeft" data-file="IMAGE_FILE"><p>PHOTO_DESCRIPTION</p></div> */

function photoDescription($this) {
	$caption = $this.attr('title');
	srcImage = $this.attr('data-file');
	pClass = $this.attr('data-class');
	
	$p = $('<p/>').addClass(pClass ? pClass : 'photoLeft')
		.append($('<a class="highslide" title="Click to enlarge" onclick="return hs.expand(this)"></a>').attr('href',srcImage)
			.append($('<img alt="" style="width: 240px;"/>').attr('src',srcImage)),$('<br/>')).append($caption);
	$p.insertBefore($this.children('p').first());
}
