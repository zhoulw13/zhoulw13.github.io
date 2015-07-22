/*
处理游戏过程中的逻辑及数据更新
*/

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
var gameTime = 5;
var classicDeath = 20;
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
var propKind = 3;
var maxProp = 3;
var propList;
var propInterval = 20000;
var prop_width = 3;
var propEfeectTime = 20000;
var propDictionary = ["endlessbullet", "lightBullet", "protection"];
var propDelete;

var initTimeout;

getMode();
setTimeout(init, 1);


function init() {
	//flag for end of game
	playerDied = false;
	gameEnd = false;

	//randomly map and map's info
	var random = Math.floor(Math.random()*maps.length);
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
	while(pos1.x === pos2.x && pos1.y === pos2.y){
		var pos2 = generatePos();
	}
	player.push(playerMake(0, pos1));
	player.push(playerMake(1, pos2));

	
	//generate bullet list
	bulletList = new Array();

	//generate prop list
	propList = new Array();
	propDelete = new Array();
	setTimeout(generateProp, propInterval);

	bindKeys();

	//draw init map
	drawMiniMap();

	gameCycle();
}

//Game Cycle
function gameCycle() {

	move();

	isGameEnd();

	updateMiniMap();

	//get time in time mode
	if(gameMode === 2){
		updateTime();
	}

	if(!playerDied && !gameEnd){
		setTimeout(gameCycle,1000/30);
	}
}

//move tanks and bullets
function move() {
	moveSinglePlayer(0);
	moveSinglePlayer(1);
	moveBullet();
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

			case 79: // 'O', bullet
				var bullet = bulletMake(player[0]);
				if(bullet != null){
					bulletList.push(bullet);
				}
				break;

			//player 2
			case 87: // 'W', move player 2 forward, ie. increase speed
				player[1].speed = 1;
				break;

			case 83: // 'S', move player 2 backward, set negative speed
				player[1].speed = -1;
				break;

			case 65: // 'A', rotate player 2 left
				player[1].dir = -1;
				break;

			case 68: // 'D', rotate player 2 right
				player[1].dir = 1;
				break;

			case 32: // 'space', bullet
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
			case 87:
			case 83:
				player[1].speed = 0;	// stop the player movement when up/down key is released
				break;
			case 65:
			case 68:
				player[1].dir = 0;
				break;
		}
	}
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


/*
	function for players
*/

//make a player
function playerMake(id, pos){
	var player = {
		x : pos.x,			// current x, y position
		y : pos.y,
		dir : 0,		// the direction that the player is turning, either -1 for left or 1 for right.
		rot : Math.random()*twoPI,		// the current angle of rotation
		speed : 0,		// is the playing moving forward (speed = 1) or backwards (speed = -1).
		moveSpeed : 0.5,	// how far (in map units) does the player move each step/update
		rotSpeed : 7 * Math.PI / 180,	// how much does the player rotate each step/update (in radians)

		//tank's four corner's pos
		lu_x: 0,
		lu_y: 0,
		ru_x: 0,
		ru_y: 0,
		ld_x: 0,
		ld_y: 0,
		rd_x: 0,
		rd_y: 0,
		
		bullet: 0, //bullets player already use
		bullet_max:(gameMode === 3)?10:5, 
		prop:0,  //prop 0 means non
		live: true,
		player_id : id
	}
	player = getPlayerPos(player);
	return player;
}


//get tank's four corner's pos
// use in blocking detect
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

//move a tank
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
		if(player[id].speed === 0 && player[id].dir != 0){ //rotate besides wall
			smoothRotate(id, tplayer, block);
			player[id] = getPlayerPos(player[id]);
			return;
		}else{  //slide for tank
			smoothMove(id, tplayer, block);
			player[id] = getPlayerPos(player[id]);
			return; // no, bail out. 
		}
	}
	// if not blocked , then move
	player[id] = tplayer;

	isPlayerGetProp(id);
}

// use some points in tank's four side to 
// judge is player going to be blocked
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

//坦克在墙边旋转时，使其先偏移墙一点距离，确定不会撞到，再旋转
function smoothRotate(id, tplayer, block){
	var str = ["lu", "ld", "ru", "rd"];

	//to see which corner of tank will be blocked
	var arr = new Array;
	arr.push((map[Math.floor(tplayer.lu_y)][Math.floor(tplayer.lu_x)] != 0 )? 1: 0);
	arr.push((map[Math.floor(tplayer.ld_y)][Math.floor(tplayer.ld_x)] != 0 )? 1: 0);
	arr.push((map[Math.floor(tplayer.ru_y)][Math.floor(tplayer.ru_x)] != 0 )? 1: 0);
	arr.push((map[Math.floor(tplayer.rd_y)][Math.floor(tplayer.rd_x)] != 0 )? 1: 0);
	var sum = arr.reduce(function(pv, cv) { return pv + cv; }, 0);
	switch(sum){
		case 1:
			if(block === 1){
				rotateY(id, str[arr.indexOf(1)]+"_y", tplayer);
			}else if(block === 2){
				rotateX(id, str[arr.indexOf(1)]+"_x", tplayer);
			}
			break;
		case 2:
			var first = str[arr.indexOf(1)];
			arr.splice(arr.indexOf(1), 1);
			var second = str[arr.indexOf(1)+1];
			if(map[Math.floor(tplayer[first+"_y"])][Math.floor(tplayer[second+"_x"])] === 3){
				rotateY(id, first+"_y", tplayer);
				rotateX(id, second+"_x", tplayer);
			}else if (map[Math.floor(tplayer[second+"_y"])][Math.floor(tplayer[first+"_x"])] === 3){
				rotateY(id, second+"_y", tplayer);
				rotateX(id, first+"_x", tplayer);
			}
			break;
		default:
			break;
	}
	player[id].rot = (tplayer.rot+twoPI)%twoPI;
}

//在Y方向上偏移距离
function rotateY(id, str, tplayer){
	var y = tplayer[str];
	if(y > player[id].y){
		player[id].y -= y-Math.floor(y);
	}else{
		player[id].y += Math.floor(y) + 1 - y;
	}
}

//在X方向上偏移距离
function rotateX(id, str, tplayer){
	var x = tplayer[str];
	if(x > player[id].x){
		player[id].x -= x-Math.floor(x);
	}else{
		player[id].x += Math.floor(x) + 1 - x;
	}
}

//坦克撞到墙时的滑动处理
//这部分代码写得很庞大，比较乱
//因为解决这个问题的时候一直都是修修补补，添加新的判断
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
			}else{ //坦克撞上了边角
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
		case 0: //坦克的四个角都没有碰到墙，而是边碰到了
			if(block === 3){ //是坦克的侧面 碰到 墙的边角时，忽略这个碰撞
				var stepH = Math.floor(tank_height);
				var stepW = Math.floor(tank_width);
				var block_sum = 0;
				for(i = 0; i <= stepW; i++){
					var x = tplayer.ru_x*i/stepW + tplayer.lu_x*(stepW-i)/stepW;
					var y = tplayer.ru_y*i/stepW + tplayer.lu_y*(stepW-i)/stepW;
					if(isBlocking(x, y) != 0){
						block_sum++;
					}
				}
				for(i = 0; i <= stepW; i++){
					var x = tplayer.ld_x*i/stepW + tplayer.rd_x*(stepW-i)/stepW;
					var y = tplayer.ld_y*i/stepW + tplayer.rd_y*(stepW-i)/stepW;
					if(isBlocking(x, y) != 0){
						block_sum++;
					}
				}
				if(block_sum === 0){
					player[id] = tplayer;
				}
			}
			break;
		default:
			break;
	}
}

//slide when tank run into wall
// rather than stop soon.
// pon show the wall vertically or horizontaly
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
	function for bullet
*/
// make a bullet for a player
function bulletMake(player){
	if(player.bullet >= player.bullet_max){ //player's bullet is limited
		return null;
	}

	player.bullet += 1;
	var bullet = {
		x: player.x + Math.cos(player.rot)*(tank_height/2+0.5),
		y: player.y + Math.sin(player.rot)*(tank_height/2+0.5),
		rot: player.rot,
		moveSpeed : (gameMode === 3)?0.9:0.7,
		id: player.bullet,
		player: player.player_id,
		light_prop: (player.prop === 2)
	}
	
	//delete bullet after sometime
	var str = "bulletDelete();"
	var t = setTimeout(str, 20000);
	bulletDeleteArray.push(t);

	return bullet;
}

//delete a bullet after sometime
function bulletDelete(){
	//player will get bullet again
	player[bulletList[0].player].bullet--;
	bulletList.shift();
	bulletDeleteArray.shift();
}

//bullet's move
function moveBullet(){
	for(i in bulletList){
		var moveStep = bulletList[i].moveSpeed;	// bullet will move this far along the current direction vector

		// make sure the angle is between 0 and 360 degrees
		while (bulletList[i].rot < 0) bulletList[i].rot += twoPI;
		while (bulletList[i].rot >= twoPI) bulletList[i].rot -= twoPI;

		var newX = bulletList[i].x + Math.cos(bulletList[i].rot) * moveStep;	// calculate new position with simple trigonometry
		var newY = bulletList[i].y + Math.sin(bulletList[i].rot) * moveStep;


		var block = isBlocking(newX, newY, "bullet");
		if ((block != 0 && bulletList[i].light_prop === false) || (block === 5 && bulletList[i].light_prop === true)) {	// are we allowed to move to the new position?
			bulletReflection(bulletList[i], Math.floor(newX), Math.floor(newY), newX, newY);
			continue;
		}

		bulletList[i].x = newX; // set new position
		bulletList[i].y = newY;

		//if bullet kill someone, delete it and game will end
		if(killSomeone(i, newX, newY)){
			playerDied = true;
			bulletList.splice(i, 1);

			for(j in propDelete){
				clearTimeout(propDelete[j]);
			}
			initTimeout= setTimeout(init, 1000);
			return;
		}
	}
}

//judge if a bullet kill someone
function killSomeone(i, x, y){
	var id, j;
	for (id=0; id<=1; id++){
		if(Math.sqrt((x-player[id].x)*(x-player[id].x) + (y-player[id].y)*(y-player[id].y)) <= tank_width/2){
			if(player[id].prop === 3){
				player[bulletList[i].player].bullet--;
				bulletList.splice(i , 1);
				clearTimeout(bulletDeleteArray[i]);
				bulletDeleteArray.splice(i , 1);
				continue;
			}
			player[id].live = false;
			playerDeath[id]++;
			for(j in bulletDeleteArray){
				clearTimeout(bulletDeleteArray[j]);
			}
			bulletDeleteArray = [];
			propList = [];
			return true;
		}
	}
	return false;
}

//bullet reflect when block by wall
// analyse bullet and wall's direction
function bulletReflection(bullet, x, y, fx, fy){
	if(map[y][x] === 1){ // A horizontal wall
		horizontalReflect(bullet);
	} else if(map[y][x] === 2){ // A vertical wall
		verticalReflect(bullet);
	}else{ 						// hit the corner
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

//when bullet run into a horizontal wall
function horizontalReflect(bullet){
	bullet.rot = twoPI - bullet.rot;
}

//when bullet run into a vertical wall
function verticalReflect(bullet){
	if(bullet.rot < Math.PI){
		bullet.rot  = Math.PI - bullet.rot;
	}else{
		bullet.rot  = 3*Math.PI - bullet.rot;
	}
}


/*
	Prop function
*/

//make a prop
// only 3 different prop at every time
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
	var tid;
	if(propList.length === 0){
		tid = Math.ceil(Math.random()*propKind);
	}else if(propList.length === 2){
		tid = 6 - propList[0].id - propList[1].id;
	}else{
		if(propList[0].id === 1){
			tid = Math.ceil(Math.random()*2)+1;
		}else if(propList[0].id === 2){
			tid = ((Math.random() > 0.5) ? 1 : -1)+2;
		}else{
			tid = Math.ceil(Math.random()*2);
		}
	}

	var prop = {
		id:tid,
		x:pos.x,
		y:pos.y
	}

	return prop;
}

//generate prop in a frequency
function generateProp(){
	if(propList.length < maxProp){
		var prop = propMake();
		propList.push(prop);
		//alert(prop.x + ',' + prop.y);
	}

	if(!playerDied && !gameEnd){
		var t = setTimeout(generateProp, propInterval);
		propDelete.push(t);
	}
}

//for player
//judge if player will get a prop now 
// a prop at a time
function isPlayerGetProp(id){
	if(player[id].prop != 0){ //player already get prop
		return;
	}
	for(i in propList){
		var dis = Math.pow(player[id].x - propList[i].x, 2) + Math.pow(player[id].y - propList[i].y, 2);
		if(Math.sqrt(dis) <= (tank_width+ prop_width)/2){
			player[id].prop = propList[i].id;
			propList.splice(i, 1);
			var str = "propTimeover(" + id + ")";
			setTimeout(str, propEfeectTime);
			switch(player[id].prop){
				case 1:
					player[id].bullet_max = 1000;
					break;
				case 2:
					break;
				case 3:
					break;
			}
			return;
		}
	}
}

//when player's prop get time over
//delete it's effect
function propTimeover(id){
	switch(player[id].prop){
		case 1:
			player[id].bullet_max = ((gameMode === 3)?10:5);
			player[id].bullet = 0;
			break;
		case 2:
			break;
		case 3:
	}
	player[id].prop = 0;
}



/*
	process function
*/

//get game mode from start page
function getMode(){
	var url=location.href; 
	var str=url.split("?")[1];
	gameMode = parseInt(str.split('=')[1]);
	if(gameMode === 2){
		var date = new Date();
		startTime = date.getTime();
	}
}

//update time every cycle in time mode
function updateTime(){
	var date = new Date();
	var past = (date.getTime() - startTime)/1000;
	var minute = Math.floor(past/60);
	var second = Math.floor(past%60);
	leftMinute = gameTime -  minute - (second != 0);
	leftSecond = (second != 0)? 60 - second : 0;
	//console.log(leftMinute+','+leftSecond);
}

//judge if game ended in different mode
function isGameEnd(){
	if(gameMode === 1){
		if(playerDeath[0] === classicDeath || playerDeath[1] === classicDeath){
			gameEnd = true;
			clearTimeout(initTimeout);
		}
	}else if(gameMode === 2){
		if(leftMinute <= 0 && leftSecond <= 0){
			gameEnd = true;
			clearTimeout(initTimeout);
		}
	}else{

	}
}


/*
	other function
*/
// clone a object
function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

//
function isBlocking(x,y, item) {

	// first make sure that we cannot move outside the boundaries of the level
	if(item === "bullet"){
		if(Math.floor(y) === 0 || Math.floor(y) === mapHeight-1 || Math.floor(x) === 0 || Math.floor(x) === mapWidth-1)
			return 5;
	}

	if (y < 0 || y >= mapHeight || x < 0 || x >= mapWidth)
		return 4;

	// return true if the map block is not 0, ie. if there is a blocking wall.
	return (map[Math.floor(y)][Math.floor(x)]);
}