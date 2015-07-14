function getImg(i){
	var str = "https://raw.githubusercontent.com/zhoulw13/zhoulw13.github.io/master/hw/waterfall.Ajax/json/img_name"+i+".js";
	$.getJSON(str, callback);
}

function callback(data){
	$.each(data.images, function(i,item){
		var startCoords ={
 			latitude:item.latitude,
 			longitude:item.longitude
 		}
 		var d = computeDistance(startCoords, my_pos);
 		var li = $('#ul1 li:first');
 		var c = li.clone(true);
 		c.children().children().attr("src", item.url);
 		c.children().children().attr("id", "img"+item.id);
 		c.children('p').html("该图片距离您"+parseInt(d)+"km");
 		var str = "#ul" + item.column;
 		if(item.id <=3)
			$("#ul"+item.id+ " li:first").remove();
 		var ul = $(str);
 		ul.append(c);
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
 		var p = "<p>"+item.content+"</p><hr />";
 		c.append(p);
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
	getComments(1);
	var button1 = "<input type='button' id='pageup' value='上一页' onclick='pageup()' class='button'></input>";
	var button2 = "<input type='button' id='pagedown' value='下一页' onclick='pagedown()'class='button'></input>";
	$(comment).append(button1);
	$(comment).append(button2);
	

	window.onmousewheel = document.onmousewheel = function () {return false;}
	$('.popBg').click(function(){
		$('.popBg').remove();
		$('.popWrap').remove();
		$('.comments').remove();
		window.onmousewheel = mousemove;
		document.onmousewheel = dmousemove;
	});
}


function pagedown(){
	$('.comments p').remove();
	$('.comments hr').remove();
	cpage+=1;
	getComments(cpage);
	disableButton();
}

function pageup(){
	$('.comments p').remove();
	$('.comments hr').remove();
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

var my_pos ={
	latitude:0,
 	longitude:0
}

function getPos(){
	if(navigator.geolocation){
		navigator.geolocation.getCurrentPosition(function(pos){
			my_pos.latitude = pos.latitude;
			my_pos.longitude = pos.longitude;
		})
	}
}