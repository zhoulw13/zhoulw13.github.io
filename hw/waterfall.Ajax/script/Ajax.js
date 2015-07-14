function getImg(i){
	var str = "https://raw.githubusercontent.com/zhoulw13/zhoulw13.github.io/master/hw/waterfall.Ajax/json/img_name"+i+".js";
	$.getJSON(str, callback);
}

function callback(data){
	$.each(data.images, function(i,item){
		if(item.id <=3)
			return;
 		var li = $('#ul1 li:first');
 		var c = li.clone(true);
 		//c.children().attr("href", item.url);
 		c.children().children().attr("src", item.url);
 		c.children().children().attr("id", "img"+item.id);
 		var str = "#ul" + item.column;
 		var ul = $(str);
 		ul.append(c);
  });
}

var i = 2;

$(window).scroll(function(){
	 if($(document).height() - $(window).height() - $(document).scrollTop() < 10) {
		if(i===5)
			return;
		getImg(i);
		i++;
	}
});

var mousemove = window.onmousewheel;
var dmousemove = document.onmousewheel;

function imageclicked(evt){
	var e = window.event;
    var obj = e.target || e.srcElement;
	$('body').prepend("<div class='popBg'></div>");
	$('body').append("<img class='popWrap' src='"+ obj.src +"'>");
	$('body').append("<div class='comments'></div>");
	var img = $('.popWrap');
	if(img.height() > $(window).height()*0.8)
		$(img).css("height",$(window).height()*0.8+"px");
	$(img).css("top", parseInt(($(window).height() - img.height())/2) + "px");
	$(img).css("left", parseInt(($(window).width() - img.width())/3) + "px");

	var comment = $('.comments');
	$(comment).css("width", parseInt(($(window).width() - img.width())/3)+"px");
	$(comment).css("left", parseInt($(window).width()/3 + img.width()*2/3) + "px");

	window.onmousewheel = document.onmousewheel = function () {return false;}
	$('.popBg').click(function(){
		$('.popBg').remove();
		$('.popWrap').remove();
		$('.comments').remove();
		window.onmousewheel = mousemove;
		document.onmousewheel = dmousemove;
	});
}

function getComments(i){
	
}