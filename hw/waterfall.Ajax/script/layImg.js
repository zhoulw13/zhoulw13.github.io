var ul1 = $('#ul1');
var ul2 = $('#ul2');
var ul3 = $('#ul3');
var li = $('#ul1 li:first');
for(var i = 1; i<=29; i++){
	var c1 = li.clone(true);
	var c2 = li.clone(true);
	var c3 = li.clone(true);
	c1.children().attr("href", "image/showLove ("+(3*i+1)+").jpg");
	c2.children().attr("href", "image/showLove ("+(3*i+2)+").jpg");
	c3.children().attr("href", "image/showLove ("+(3*i+3)+").jpg");
	c1.children().children().attr("src", "image/showLove ("+(3*i+1)+").jpg");
	c2.children().children().attr("src", "image/showLove ("+(3*i+2)+").jpg");
	c3.children().children().attr("src", "image/showLove ("+(3*i+3)+").jpg");
	ul1.append(c1);
	ul2.append(c2);
	ul3.append(c3);
}

var li = $('#ul1 li:last');
$('#ul2').append(li);
var li = $('#ul1 li:last');
$('#ul2').append(li);
var li = $('#ul1 li:last');
$('#ul2').append(li);

$(window).scroll(function() {
                 
    if($(document).height() - $(window).height() - $(document).scrollTop() < 10) {
         
        alert('end');
         
    }
     
});