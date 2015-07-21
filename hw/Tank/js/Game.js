//map
var map;
var w = 0;
var h = 0;
var mapWidth = 0;
var mapHeight = 0;
var miniMapScale;

//game mode
var gameEnd = false;
var gameMode = 1;
var gameTime = 1;
var classicDeath = 2;
var leftMinute = 5;
var leftSecond = 0;
var startTime;

//player
var player;
var playerDied = false;
var playerDeath = [0, 0];

//bullet
var bulletList;
var bulletDeleteArray = new Array();

//const
var twoPI = Math.PI * 2;
var halfPI = Math.PI/2;
var mhalfPI = Math.PI * 3 / 2;

//prop
var propKind = 1;
var propList;
var propInterval = 20000;

getMode();
setTimeout(init, 1);


function init() {
	playerDied = false;
	gameEnd = false;

	var random = 4;//Math.floor(Math.random()*maps.length);
	map = expand_map(random);
	mapWidth = map[0].length;
	mapHeight = map.length;
	miniMapScale = Math.floor(640/mapHeight);
	w = (mapWidth * miniMapScale) + "px"; 	// minimap CSS dimensions
	h = (mapHeight * miniMapScale) + "px";

	//generate two player
	player = new Array();
	var pos1 = generatePos();
	var pos2 = generatePos();
	pos1 = {
		x:2*(1+expand_scale) - expand_scale/2,
		y:3*(1+expand_scale) - expand_scale/2
	}
	while(pos1.x === pos2.x && pos1.y === pos2.y){
		var pos2 = generatePos();
	}

	player.push(playerMake(0, pos1));
	player.push(playerMake(1, pos2));

	//generate bullet list
	bulletList = new Array();

	//generate prop list
	propList = new Array();
	setTimeout(generateProp, propInterval);

	bindKeys();

	drawMiniMap();

	gameCycle();
}

//Game Cycle
function gameCycle() {

	move();

	updateMiniMap();

	isGameEnd();

	if(gameMode === 2){
		updateTime();
	}

	if(!playerDied && !gameEnd){
		setTimeout(gameCycle,1000/30);
	}
}

function playerMake(id, pos){
	var player = {
		x : pos.x,			// current x, y position
		y : pos.y,
		dir : 0,		// the direction that the player is turning, either -1 for left or 1 for right.
		rot : Math.random()*twoPI,		// the current angle of rotation
		speed : 0,		// is the playing moving forward (speed = 1) or backwards (speed = -1).
		moveSpeed : 0.5,	// how far (in map units) does the player move each step/update
		rotSpeed : 7 * Math.PI / 180,	// how much does the player rotate each step/update (in radians)

		lu_x: 0,
		lu_y: 0,
		ru_x: 0,
		ru_y: 0,
		ld_x: 0,
		ld_y: 0,
		rd_x: 0,
		rd_y: 0,
		
		bullet: 0,
		bullet_max:(gameMode === 3)?10:5,
		live: true,
		player_id : id
	}
	player = getPlayerPos(player);
	return player;
}

// generate a good pos for player
// make sure init pos in a grid
function generatePos(){
	var pos = {
		x:0,
		y:0
	}
	var x = Math.ceil(Math.floor(raw_width/2)*Math.random());
	var y = Math.ceil(Math.floor(raw_height/2)*Math.random());
	pos.x = x*(1+expand_scale) - expand_scale/2;
	pos.y = y*(1+expand_scale) - expand_scale/2;
	return pos;
}

function getPlayerPos(player){
	var tplayer = clone(player);
	var theta1 = tplayer.rot + tank_angle;
	var theta2 = tplayer.rot - tank_angle;

	tplayer.lu_x = tplayer.x + Math.cos(theta2)*tank_hypotenuse;
	tplayer.lu_y = tplayer.y + Math.sin(theta2)*tank_hypotenuse;

	tplayer.ru_x =  tplayer.x + Math.cos(theta1)*tank_hypotenuse;
	tplayer.ru_y =  tplayer.y + Math.sin(theta1)*tank_hypotenuse;

	tplayer.ld_x =  tplayer.x - Math.cos(theta1)*tank_hypotenuse;
	tplayer.ld_y =  tplayer.y - Math.sin(theta1)*tank_hypotenuse;

	tplayer.rd_x = tplayer.x - Math.cos(theta2)*tank_hypotenuse;
	tplayer.rd_y = tplayer.y - Math.sin(theta2)*tank_hypotenuse;

	return tplayer;
}

// clone a object
function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

function bulletMake(player){
	if(player.bullet >= player.bullet_max){
		return null;
	}

	player.bullet += 1;
	var bullet = {
		x: player.x + Math.cos(player.rot)*(tank_height/2+0.5),
		y: player.y + Math.sin(player.rot)*(tank_height/2+0.5),
		rot: player.rot,
		moveSpeed : (gameMode === 3)?0.9:0.7,
		id: player.bullet,
		player: player.player_id
	}
	
	//delete bullet after sometime
	var str = "bulletDelete();"
	var t = setTimeout(str, 20000);
	bulletDeleteArray.push(t);

	return bullet;
}

function bulletDelete(){
	//player will get bullet again
	player[bulletList[0].player].bullet--;
	bulletList.shift();
}

/*
	Prop
*/
function propMake(){
	var pos, i;
	while(true){
		pos = generatePos();
		if((pos.x === player[0].x && pos.y === player[0].y) 
		||(pos.x === player[1].x && pos.y === player[1].y))
			continue;
		for(i in propList){
			if(pos.x === propList[i].x && pos.y === propList[i].y)
				continue;
		}
		break;
	}
	var prop = {
		id:Math.ceil(Math.random()*propKind),
		x:pos.x,
		y:pos.y
	}

	return prop;
}

function generateProp(){
	if(!playerDied && !gameEnd){
		setTimeout(generateProp, propInterval);
	}
	var prop = propMake();
	propList.push(prop);
}


// bind keyboard events to game functions (movement, etc)
function bindKeys() {

	document.onkeydown = function(e) {
		e = e || window.event;

		switch (e.keyCode) { // which key was pressed?

			//player 1
			case 38: // up, move player 1 forward, ie. increase speed
				player[0].speed = 1;
				break;

			case 40: // down, move player 1 backward, set negative speed
				player[0].speed = -1;
				break;

			case 37: // left, rotate player 1 left
				player[0].dir = -1;
				break;

			case 39: // right, rotate player 1 right
				player[0].dir = 1;
				break;

			case 191: // '/?', bullet
				var bullet = bulletMake(player[0]);
				if(bullet != null){
					bulletList.push(bullet);
				}
				break;

			//player 2
			case 84: // 'T', move player 2 forward, ie. increase speed
				player[1].speed = 1;
				break;

			case 71: // 'G', move player 2 backward, set negative speed
				player[1].speed = -1;
				break;

			case 70: // 'F', rotate player 2 left
				player[1].dir = -1;
				break;

			case 72: // 'H', rotate player 2 right
				player[1].dir = 1;
				break;

			case 81: // 'Q', bullet
				var bullet = bulletMake(player[1]);
				if(bullet != null){
					bulletList.push(bullet);
				}
				break;
		}
	}

	document.onkeyup = function(e) {
		e = e || window.event;

		switch (e.keyCode) {
			//player 1
			case 38:
			case 40:
				player[0].speed = 0;	// stop the player movement when up/down key is released
				break;
			case 37:
			case 39:
				player[0].dir = 0;
				break;

			//player 2
			case 84:
			case 71:
				player[1].speed = 0;	// stop the player movement when up/down key is released
				break;
			case 70:
			case 72:
				player[1].dir = 0;
				break;
		}
	}
}

function move() {
	moveSinglePlayer(0);
	moveSinglePlayer(1);
	moveBullet();
}

function moveSinglePlayer(id){
	var moveStep = player[id].speed * player[id].moveSpeed;	// player[id] will move this far along the current direction vector

	var rot = player[id].rot + player[id].dir * player[id].rotSpeed; // add rotation if player[id] is rotating (player[id].dir != 0)

	// make sure the angle is between 0 and 360 degrees
	while (rot < 0) rot += twoPI;
	while (rot >= twoPI) rot -= twoPI;

	var newX = player[id].x + Math.cos(rot) * moveStep;	// calculate new player[id] position with simple trigonometry
	var newY = player[id].y + Math.sin(rot) * moveStep;

	var tplayer = clone(player[id]);
	tplayer.rot = rot;
	tplayer.x = newX;
	tplayer.y = newY;
	tplayer = getPlayerPos(tplayer);


	var block = isPlayerBlocked(tplayer);
	if (block != 0){ // are we allowed to move to the new position?
		if(player[id].speed === 0 && player[id].dir != 0){
			smoothRotate(id, tplayer, block);
			player[id] = getPlayerPos(player[id]);
			return;
		}else{
			smoothMove(id, tplayer, block);
			player[id] = getPlayerPos(player[id]);
			return; // no, bail out. 
		}
	}

	player[id] = tplayer;
}

function isBlocking(x,y) {

	// first make sure that we cannot move outside the boundaries of the level
	if (y < 0 || y >= mapHeight || x < 0 || x >= mapWidth)
		return 4;

	// return true if the map block is not 0, ie. if there is a blocking wall.
	return (map[Math.floor(y)][Math.floor(x)]); 
}

function isPlayerBlocked(player){
	var stepH = Math.floor(tank_height);
	var stepW = Math.floor(tank_width);
	var i, j;
	for(i = 0; i <= stepH; i++){
		var x = player.lu_x*i/stepH + player.ld_x*(stepH-i)/stepH;
		var y = player.lu_y*i/stepH + player.ld_y*(stepH-i)/stepH;
		if(isBlocking(x, y) != 0){
			return isBlocking(x, y);
		}
	}
	for(i = 0; i <= stepW; i++){
		var x = player.ld_x*i/stepW + player.rd_x*(stepW-i)/stepW;
		var y = player.ld_y*i/stepW + player.rd_y*(stepW-i)/stepW;
		if(isBlocking(x, y) != 0){
			return isBlocking(x, y);
		}
	}
	for(i = 0; i <= stepH; i++){
		var x = player.rd_x*i/stepH + player.ru_x*(stepH-i)/stepH;
		var y = player.rd_y*i/stepH + player.ru_y*(stepH-i)/stepH;
		if(isBlocking(x, y) != 0){
			return isBlocking(x, y);
		}
	}
	for(i = 0; i <= stepW; i++){
		var x = player.ru_x*i/stepW + player.lu_x*(stepW-i)/stepW;
		var y = player.ru_y*i/stepW + player.lu_y*(stepW-i)/stepW;
		if(isBlocking(x, y) != 0){
			return isBlocking(x, y);
		}
	}
	return 0;
}

function smoothRotate(id, tplayer, block){
	var str = ["lu", "ld", "ru", "rd"];
	var arr = new Array;
	arr.push((map[Math.floor(tplayer.lu_y)][Math.floor(tplayer.lu_x)] != 0 )? 1: 0);
	arr.push((map[Math.floor(tplayer.ld_y)][Math.floor(tplayer.ld_x)] != 0 )? 1: 0);
	arr.push((map[Math.floor(tplayer.ru_y)][Math.floor(tplayer.ru_x)] != 0 )? 1: 0);
	arr.push((map[Math.floor(tplayer.rd_y)][Math.floor(tplayer.rd_x)] != 0 )? 1: 0);
	if(block === 1){
		var y = tplayer[str[arr.indexOf(1)]+"_y"];
		if(y > player[id].y){
			player[id].y -= y-Math.floor(y);
		}else{
			player[id].y += Math.floor(y) + 1 - y;
		}
	}else if(block === 2){
		var x = tplayer[str[arr.indexOf(1)]+"_x"];
		if(x > player[id].x){
			player[id].x -= x-Math.floor(x);
		}else{
			player[id].x += Math.floor(x) + 1 - x;
		}
	}else{

	}
	player[id].rot = (tplayer.rot+twoPI)%twoPI;
}

function smoothMove(id, tplayer, block){
	var str = ["lu", "ld", "ru", "rd"];
	var arr = new Array;
	arr.push((map[Math.floor(tplayer.lu_y)][Math.floor(tplayer.lu_x)] != 0 )? 1: 0);
	arr.push((map[Math.floor(tplayer.ld_y)][Math.floor(tplayer.ld_x)] != 0 )? 1: 0);
	arr.push((map[Math.floor(tplayer.ru_y)][Math.floor(tplayer.ru_x)] != 0 )? 1: 0);
	arr.push((map[Math.floor(tplayer.rd_y)][Math.floor(tplayer.rd_x)] != 0 )? 1: 0);
	var sum = arr.reduce(function(pv, cv) { return pv + cv; }, 0);
	switch (sum){
		case 1:
			if(block === 1){ // a horizontal wall
				slide(id, -1);
			}else if(block === 2){ // a vertical wall
				slide(id, 1);
			}else{
				var fx = tplayer[str[arr.indexOf(1)]+"_x"];
				var fy = tplayer[str[arr.indexOf(1)]+"_y"];
				var x = Math.floor(fx);
				var y = Math.floor(fy);
				var tRot = (tplayer.rot + twoPI + (tplayer.speed===-1)*Math.PI)%twoPI;
				var dx = (tRot > halfPI && tRot < mhalfPI) ? 1 : -1;
				var dy = (tRot > Math.PI) ? 1 : -1;
				var key = map[y+dy][x] + map[y][x+dx];
				if(key === 1){
					slide(id, -1);
				}else if(key === 2){
					slide(id, 1);
				}else if(key === 0){
					var err = 0.05;
					var rot = (player[id].rot + twoPI + (player[id].speed === -1)*Math.PI)%twoPI;
					if(rot < halfPI){
						var theta = Math.atan((fy-y)/(fx-x));
						if(rot > theta + err){
							slide(id, -1);
						}else if(rot < theta - err){
							slide(id, 1);
						}
					}else if(rot < Math.PI){
						var theta = Math.atan((fy-y)/(fx-x-1)) + Math.PI;
						if(rot > theta + err){
							slide(id, 1);
						}else if(rot < theta - err){
							slide(id, -1);
						}
					}else if(rot < mhalfPI){
						var theta = Math.atan((fy-y-1)/(fx-x-1)) + Math.PI;
						if(rot > theta + err){
							slide(id, -1);
						}else if(rot < theta - err){
							slide(id, 1);
						}
					}else{
						var theta = Math.atan((fy-y-1)/(fx-x)) + 2*Math.PI;
						if(rot > theta + err){
							slide(id, 1);
						}else if(rot < theta - err){
							slide(id, -1);
						}
					}
				}
			}
			break;
		case 0:
			if(block === 3){

			}
			break;
		default:
			break;
	}
}

function slide(id, pon){
	var rotate_delta = 0.1;
	var moveStep;
	var str = (pon === 1)? 'y' : 'x';
	if(pon === -1){
		moveStep = player[id].speed * player[id].moveSpeed * Math.cos(player[id].rot);	
	}else{
		moveStep = player[id].speed * player[id].moveSpeed * Math.sin(player[id].rot);	
	}
	player[id][str] += moveStep/2;
	
	if(player[id].rot < halfPI || (player[id].rot > Math.PI && player[id].rot < mhalfPI)){
		player[id].rot += pon*rotate_delta;
	}else{
		player[id].rot -= pon*rotate_delta;
	}

	var rot = (player[id].rot + twoPI + (player[id].speed === -1)*Math.PI)%twoPI;
	if(Math.abs(rot - Math.PI) < rotate_delta){
		rot = Math.PI;
	}else if(Math.abs(rot - mhalfPI) < rotate_delta){
		rot = mhalfPI;
	}else if(Math.abs(rot) < rotate_delta || Math.abs(twoPI - rot) < rotate_delta){
		rot = 0;
	}else if(Math.abs(rot - halfPI) < rotate_delta){
		rot = halfPI;
	}


	player[id].rot = (rot+ twoPI + (player[id].speed === -1)*Math.PI)%twoPI;
}


/*
	Bullet's move
*/
function moveBullet(){
	for(i in bulletList){
		var moveStep = bulletList[i].moveSpeed;	// bullet will move this far along the current direction vector

		// make sure the angle is between 0 and 360 degrees
		while (bulletList[i].rot < 0) bulletList[i].rot += twoPI;
		while (bulletList[i].rot >= twoPI) bulletList[i].rot -= twoPI;

		var newX = bulletList[i].x + Math.cos(bulletList[i].rot) * moveStep;	// calculate new position with simple trigonometry
		var newY = bulletList[i].y + Math.sin(bulletList[i].rot) * moveStep;

		if(killSomeone(newX, newY)){
			playerDied = true;
			bulletList.splice(i, 1);
			setTimeout(init, 1000);
			return;
		}

		if (isBlocking(newX, newY) != 0) {	// are we allowed to move to the new position?
			bulletReflection(bulletList[i], Math.floor(newX), Math.floor(newY), newX, newY);
			i--;
			continue;
		}

		bulletList[i].x = newX; // set new position
		bulletList[i].y = newY;
	}
}

function killSomeone(x, y){
	var i, j;
	for (i=0; i<=1; i++){
		if(Math.sqrt((x-player[i].x)*(x-player[i].x) + (y-player[i].y)*(y-player[i].y)) <= tank_width*tank_width/4){
			player[i].live = false;
			playerDeath[i]++;
			for(j in bulletDeleteArray){
				clearTimeout(bulletDeleteArray[j]);
			}
			bulletDeleteArray = [];
			return true;
		}
	}
	return false;
}

function bulletReflection(bullet, x, y, fx, fy){
	if(map[y][x] === 1){ // A horizontal wall
		horizontalReflect(bullet);
	} else if(map[y][x] === 2){ // A vertical wall
		verticalReflect(bullet);
	}else{ // hit the corner
		var dx = (bullet.rot > halfPI && bullet.rot < mhalfPI) ? 1 : -1;
		var dy = (bullet.rot > Math.PI) ? 1 : -1;
		var key = map[y+dy][x] + map[y][x+dx];

		if(key === 1){
			horizontalReflect(bullet);
		}else if(key === 2){
			verticalReflect(bullet);
		}else if(key == 3){
			bullet.rot = (bullet.rot+Math.PI)%twoPI;
		}else{
			var err = 0.05;
			if(bullet.rot < halfPI){
				var theta = Math.atan((fy-y)/(fx-x));
				if(bullet.rot > theta + err){
					horizontalReflect(bullet);
				}else if(bullet.rot < theta - err){
					verticalReflect(bullet);
				}else{
					bullet.rot = (bullet.rot+Math.PI)%twoPI;
				}
			}else if(bullet.rot < Math.PI){
				var theta = Math.atan((fy-y)/(fx-x-1)) + Math.PI;
				if(bullet.rot > theta + err){
					verticalReflect(bullet);
				}else if(bullet.rot < theta - err){
					horizontalReflect(bullet);
				}else{
					bullet.rot = (bullet.rot+Math.PI)%twoPI;
				}
			}else if(bullet.rot < mhalfPI){
				var theta = Math.atan((fy-y-1)/(fx-x-1)) + Math.PI;
				if(bullet.rot > theta + err){
					horizontalReflect(bullet);
				}else if(bullet.rot < theta - err){
					verticalReflect(bullet);
				}else{
					bullet.rot = (bullet.rot+Math.PI)%twoPI;
				}
			}else{
				var theta = Math.atan((fy-y-1)/(fx-x)) + 2*Math.PI;
				if(bullet.rot > theta + err){
					verticalReflect(bullet);
				}else if(bullet.rot < theta - err){
					horizontalReflect(bullet);
				}else{
					bullet.rot = (bullet.rot+Math.PI)%twoPI;
				}
			}
		}
	}
}


function horizontalReflect(bullet){
	bullet.rot = twoPI - bullet.rot;
}

function verticalReflect(bullet){
	if(bullet.rot < Math.PI){
		bullet.rot  = Math.PI - bullet.rot;
	}else{
		bullet.rot  = 3*Math.PI - bullet.rot;
	}
}

function getMode(){
	var url=location.href; 
	var str=url.split("?")[1];
	gameMode = parseInt(str.split('=')[1]);
	if(gameMode === 2){
		var date = new Date();
		startTime = date.getTime();
	}
}

function updateTime(){
	var date = new Date();
	var past = (date.getTime() - startTime)/1000;
	var minute = Math.floor(past/60);
	var second = Math.floor(past%60);
	leftMinute = gameTime -  minute - (second != 0);
	leftSecond = (second != 0)? 60 - second : 0;
	console.log(leftMinute+','+leftSecond);
}


function isGameEnd(){
	if(gameMode === 1){
		if(playerDeath[0] === classicDeath || playerDeath[0] === classicDeath){
			gameEnd = true;
			playerDeath = [0, 0];
		}
	}else if(gameMode === 2){
		if(leftMinute <= 0 && leftSecond <= 0){
			gameEnd = true;
			leftSecond = 0;
			leftMinute = gameTime;
			var date = new Date();
			startTime = date.getTime();
			playerDeath = [0, 0];
		}
	}else{

	}
}