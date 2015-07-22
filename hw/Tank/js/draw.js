/*
处理游戏界面的绘制及更新
*/

//更新游戏界面
function updateMiniMap() {
	updatePlayer(0);
	updatePlayer(1);
	updatePlayerLives();
	updateLeftTime();
	updateProp();
	updateBullet();
	ifPlayBombAudio();
	ifGameOver();
}

//更新坦克位置及处理死亡动态效果
function updatePlayer(id){
	var miniMapObjects = $("#minimapPlayer" + id);
	if(player[id].live){
	miniMapObjects.css("left",((player[id].x - tank_width/2)* miniMapScale+parseInt($('body').css('margin')))+"px");
	miniMapObjects.css("top",((player[id].y - tank_height/2)* miniMapScale+parseInt($('body').css('margin')))+"px");
	miniMapObjects.css("transform-origin", "50% 50%");
	miniMapObjects.css("transform","rotate("+(player[id].rot*(180)/Math.PI+90)+"deg)");
	}
	else{//坦克死亡
		miniMapObjects.css("display","none");
		var death1 = $("<img src='images/death1.gif' style='position:absolute'/>");	
		death1.css("left",((player[id].x - tank_width/2-1)* miniMapScale)+"px");
		death1.css("top",((player[id].y - tank_height/2-1)* miniMapScale)+"px");
		death1.css("transform-origin", "50% 50%");
		death1.css("transform","rotate("+(player[id].rot*(180)/Math.PI+90)+"deg)");
		death1.css("width",(expand_scale* miniMapScale)+"px");
		death1.css("height",(expand_scale* miniMapScale)+"px"); 
		$("#deathgif").append(death1);
	}
}

//更新提示界面坦克的生命数
function updatePlayerLives(){
	if(gameMode===1){//经典模式
		$("#life0").text(""+(classicDeath-playerDeath[0]));
		$("#life1").text(""+(classicDeath-playerDeath[1]));
	}
	else{//计时模式或疯狂模式
		$("#life0").text(""+playerDeath[1]);
		$("#life1").text(""+playerDeath[0]);
	}
}

//更新计时器
function updateLeftTime(){
	if(gameMode===2){//计时模式
		if(leftSecond<10)
			$("#clock_type").text("0"+leftMinute+":0"+leftSecond);
		else
			$("#clock_type").text("0"+leftMinute+":"+leftSecond);
	}
}

//更新道具显示
function updateProp(){
	var propNumble = propList.length;
	for(var i=1;i<4;i++){
		$("#prop"+i).css("display","none");
	}
	for(var j=0;j<propNumble;j++){
		var id = propList[j].id;
		$("#prop"+id).css("left",((propList[j].x-prop_width/2)*miniMapScale+parseInt($('body').css('margin')))+"px");
		$("#prop"+id).css("top",((propList[j].y-prop_width/2)*miniMapScale+parseInt($('body').css('margin')))+"px");
		$("#prop"+id).css("width",(prop_width*miniMapScale)+"px");
		$("#prop"+id).css("height",(prop_width*miniMapScale)+"px"); 
		$("#prop"+id).css("display","");
	}
}

//更新子弹位置
function updateBullet(){
	var miniMapObjects = $("#minimapBullet")[0];
	var objectCtx = miniMapObjects.getContext("2d");
	miniMapObjects.width = miniMapObjects.width;
	for(i in bulletList){
		objectCtx.fillStyle = "black";
		objectCtx.beginPath();
		objectCtx.arc(bulletList[i].x * miniMapScale,bulletList[i].y * miniMapScale,miniMapScale/2,0,Math.PI*2,true);
		objectCtx.closePath();
		objectCtx.fill();
		/*objectCtx.fillRect(		
			bulletList[i].x * miniMapScale - 3, 
			bulletList[i].y * miniMapScale - 3,
			6, 6
		);*/
	}
}

//是否播放爆炸音效
function ifPlayBombAudio(){
	if(!player[0].live||!player[1].live){
		var audio = $("#audio")[0];  
		audio.play();  
	} 
}

//处理游戏结束弹框
function ifGameOver(){
	if(gameEnd&&gameMode!=3){
		if(gameMode===1){//经典模式
			if(playerDeath[0]===classicDeath){
				$("#alertMsg").text("The blue won!");
				$("#win").css("background","#2AB");
			}
			else{
				$("#alertMsg").text("The green won!");
				$("#win").css("background","lightgreen");
			}
		}
		else{//计时模式或疯狂模式
			if(playerDeath[0]<playerDeath[1]){
				$("#alertMsg").text("The green won!");
				$("#win").css("background","lightgreen");
			}
			else if(playerDeath[0]>playerDeath[1]){
				$("#alertMsg").text("The blue won!");
				$("#win").css("background","#2AB");
			}
			else{
				$("#alertMsg").text("Tie!");
				$("#win").css("background","purple");
			}
		}
		$("#overlay").css("display","block");
		$("#win").css("display","block");
		$("#backtostart").click(function(){
			window.location.assign('start.html');
		});
		playerDeath = [0, 0];
	}
}

//初始化游戏界面
function drawMiniMap() {

	// draw the topdown view minimap
	$("#deathgif").empty();
	
	var miniMap = $("#minimap")[0];			// the actual map
	var miniMapCtr = $("#minimapcontainer")[0];		// the container div element
	var minimapPlayer1 = $("#minimapPlayer0");	// the canvas used for drawing the objects on the map (player character, etc)
	var minimapPlayer2 = $("#minimapPlayer1");
	
	var divPlayer0 = $("#divPlayer0");
	minimapPlayer1.css("width",(tank_width* miniMapScale)+"px");
	minimapPlayer1.css("height",(tank_height* miniMapScale)+"px");
	minimapPlayer1.css("display","block");
	minimapPlayer2.css("display","block");
	minimapPlayer2.css("width",(tank_width* miniMapScale)+"px");
	minimapPlayer2.css("height",(tank_height* miniMapScale)+"px");
	
	//display the lives of the tank
	for(var i=0;i<2;i++){
		var player_show = $("#Play"+i+"_lives");
		player_show.css("left",((mapWidth+5)* miniMapScale+2*parseInt($('body').css('margin')))+"px");
		player_show.css("top",((mapHeight/3*(i+1))* miniMapScale)+"px");
		player_show.css("width","90px");
		player_show.css("height","55px"); 
		var life = $("#life"+i);
		life.css("left",((mapWidth+6)* miniMapScale+2*parseInt($('body').css('margin'))+100)+"px");
		life.css("top",((mapHeight/3*(i+1))* miniMapScale-20)+"px");
	} 
	
	//display the left time
	if(gameMode===2)
	{
		var time_left = $("#clock_type");
		time_left.css("left",((mapWidth+5)* miniMapScale+3*parseInt($('body').css('margin')))+"px");
		time_left.css("top",(mapHeight/3)+"px");
	}
	
	//display the Home key
	var homekey = $("#Home_key");
	homekey.css("left",((mapWidth+6)* miniMapScale+3*parseInt($('body').css('margin')))+"px");
	homekey.css("top",((mapHeight-expand_scale)* miniMapScale+parseInt($('body').css('margin')))+"px");
	homekey.css("width","70px");
	homekey.css("height","70px"); 
	homekey.click(function(e){
				window.location.assign('start.html');
			});
	var minimapBullet = $("#minimapBullet")[0];

	miniMap.width = mapWidth * miniMapScale;	// resize the internal canvas dimensions 
	miniMap.height = mapHeight * miniMapScale;	// of both the map canvas and the object canvas
	minimapBullet.width = miniMap.width;
	minimapBullet.height = miniMap.height;
	divPlayer0.css({"width":tank_width* miniMapScale, "height":tank_height* miniMapScale});

	miniMap.style.width = minimapBullet.style.width = miniMapCtr.style.width = w;
	miniMap.style.height = minimapBullet.style.height = miniMapCtr.style.height = h;


	var ctx = miniMap.getContext("2d");

	ctx.fillStyle = "white";
	ctx.fillRect(0,0,miniMap.width,miniMap.height);

	// loop through all blocks on the map
	for (var y=0;y<mapHeight;y++) {
		for (var x=0;x<mapWidth;x++) {

			var wall = map[y][x];

			if (wall > 0 && wall < 100) { // if there is a wall block at this (x,y) ...

				ctx.fillStyle = "rgb(200,200,200)";
				ctx.fillRect(				// ... then draw a block on the minimap
					x * miniMapScale,
					y * miniMapScale,
					miniMapScale,miniMapScale
				);

			}
		}
	}
	
	updateMiniMap();
}