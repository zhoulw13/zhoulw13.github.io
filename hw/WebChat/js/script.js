 
$(function () { $('#myModal').modal({
	keyboard: false,
	backdrop: 'static'
})});

// CREATE A REFERENCE TO FIREBASE
var rootRef = new Firebase('https://boiling-torch-3823.firebaseio.com/');
var roomsRef = rootRef.child('Room');
var roomRef = roomsRef.child('main');
var messagesRef = roomRef.child('Messages');
var userRef = rootRef.child('Users');
var usersOnline = new Array();
var roomOnline = new Array();

var messageField = $('#messageInput');
var username = "";
var room = "main";
var userID = 0;
var messageList = $('#messages');

//nick name input & button
$('#bt-nick').click(nickClicked);
$('#input-nick').keypress(function (e) {
	if (e.keyCode == 13) {
    //FIELD VALUES
  	nickClicked();
   }
});

function nickClicked(){
	$('#nick-error').remove();

	var nickname = $('#input-nick').val();
	if(nickname === ""){
		$('.modal-footer').append('<div id="nick-error" class="alert alert-warning" style="margin-top:10px;">Empty Name Invalid !</div>');
	}else if(nickname.indexOf(" ") >= 0){
		$('.modal-footer').append('<div id="nick-error" class="alert alert-warning" style="margin-top:10px;">Blank Space Not Allowed !</div>');
	}
	else if(nickname.length > 20){
		$('.modal-footer').append('<div id="nick-error" class="alert alert-warning" style="margin-top:10px;">Nickname Too Long !</div>');
	}else if($.inArray(nickname, usersOnline) != -1){
		$('.modal-footer').append('<div id="nick-error" class="alert alert-danger" style="margin-top:10px;">Nickname Already Exist !</div>');
	}else{ // valid username
		username = nickname;
		var temp = userRef.push(nickname);
		userID = temp.name();
		$('#myModal').modal('hide');
	}
	return;
}


//listen for send commmand
$('#sendButton').click(sendClicked);
// LISTEN FOR KEYPRESS EVENT
messageField.keypress(function (e) {
	if (e.keyCode == 13) {
		//FIELD VALUES
    	sendClicked();
    }
});

function sendClicked(){
	var message = messageField.val();
	if(message === ''){
		return;
	}
    //SAVE DATA TO FIREBASE AND EMPTY FIELD
    messagesRef.push({name:username, text:message});
    messageField.val('');
}


		//listener on users get in
userRef.on('child_added', function(snapshot){
	usersOnline.push(snapshot.val());
	var li = $("<li class='list-group-item'>");
	li.attr('id', snapshot.val());
	li.text(snapshot.val());
	//mark local user
	if(snapshot.val() === username){ 
		li.append("<span class='badge'>You</span>");
	}
	$('#online-users').append(li);
});

//listener on users' quit
userRef.on('child_removed', function(snapshot){
	var str = "li#"+snapshot.val();
	$(str).remove();
});



var imgList = ["laugh", "smile", "cry", "lcry", "blue", "angry", "handsup", "terrified", "daze"];
messagesRef.limitToLast(12).on('child_added', messageAdd);
function messageAdd(snapshot) {
    //GET DATA
    var data = snapshot.val();
    var message = data.text;

    //deal with emoji
    var re = re = new RegExp('\\[' + imgList.join('\\]|\\[') + '\\]')
    var match = re.exec(message);
    while(match != null){
    	var index = match.index;
    	var left = message.substring(0, match.index);
    	var right = message.substring(match.index+match[0].length, message.length);
    	var center = "<img src='images/" + match[0].substring(1, match[0].length-1) + ".png' style='height:40px; width:40px;'>";
    	message = left + center + right;
    	match = re.exec(message);
    }

    //CREATE ELEMENTS MESSAGE & SANITIZE TEXT
    var messageElement = $("<li class='list-group-item'>");
    if(data.name != username){
    	var nameElement = $("<strong class='example-chat-username'></strong>")
    	nameElement.text(data.name + " : ");
    	messageElement.html(message).prepend(nameElement);
    }else{
    	messageElement.css('text-align', 'right');
    	messageElement.html(message);
    }
    //ADD MESSAGE
    messageList.append(messageElement);


    //SCROLL TO BOTTOM OF MESSAGE LIST
    $('#div-message')[0].scrollTop = $('#div-message')[0].scrollHeight;
}


//release username when quit
window.onbeforeunload = function(){
	var str = "https://boiling-torch-3823.firebaseio.com/Users/" + userID;
	var freRef = new Firebase(str);
	freRef.remove();
}

//emoji into input field
$('.emoji').parent().click(function (e){
	var str = $('#messageInput').val();
	str += '[' + this.id + ']';
	$('#messageInput').val(str);
});



//multi room model
roomsRef.on('child_added', function(snapshot){
	var li = $("<li class='list-group-item'>");
	var a = $("<a onclick='requestChange(this)'>")
	a.attr('id', snapshot.key());
	a.text(snapshot.key());
	li.append(a);
	roomOnline.push(snapshot.key());
	if(snapshot.key() === room){ 
		li.append("<span class='badge'>Your Room</span>");
	}
	$('#online-rooms').append(li);
});

$('#bt-room').click(roomClicked);
$('#input-room').keypress(function (e) {
	if (e.keyCode == 13) {
	roomClicked();
   }
});

function roomClicked(){
	$('#room-error').remove();
	var roomname = $('#input-room').val();
	if(roomname === ""){
		$('#create-room').prepend('<div id="room-error" class="alert alert-warning" style="margin-top:10px;">Empty Name Invalid !</div>');
	}else if(roomname.indexOf(" ") >= 0){
		$('#create-room').prepend('<div id="room-error" class="alert alert-warning" style="margin-top:10px;">Blank Space Not Allowed !</div>');
	}
	else if(roomname.length > 20){
		$('#create-room').prepend('<div id="room-error" class="alert alert-warning" style="margin-top:10px;">Roomname Too Long !</div>');
	}else if($.inArray(roomname, roomOnline) != -1){
		$('#create-room').prepend('<div id="room-error" class="alert alert-danger" style="margin-top:10px;">Room Already Exist !</div>');
	}else{
		room = roomname;
		roomChanged();
		$('#input-room').val('');
	}
	return;
}


function roomChanged(){
	roomRef = roomsRef.child(room);
	messagesRef.off('child_added', messageAdd);
	messagesRef = roomRef.child('Messages');
	// Add a callback that is triggered for each chat message.
	messagesRef.limitToLast(12).on('child_added', messageAdd);
	$('#messages').empty();
	$('#online-rooms li span').remove();
	var str = "a#" + room;
	$(str).parent().append("<span class='badge'>Your Room</span>");
}


function requestChange(e){
	if(e.text === room){
		return;
	}else{
		room = e.text;
		roomChanged();
	}
};


roomsRef.on('child_removed', function(snapshot){
	var str = "a#" + snapshot.val();
	$(str).parent().remove();
});