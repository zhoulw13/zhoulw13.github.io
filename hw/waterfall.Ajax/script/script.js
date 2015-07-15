function getImg(i){
	$('body').prepend("<div class='popBg'></div>");
	$('body').append("<img class='img-process' src='images/loading.gif'>");
	var img = $('.img-process');
	$(img).css("top", parseInt(($(window).height() - img.height())/2) + "px");
	$(img).css("left", parseInt(($(window).width() - img.width())/2) + "px");
	var str = "https://raw.githubusercontent.com/zhoulw13/zhoulw13.github.io/master/hw/waterfall.Ajax/json/img_name"+i+".js";
	$.getJSON(str, callback);
}

function callback(data){
	$.each(data.images, function(i,item){
		var startCoords ={
 			latitude:item.latitude,
 			longitude:item.longitude
 		}
 		//console.log(my_pos.latitude + ', ' + my_pos.longitude);
 		var d = computeDistance(startCoords, my_pos);
 		var li = $('#ul1 div:first');
 		var c = li.clone(true);
 		c.children().children().attr("src", item.url);
 		c.children().children().attr("id", "img"+item.id);
 		c.children('p').html("该图片距离您"+parseInt(d)+"km");
 		var str = "#ul" + item.column;
 		if(item.id <=3)
			$("#ul"+item.id+ " div:first").remove();
 		var ul = $(str);
 		ul.append(c);
  });
	$('.image-wall').ready(function(){
		window.setTimeout("$('.popBg').remove();$('.img-process').remove();", 0.15);
 	});
 	$('.image-wall').error(function(){
		$('.img-process').remove();
		$('body').append("<img class='img-process' src='images/error.jpg'>");
		var img = $('.img-process');
		$(img).css("top", parseInt(($(window).height() - img.height())/2) + "px");
		$(img).css("left", parseInt(($(window).width() - img.width())/2) + "px");
		window.setTimeout("$('.img-process').remove();", 0.5);
 	});
}

function computeDistance(startCoords, destCoords) {
    var startLatRads = degreesToRadians(startCoords.latitude);
    var startLongRads = degreesToRadians(startCoords.longitude);
    var destLatRads = degreesToRadians(destCoords.latitude);
    var destLongRads = degreesToRadians(destCoords.longitude);
	
    var Radius = 6371;
    var distance=Math.acos(Math.sin(startLatRads)*Math.sin(destLatRads) +
                 Math.cos(startLatRads) * Math.cos(destLatRads) *
                 Math.cos(startLongRads - destLongRads)) * Radius;
				 
    return distance;
}

function degreesToRadians(degrees) {
    var radians = (degrees * Math.PI)/180;
    return radians;
}

function getComments(i){
	var str = "https://raw.githubusercontent.com/zhoulw13/zhoulw13.github.io/master/hw/waterfall.Ajax/json/comments"+i+".js";
	$.getJSON(str, commentCB);
}

function commentCB(data){
	$.each(data.comments, function(i,item){
 		var c = $('.comments');
 		var author = "<div class='author'>" + item.author + ": </div>";
 		var content = "<div class='content'>" + item.content + "</div>";
 		var date = "<div class='date'>" + item.date + "</div>";
 		var device = "<div class='device'>" + "来自 " + item.device + "</div>";
 		var str = "<div class='comment' id='comment" + item.id + "'>" + author + device + date + content + "</div>";
 		c.append(str);
  });
}

var ii = 2;
var ci = 2;
var cpage = 1;

$(window).scroll(function(){
	 if($(document).height() - $(window).height() - $(document).scrollTop() < 10) {
		if(ii===5)
			return;
		getImg(ii);
		ii++;
	}
});

var mousemove = window.onmousewheel;
var dmousemove = document.onmousewheel;


function imageclicked(evt){
	var e = window.event;
    var obj = e.target || e.srcElement;
	$('body').prepend("<div class='popBg'></div>");
	$('body').append("<div class='div-img'><img class='popWrap' src='"+ obj.src +"'></div>");
	$('body').append("<div class='comments'></div>");
	$('body').append("<input type='button' onclick='closeImg()' class='close-button' style='background-image: url(images/close.png);'></input>");
	$('.img-wall').attr('style', '-webkit-filter: blur(5px);');
	var img = $('.popWrap');
	if(img.height() > $(window).height()*0.8)
		$(img).css("height",$(window).height()*0.8+"px");
	$(img).css("top", parseInt(($(window).height() - img.height())/2) + "px");
	$(img).css("left", parseInt(($(window).width() - img.width())/3) + "px");
	var closeButton = $('.close-button');
	$(closeButton).css("top", parseInt(($(window).height() - img.height())/2)-15 + "px");
	$(closeButton).css("left", parseInt($(window).width()/3 + img.width()*2/3)-10 + "px");

	var comment = $('.comments');
	$(comment).css("width", parseInt(($(window).width() - img.width())/3)+"px");
	$(comment).css("left", parseInt($(window).width()/3 + img.width()*2/3) + "px");
	getComments(1);
	var button1 = "<input type='button' id='pageup' value='上一页' onclick='pageup()' class='button'></input>";
	var button2 = "<input type='button' id='pagedown' value='下一页' onclick='pagedown()'class='button'></input>";
	$(comment).append(button1);
	$(comment).append(button2);
	

	window.onmousewheel = document.onmousewheel = function () {return false;}
	$('.popBg').click(closeImg);
}

function closeImg(){
	$('.popBg').remove();
	$('.div-img').remove();
	$('.popWrap').remove();
	$('.comments').remove();
	$('.close-button').remove();
	$('.img-wall').attr('style', '-webkit-filter: blur(0px);');
	window.onmousewheel = mousemove;
	document.onmousewheel = dmousemove;
}

function pagedown(){
	$('.comments .comment').remove();
	cpage+=1;
	getComments(cpage);
	disableButton();
}

function pageup(){
	$('.comments .comment').remove();
	cpage-=1;
	getComments(cpage);
	disableButton();
}

function disableButton(){
	if(cpage===2)
		$('#pagedown').attr('disabled', true);
	else
		$('#pagedown').attr('disabled', false);
	if(cpage===1)
		$('#pageup').attr('disabled', true);
	else
		$('#pageup').attr('disabled', false);
}

var my_pos = {
	latitude:0,
	longitude:0
}

function getPos(){
	if(navigator.geolocation){
		navigator.geolocation.getCurrentPosition(function(pos){
			my_pos.latitude = pos.coords.latitude;
			my_pos.longitude = pos.coords.longitude;
		});
	}
}