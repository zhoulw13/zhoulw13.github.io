 /*
 	Init for nickname input modal
 */
$(function () { $('#myModal').modal({
	keyboard: false,
	backdrop: 'static'
})});

/*
 CREATE A REFERENCE TO FIREBASE
 create child : Room & Users
*/
var rootRef = new Firebase('https://boiling-torch-3823.firebaseio.com/');
var userRef = rootRef.child('Users');
var roomsRef = rootRef.child('Room');

var currentRoom = roomsRef.child('main');
var messagesRef = currentRoom.child('Messages');

// needed infomation
var username = "";
var room = "main";
var userID = 0;
var usersOnline = new Array();
var roomOnline = new Array();

var messageField = $('#messageInput');
var messageList = $('#messages');

//nick name input
$('#bt-nick').click(nickClicked);
$('#input-nick').keypress(function (e) {
	if (e.keyCode == 13) {
  		nickClicked();
   }
});

/*
	check the legality of nickname
*/
function nickClicked(){
	var nickname = $('#input-nick').val();

	$('#nick-error').remove();
	try{
		if (nickname === ""){
			throw "Empty Name Invalid !";
		}else if(nickname.indexOf(" ") >= 0){
			throw "Blank Space Not Allowed !";
		}else if(nickname.length > 20){
			throw "Nickname Too Long !";
		}else if($.inArray(nickname, usersOnline) != -1){
			throw "Nickname Already Exist";
		}else{
			// valid username, enter chat
			username = nickname;
			var temp = userRef.push(nickname);
			userID = temp.name();
			$('#myModal').modal('hide'); //hide modal
		}
	}catch(err){
		var div = $("<div id='nick-error' class='alert alert-danger' style='margin-top:10px;''>");
		div.text(err);
		$('.modal-body').append(div);
	}
}


//listen for message send commmand
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


//listener on new users and add to list
userRef.on('child_added', function(snapshot){
	usersOnline.push(snapshot.val());
	var li = $("<li class='list-group-item'>");
	li.attr('id', snapshot.val());
	li.text(snapshot.val());
	//mark local user with label
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


/*
	Message update
*/
//create message listener from server
messagesRef.limitToLast(12).on('child_added', messageAdd);
//emoji list supported
var imgList = ["laugh", "smile", "cry", "lcry", "blue", "angry", "handsup", "terrified", "daze"];

//message listener
function messageAdd(snapshot) {
    //GET DATA
    var data = snapshot.val();
    var message = data.text;

    //deal with emoji using regular expression
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


/*
	release user's name when quit
*/
window.onbeforeunload = function(){
	var str = "https://boiling-torch-3823.firebaseio.com/Users/" + userID;
	var freRef = new Firebase(str);
	freRef.remove();
}

/*
	add emoji to input field (RE)
*/
$('.emoji').parent().click(function (e){
	var str = $('#messageInput').val();
	str += '[' + this.id + ']';
	$('#messageInput').val(str);
});


/*
	multi room model
*/
//listener on new rooms
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

//listener on room delete (only support deletion from server )
roomsRef.on('child_removed', function(snapshot){
	var str = "a#" + snapshot.val();
	$(str).parent().remove();
});

//new room creator
$('#bt-room').click(roomClicked);
$('#input-room').keypress(function (e) {
	if (e.keyCode == 13) {
	roomClicked();
   }
});

//check the legality of room's name
function roomClicked(){
	$('#room-error').remove();
	var roomname = $('#input-room').val();

	try{
		if (roomname === ""){
			throw "Empty Name Invalid !";
		}else if(roomname.indexOf(" ") >= 0){
			throw "Blank Space Not Allowed !";
		}else if(roomname.length > 20){
			throw "Room name Too Long !";
		}else if($.inArray(roomname, roomOnline) != -1){
			throw "Room Already Exist";
		}else{
			// valid room name, create new room
			room = roomname;
			roomChanged();
			$('#input-room').val('');
		}
	}catch(err){
		var div = $("<div id='room-error' class='alert alert-danger' style='margin-top:10px;'>");
		div.text(err);
		$('#create-room').append(div);
	}
}


//change current room
function requestChange(e){
	if(e.text === room){
		return;
	}else{
		room = e.text;
		roomChanged();
	}
};

function roomChanged(){
	//reference to new room
	currentRoom = roomsRef.child(room);
	//delete current listener on old room
	messagesRef.off('child_added', messageAdd);
	messagesRef = currentRoom.child('Messages');
	//add a new listener
	messagesRef.limitToLast(12).on('child_added', messageAdd);

	$('#messages').empty();
	$('#online-rooms li span').remove();
	var str = "a#" + room;
	$(str).parent().append("<span class='badge'>Your Room</span>");
}