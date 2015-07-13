function getImg(i){
	var str = "json/img_name"+i+".js";
	$.getJSON(str, callback);
}

function callback(data){
	$.each(data.images, function(i,item){
 		var li = $('#ul1 li:first');
 		var c = li.clone(true);
 		c.children().attr("href", item.url);
 		c.children().children().attr("src", item.url);
 		var str = "#ul" + item.column;
 		var ul = $(str);
 		ul.append(c);
  });
}