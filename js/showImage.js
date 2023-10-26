/*	<p>
        <img class="showImage" src="IMAGE" data-class="CLASS" title="CAPTION" data-width="WIDTH" style="width: 240px;" />
    </p>

    src         = image URL
    data-class  = CSS class of parent (<p>)
    title       = image caption
    data-width  = image display width
    style       = image editor width

    <p class="CLASS" style="width: 240px;">
        <a class="highslide" href="IMAGE" title="TITLE" onclick="return hs.expand(this)">
            <img class="showImage" src="IMAGE" data-class="CLASS" title="TITLE" data-width="WIDTH" style="width: WIDTH;">
        </a>
        <br>
        TITLE
    </p>

*/

function showImage($this){
    var src = $this.attr('src');
    var pClass = $this.attr('data-class');
    var caption = $this.attr('title');
    var width = $this.attr('data-width');
    $this.css('width',width ? width : '240px');
    var $p = $this.parent().css('width',width ? width : '240px');
    var $link = $('<a/>').addClass('highslide').attr('href',src)
        .attr('title',caption).attr('onclick','return hs.expand(this)')
            .append($this);
    $p.addClass(pClass).append($link,'<br/>',caption);
};
    