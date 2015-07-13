var xhr = createXHR();

function createXHR(){
	if (typeof XMLHttpRequest != "undefined"){
		return new XMLHttpRequest();
	} else {
		throw new Error("No XHR object available.");
	}
}

xhr.onreadystatechange = function(event){
	if (xhr.readyState == 4){
		if ((xhr.status >= 200 && xhr.status < 300) || xhr.status
		== 304){
			alert(xhr.responseText);
		} else {
			alert("Request was unsuccessful: " + xhr.status);
		}
	}
};

xhr.open("GET", "ajaxHandler.php", true);
xhr.send(null);