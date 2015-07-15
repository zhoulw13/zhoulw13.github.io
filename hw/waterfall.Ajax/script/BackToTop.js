var body = document.getElementsByTagName('body');
var button = document.createElement('input');

function keypress(e){
	var keycode = e.keyCode;
	var realkey = String.fromCharCode(event.keyCode);
	if(realkey == 'U')
		clicked();
	//alert("press" + keycode + "code:" + realkey);
}
document.onkeydown = keypress;

window.onscroll = function (){
	var y = window.scrollY;
	if(y<150){
		var t = button.getAttribute('style');
		var str = t.substring(0, 22) + "display:none;";
		button.setAttribute("style",str);
	}
	else{
		var t = button.getAttribute('style');
		var str = t.substring(0, 22) + "display:;";
		button.setAttribute("style",str);
	}
}

function clicked(){
	var y = window.scrollY;
	var speed = 1.1;
	window.scrollTo(0, Math.floor(y / speed));
	if(y > 0) {
		var invokeFunction = "clicked()";
		window.setTimeout(invokeFunction, 20);
	}
	else
		return;
}

BackToTop = {
	init: function(arg){
		button.type= 'button';
		$(button).css("width", "5%");
		button.setAttribute('class', 'button');
		button.value = 'Top';
		body[0].appendChild(button);
		button.onclick = clicked;
		
		if(typeof arg.x != "undefined" && typeof arg.y != "undefined"){
			var str = "left:" + arg.x +"px; top:" + arg.y + "px;display:;";
			button.setAttribute("style",str);
		}
		else if(arg.LeftUp == true)
			button.id = 'LeftUp';
		else if(arg.LeftDown == true)
			button.id = 'LeftDown';
		else if(arg.RightUp == true)
			button.id = 'RightUp';
		else if(arg.RightDown == true)
			button.id = 'RightDown';
	}
}