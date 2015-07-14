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
		if(i==5)
			return;
		getImg(i);
		i++;
	}
});


function imageclicked(evt){
	console.log(evt);
	$('body').attr('class', 'popBg');
}