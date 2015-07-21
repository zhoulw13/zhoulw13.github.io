function updateMiniMap() {
	updatePlayer(0);
	updatePlayer(1);
	updateBullet();
}

function updatePlayer(id){
	var miniMapObjects = $("#minimapPlayer" + id);
	if(player[id].live){
	miniMapObjects.css("left",((player[id].x - tank_width/2)* miniMapScale+parseInt($('body').css('margin')))+"px");
	miniMapObjects.css("top",((player[id].y - tank_height/2)* miniMapScale+parseInt($('body').css('margin')))+"px");
	miniMapObjects.css("transform-origin", "50% 50%");
	miniMapObjects.css("transform","rotate("+(player[id].rot*(180)/Math.PI+90)+"deg)");
	}
	else{
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

	
	/*var objectCtx = miniMapObjects.getContext("2d");
	miniMapObjects.width = miniMapObjects.width;

	/*objectCtx.fillStyle = color;
	objectCtx.fillRect(		// draw a dot at the current player[id] position
		player[id].x * miniMapScale - miniMapScale/2, 
		player[id].y * miniMapScale - miniMapScale/2,
		miniMapScale, miniMapScale
	);
	objectCtx.strokeStyle = color;
	objectCtx.beginPath();
	objectCtx.moveTo(player[id].lu_x * miniMapScale, player[id].lu_y * miniMapScale);
	objectCtx.lineTo(player[id].ru_x * miniMapScale, player[id].ru_y * miniMapScale);
	objectCtx.lineTo(player[id].rd_x * miniMapScale, player[id].rd_y * miniMapScale);
	objectCtx.lineTo(player[id].ld_x * miniMapScale, player[id].ld_y * miniMapScale);
	objectCtx.closePath();
	objectCtx.stroke();


	objectCtx.strokeStyle = color;
	objectCtx.beginPath();
	objectCtx.moveTo(player[id].x * miniMapScale, player[id].y * miniMapScale);
	objectCtx.lineTo(
		(player[id].x + Math.cos(player[id].rot) * 4) * miniMapScale,
		(player[id].y + Math.sin(player[id].rot) * 4) * miniMapScale
	);
	objectCtx.closePath();
	objectCtx.stroke(); */
}

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

				/*if(wall === 1)
					ctx.fillStyle = "rgb(255,0,0)";	
				else if(wall === 2)
					ctx.fillStyle = "rgb(0,255,0)";
				else*/
					ctx.fillStyle = "rgb(150,150,150)";
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