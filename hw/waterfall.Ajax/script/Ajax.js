function getImg(i){
	var str = "json/img_name"+i+".js";
	$.getJSON(str, callback);
}

function callback(data){
	$.each(data.items, function(i,item){
 		var li = $('#ul1 li:first');
 		var c = li.clone(true);
 		c1.children().attr("href", item.url);
 		c1.children().children().attr("src", item.url);
 		var str = "#ul" + item.column;
 		var ul = $(str);
 		ul.append(c);
  });
}