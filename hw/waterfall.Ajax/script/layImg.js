function loadImg(s, e){
	var ul1 = $('#ul1');
	var ul2 = $('#ul2');
	var ul3 = $('#ul3');
	var li = $('#ul1 li:first');
		for(var i = s; i<=e; i++){
		var c1 = li.clone(true);
		var c2 = li.clone(true);
		var c3 = li.clone(true);
		c1.children().children().attr("src", "images/showLove ("+(3*i+1)+").jpg");
		c2.children().children().attr("src", "images/showLove ("+(3*i+2)+").jpg");
		c3.children().children().attr("src", "images/showLove ("+(3*i+3)+").jpg");
		ul1.append(c1);
		ul2.append(c2);
		ul3.append(c3);
	}
}