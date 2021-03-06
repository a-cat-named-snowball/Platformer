
import original_levels from "./original_levels.js"


function parse_levels(ll) {
	let ret = []
	for(let i=0;i<ll.length;i+=4){
		let text = ll[i].replaceAll("\t","")
		let td = text.split("\n")
		td = td.slice(1,td.length-1)
		ret.push([
			td[0].length,
			td.length,
			td.join(""),
			ll[i+1],ll[i+2],ll[i+3]
		])
	}
	return ret
}


gridsize = 50;

var LevelManager = function(){
	this.max_level = 0;
	this.current_level = 0;
	
	this.levels = parse_levels(original_levels);	


};
LevelManager.prototype.maxLevels = function(){
	return this.levels.length;
}

LevelManager.prototype.clearLevel = function(){
	if(this.current_level==this.max_level){
		this.max_level++;
	}
}
LevelManager.prototype.setLevel = function(n){
	this.current_level = n;
	this.max_level = Math.max(this.max_level,n);
}
LevelManager.prototype.getLevel = function(){
	return this.levels[Math.min(this.current_level,this.levels.length-1)];
}
LevelManager.prototype.getLevelNumber = function(){
	return this.current_level;
}
LevelManager.prototype.getMaxLevel = function(){
	return this.max_level;
}
LevelManager.prototype.setMaxLevel = function(s){
	this.max_level = s;
	this.current_level = s;
}
LevelManager.prototype.nextLevel = function(){
	if(this.current_level<this.max_level){
		this.current_level++;
	}
}

var Map = function(fin_fun){
	this.width = 0;
	this.height = 0;
	this.grid = []
	this.entities = []
	this.background = ""
	this.player = null;
	
	this.pressed = [];
	this.pressed["green"] = 0;
	this.pressed["red"] = 0;
	this.pressed["blue"] = 0;
	
	this.fin_fun = fin_fun;
	
	this.x_gravity = 0;
	this.y_gravity = 1;
	
	this.particles = [];
	
};
Map.prototype.loadData = function(data){
	this.width = data[0];
	this.height = data[1];
	grid = data[2].split("");
	
	for(var y=0;y<this.height;y++){
		row = []
		for(var x=0;x<this.width;x++){
			row.push(grid[y*this.width+x])
		}
		this.grid.push(row);
	}
	
	
	this.msg_x = data[3];
	this.msg_y = data[4];
	this.msg = data[5];
	
	//Build entities like doors, crates, and the player
	for(var y=0;y<this.height;y++){
		for(var x=0;x<this.width;x++){
			if(this.grid[y][x] == "+"){
				this.grid[y][x] = 0;
				this.addEntity(new Crate(x,y));
			}
			else if(this.grid[y][x] == "s"){
				this.grid[y][x] = 0;
				this.addEntity(new Start(x,y));
				
				this.player = new Player(x,y);
			}
			else if(this.grid[y][x] == "e"){
				this.grid[y][x] = 0;
				this.addEntity(new Goal(x,y));
			}
			else if(this.grid[y][x] == "g"){
				this.grid[y][x] = 0;
				this.addEntity(new Button(x,y,"green"));
			}
			else if(this.grid[y][x] == "G"){
				this.grid[y][x] = 0;
				this.addEntity(new Door(x,y,"green"));
			}
			else if(this.grid[y][x] == "r"){
				this.grid[y][x] = 0;
				this.addEntity(new Button(x,y,"red"));
			}
			else if(this.grid[y][x] == "R"){
				this.grid[y][x] = 0;
				this.addEntity(new Door(x,y,"red"));
			}
			else if(this.grid[y][x] == "b"){
				this.grid[y][x] = 0;
				this.addEntity(new Button(x,y,"blue"));
			}
			else if(this.grid[y][x] == "B"){
				this.grid[y][x] = 0;
				this.addEntity(new Door(x,y,"blue"));
			}
			else if(this.grid[y][x] == "^"){
				this.grid[y][x] = 0;
				this.addEntity(new Gravity(x,y,0,-1));
			}
			else if(this.grid[y][x] == "v"){
				this.grid[y][x] = 0;
				this.addEntity(new Gravity(x,y,0,1));
			}
			else if(this.grid[y][x] == "p"){
				this.grid[y][x] = 0;
				this.addEntity(new Teleporter(x,y,"purple",false));
			}
			else if(this.grid[y][x] == "y"){
				this.grid[y][x] = 0;
				this.addEntity(new Teleporter(x,y,"yellow",false));
			}
			else if(this.grid[y][x] == "c"){
				this.grid[y][x] = 0;
				this.addEntity(new Teleporter(x,y,"cyan",false));
			}
			else if(this.grid[y][x] == "P"){
				this.grid[y][x] = 0;
				this.addEntity(new Teleporter(x,y,"purple",true));
			}
			else if(this.grid[y][x] == "Y"){
				this.grid[y][x] = 0;
				this.addEntity(new Teleporter(x,y,"yellow",true));
			}
			else if(this.grid[y][x] == "C"){
				this.grid[y][x] = 0;
				this.addEntity(new Teleporter(x,y,"cyan",true));
			}
		}
	}
}
Map.prototype.addEntity = function(e){
	this.entities.push(e);
}
Map.prototype.getEntities = function(){
	return this.entities;
}
Map.prototype.tick = function(){
	for(var i=0;i<this.entities.length;i++){
		this.entities[i].tick();
		this.physics(this.entities[i]);
	}
	for(var i=this.particles.length-1;i>=0;i--){
		if(this.particles[i].tick()){
			this.particles.splice(i,1);
		}
	}
	this.player.tick(this.y_gravity);
	this.playerPhysics(this.player);
}

Map.prototype.isSolid = function(x,y){
	
	//Check tiles
	if(this.getProperty(x,y,"solid")){
		return true;
	}
	
	//Check entities
	ents = this.getEntitiesAt(x,y);
	for(var i=0;i<ents.length;i++){
		if(ents[i].base.solid){
			return true;
		}	
	}
	
	//Nothing solid here
	return false;
			
}
Map.prototype.isSolidContain = function(min_x,min_y,max_x,max_y){
	
	//Check tiles
	if(this.getPropertyContain(min_x,min_y,max_x,max_y,"solid")){
		return true;
	}
	
	//Check entities
	ents = this.getEntitiesAt(min_x,min_y);
	for(var i=0;i<ents.length;i++){
		if(ents[i].base.solid){
			return true;
		}	
	}
	//Nothing solid here
	return false;
			
}
Map.prototype.isGoal = function(x,y){
	//Check entities
	ents = this.getEntitiesAt(x,y);
	for(var i=0;i<ents.length;i++){
		if(ents[i].base.goal){
			return true;
		}	
	}
	
	//Nothing solid here
	return false;	
}
Map.prototype.getAt = function(x,y){
	if(x>=this.width || x<0 || y>=this.height || y<0){
		return false;
	}
	return this.grid[y][x];
}
Map.prototype.getProperty = function(x,y,p){
	if(x>=this.width || x<0 || y>=this.height || y<0){
		return false;
	}
	solidBlocks = ["0","+","i"];
	deadlyBlocks = ["x"];
	if(p=="solid"){
		return solidBlocks.indexOf(this.grid[y][x])!=-1;
	}
	if(p=="deadly"){
		return deadlyBlocks.indexOf(this.grid[y][x])!=-1;
	}
	
	return false;
}
Map.prototype.getPropertyTouching = function(min_x,min_y,max_x,max_y,p){
	if(this.getProperty(min_x,min_y,p)){
		return true;
	}
	else if(this.getProperty(max_x,min_y,p)){
		return true;
	}
	else if(this.getProperty(min_x,max_y,p)){
		return true;
	}
	else if(this.getProperty(max_x,max_y,p)){
		return true;
	}
	return false;
}
Map.prototype.getPropertyContain = function(min_x,min_y,max_x,max_y,p){
	if(this.getProperty(min_x,min_y,p)){
		if(this.getProperty(max_x,max_y,p)){
			return true;
		}
	}
	return false;
}
Map.prototype.getTelePos = function(freq,side){
	for(var i=0;i<this.entities.length;i++){
		e = this.entities[i];
		if(e.freq==undefined){
			continue;
		}
		if(e.freq==freq && e.side==side){
			e.tp_player = true;
			return [e.base.x,e.base.y];
		}
	}
}
Map.prototype.getEntitiesAt = function(x,y){
	ents = [];
	for(var i=0;i<this.entities.length;i++){
		ee = this.entities[i].base;
		e = this.entities[i];
		if(ee.x==x && ee.y==y){
			ents.push(e);
		}
		else if(ee.dx>0){
			if(ee.x+1==x && ee.y==y){
				ents.push(e);
			}
		}
		else if(ee.dx<0){
			if(ee.x-1==x && ee.y==y){
				ents.push(e);
			}
		}
		else if(ee.dy>0){
			if(ee.x==x && ee.y+1==y){
				ents.push(e);
			}
		}
		else if(ee.dy<0){
			if(ee.x==x && ee.y-1==y){
				ents.push(e);
			}
		}
	}
	return ents;
}
Map.prototype.physics = function(e){
	if(this.y_gravity!=0){
		if(e.base.falls && !this.isSolid(e.base.x,e.base.y+this.y_gravity) && e.base.x_dir==0 && e.base.y_dir==0){
			e.base.push(0,this.y_gravity*5);
		}
	}
	if(this.x_gravity!=0){
		if(e.base.falls && !this.isSolid(e.base.x+this.x_gravity,e.base.y) && e.base.x_dir==0 && e.base.y_dir==0){
			e.base.push(this.x_gravity*5,0);
		}
	}
	
	//Button
	if(e.trigger != undefined){
		//Check for anything in top of it
		if(this.isSolid(e.base.x,e.base.y) || ((Math.floor(this.player.x/gridsize)==e.base.x || Math.floor((this.player.x+this.player.width)/gridsize)==e.base.x) &&  Math.floor(this.player.y/gridsize)==e.base.y)){
			if(!e.trigger){
				e.trigger = true;
				this.pressed[e.color] += 1;
				e.activate(true);
				this.updateDoors();
			}
		}
		else{
			if(e.trigger){
				e.trigger = false;
				this.pressed[e.color] -= 1;
				e.activate(false);
				this.updateDoors();
			}
		}
	}
	
	//teleporter
	if(e.freq != undefined){
		//Check for player on top of it
		if((Math.floor(this.player.x/gridsize)==e.base.x && Math.floor((this.player.x+this.player.width)/gridsize)==e.base.x) &&  Math.floor((this.player.y)/gridsize)==e.base.y){
			if(!e.tp_player){
				pos = this.getTelePos(e.freq,!e.side);
				this.player.x = pos[0]*gridsize+gridsize/2-this.player.width/2;
				this.player.y = pos[1]*gridsize;
				this.player.jump = 0;
				this.player.vx = 0;
				this.player.vy = 0;
				e.tp_player = true;
				snd.playSound("teleport.wav",true);
			}
		}
		else if((Math.floor((this.player.x+10)/gridsize)!=e.base.x || Math.floor((this.player.x-10+this.player.width)/gridsize)!=e.base.x)){
			e.tp_player = false;
		}
		
		//Check crate on top of it
		local_objs = this.getEntitiesAt(e.base.x,e.base.y);
		for(var i=0;i<local_objs.length;i++){
			lo = local_objs[i];
			if(lo.teleported!=undefined && lo.teleported==false && lo.base.dx==0 && lo.base.dy==0){
				new_pos = this.getTelePos(e.freq,!e.side);
				lo.base.x = new_pos[0];
				lo.base.y = new_pos[1];
				lo.teleported = true;
				snd.playSound("teleport.wav",true);
				//this.pushCrate(lo.base.x,lo.base.y,0,1);
			}
		}
		
	}
	
	//Gravity
	if(e.yg != undefined){
		//Check for player on top of it
		if(((Math.floor(this.player.x/gridsize)==e.base.x || Math.floor((this.player.x+this.player.width)/gridsize)==e.base.x) &&  Math.floor(this.player.y/gridsize)==e.base.y)){
			if(this.x_gravity != e.xg || this.y_gravity != e.yg){
				this.x_gravity = e.xg;
				this.y_gravity = e.yg;
				snd.playSound("gravity.wav",true);
			}
		}
	}
	
	//Particles
	for(var i=0;i<this.particles.length;i++){
		p = this.particles[i];
		if(this.isSolid(Math.floor(p.x/gridsize),Math.floor(p.y/gridsize))){
			
			ml = (p.x)%gridsize-4;
			mr = gridsize-(p.x)%gridsize+4;
			mu = (p.y)%gridsize-4;
			md = gridsize-(p.y)%gridsize+4;
			
			if(ml<mu && ml<md){// && ml<=mu && ml<=md){
				this.particles[i].x -= ml+4;
				this.particles[i].dx = -2;
			}
			if(mr<mu && mr<md){// && mr<=mu && mr<=md){
				this.particles[i].x += mr+4;
				this.particles[i].dx = 2;
			}
			if(mu<mr && mu<ml){//&& mu<=ml && mu<=mr){
				this.particles[i].y -= mu+4;
				this.particles[i].dy = -2;
			}
			if(md<mr && md<ml){// && md<=mr && md<=ml){
				this.particles[i].y += md+4;
				this.particles[i].dy = 2;
			}
			
		}
	}
}
Map.prototype.updateDoors = function(){
	for(var i=0;i<this.entities.length;i++){
		e = this.entities[i];
		if(e.open==undefined){
			continue;
		}
		e.setOpen(this.pressed[e.color],this);
	}
}
Map.prototype.pushCrate = function(x,y,d){
	c = this.getEntitiesAt(x,y);
	if(Math.abs(this.player.vy)>1){
		return false;
	}
	if(c.length==0){
		return false;
	}
	if(this.isSolid(x+d,y)){
		return false;
	}
	for(var i=0;i<c.length;i++){
		if(c[i].base.dx!=0 || c[i].base.dy!=0){
			continue;
		}
		if(!c[i].base.kickable){
			continue;
		}
		if(x!=0){
			snd.playSound("slide.wav",true);
		}
		c[i].base.push(d*5,0);
		this.player.kick();
		break;
	}
}
Map.prototype.playerPhysics = function(player){
	
	min_x = Math.floor((player.x)/gridsize);
	min_y = Math.floor((player.y)/gridsize);
	max_x = Math.floor((player.x+player.width)/gridsize);
	max_y = Math.floor((player.y+player.height)/gridsize);
	
	
	player.vy *= 0.99;
	if(this.y_gravity>0){
		player.vy = Math.min(player.vy+this.y_gravity,15);
	}
	else{
		player.vy = Math.max(player.vy+this.y_gravity,-15);
	}
	player.vx += this.x_gravity;
	if(player.vx<-10){
		player.vx = -10;
	}
	if(player.vx>10){
		player.vx = 10;
	}
	
	/*if(this.isSolid(min_x,min_y)){
		console.log("right");
		player.x = max_x*gridsize-player.width-5;
	}*/
	
	
	prevx = player.vx;
	prevy = player.vy;
	total_move_x = 0;
	total_move_y = 0;
	part = 0;
	
	//UL corner
	if(this.isSolid(min_x,min_y)){
		xchange = Math.abs(player.x-(min_x*gridsize+gridsize));
		ychange = Math.abs(player.y-(min_y*gridsize+gridsize));
		
		//Move right
		if(xchange<ychange){
			total_move_x += xchange;
			player.x = min_x*gridsize+gridsize;
			player.vx = Math.max(player.vx,0);
			if(prevx<0){
				this.pushCrate(min_x,min_y,-1);
			}
		}
		//Move down
		else{
			total_move_y += ychange;
			player.y = min_y*gridsize+gridsize;
			player.vy = Math.max(player.vy,0);
			if(this.y_gravity<0){
				player.hitGround();
				part = -1;
			}
		}
	}
	//UR corner
	if(this.isSolid(max_x,min_y)){
		xchange = Math.abs(player.x-(max_x*gridsize-player.width));
		ychange = Math.abs(player.y-(min_y*gridsize+gridsize));
		
		//Move left
		if(xchange<ychange){
			total_move_x += xchange;
			player.x = max_x*gridsize-player.width;
			player.vx = Math.min(player.vx,0);
			if(prevx>0){
				this.pushCrate(max_x,min_y,1);
			}
		}
		//Move down
		else{
			total_move_y += ychange;
			player.y = min_y*gridsize+gridsize;
			player.vy = Math.max(player.vy,0);
			if(this.y_gravity<0){
				player.hitGround();
				part = -1;
			}
		}
		
	}
	//BL corner
	if(this.isSolid(min_x,max_y)){
		xchange = Math.abs(player.x-(min_x*gridsize+gridsize));
		ychange = Math.abs(player.y-(max_y*gridsize-player.height));
		
		//Move right
		if(xchange<ychange){
			total_move_x += xchange;
			player.x = min_x*gridsize+gridsize;
			player.vx = Math.max(player.vx,0);
			if(prevx<0){
				this.pushCrate(min_x,max_y,-1);
			}
		}
		//Move up
		else{
			total_move_y += ychange;
			player.y = max_y*gridsize-player.height;
			player.vy = Math.min(player.vy,0);
			if(this.y_gravity>0){
				player.hitGround();
				part = 1;
			}
		}
	}
	//BR corner
	if(this.isSolid(max_x,max_y)){
		xchange = Math.abs(player.x-(max_x*gridsize-player.width));
		ychange = Math.abs(player.y-(max_y*gridsize-player.height));
		
		//Move left
		if(xchange<ychange){
			total_move_x += xchange;
			player.x = max_x*gridsize-player.width;
			player.vx = Math.min(player.vx,0);
			if(prevx>0){
				this.pushCrate(max_x,max_y,1);
			}
		}
		//Move up
		else{
			total_move_y += ychange;
			player.y = max_y*gridsize-player.height;
			player.vy = Math.min(player.vy,0);
			if(this.y_gravity>0){
				player.hitGround();
				part = 1;
			}
		}
	}
	
	if(total_move_x>player.width || total_move_y>player.height){
		this.player.dead = true;
		this.player.vy = 0;
		this.player.vx = 0;
		return;
	}
	
	//Draw particle
	if(part!=0 && Math.abs(prevy)>=10){
		yoff = this.player.height;
		if(part==-1){
			yoff = 0;
		}
		snd.playSound("land.wav",true);
		for(var i=0;i<10;i++){
			this.addParticle(new Particle(
				this.player.x+this.player.width/2,
				this.player.y+yoff,
				Math.random()*4-2,
				-3*part,
				0,
				.4*part,
				15,
				"dust.png"
			));
		}
	}
	if(this.player.jumping){
		yoff = 15;
		if(part==-1){
			yoff = 25;
		}
		for(var i=0;i<5;i++){
			im = "smoke.png";
			if(Math.random()>0.5){
				im = "fire.png";
			}
			this.addParticle(new Particle(
				this.player.x+this.player.width/2-this.player.direction*5,
				this.player.y+yoff,
				this.player.vx/2+Math.random()*2-1,
				this.player.vy/2-Math.random()*2,
				Math.random()*.2-.1,
				(1-Math.random()*.2)*this.y_gravity,
				15,
				im
			));
		}
	}
	
	//Check goal
	if(this.isGoal(min_x,min_y)){
		snd.playSound("goal.wav",true);
		this.fin_fun();
	}
	
	
	//Check death
	if(this.getPropertyTouching(min_x,min_y,max_x,max_y,"deadly")){
		this.player.dead = true;
		this.player.vy = 0;
		this.player.vx = 0;
		return;
	}
	
	player.x += player.vx;
	player.y += player.vy;
}
Map.prototype.getPlayer = function(){
	return this.player;
}
Map.prototype.addParticle = function(p){
	this.particles.push(p);
}


var Entity = function(x,y){
	this.x = x;
	this.y = y;
	
	this.dx = 0;
	this.dy = 0;
	
	this.falls = false;
	this.solid = false;
	this.kickable = false;
	this.goal = false;
	this.image = "crate.jpg";
	
	this.x_dir = 0;
	this.y_dir = 0;
};
Entity.prototype.tick = function(){
	this.dx += this.x_dir;
	this.dy += this.y_dir;
	ret = false;
	if(this.dx>gridsize){
		this.x_dir = 0;
		this.dx = 0;
		this.x += 1;
		ret = true;
	}
	else if(this.dx<-gridsize){
		this.x_dir = 0;
		this.dx = 0;
		this.x -= 1;
		ret = true;
	}
	if(this.dy>gridsize){
		this.y_dir = 0;
		this.dy = 0;
		this.y += 1;
		ret = true;
	}
	else if(this.dy<-gridsize){
		this.y_dir = 0;
		this.dy = 0;
		this.y -= 1;
		ret = true;
	}
	return ret;
}
Entity.prototype.push = function(x,y){
	this.x_dir += x;
	this.y_dir += y;
}


var Crate = function(x,y){
	this.base = new Entity(x,y);
	this.base.falls = true;
	this.base.solid = true;
	this.base.kickable = true;
	this.base.image = "crate.jpg";
	this.teleported = false;
};
Crate.prototype.tick = function(){
	if(this.base.tick()){
		this.teleported = false;
	}
}

var Start = function(x,y){
	this.base = new Entity(x,y);
	this.base.falls = false;
	this.base.solid = false;
	this.base.kickable = false;
	this.base.image = "start_door.jpg";
};
Start.prototype.tick = function(){
	this.base.tick();
}

var Goal = function(x,y){
	this.base = new Entity(x,y);
	this.base.falls = false;
	this.base.solid = false;
	this.base.kickable = false;
	this.base.goal = true;
	this.base.image = "goal_door.jpg";
};
Goal.prototype.tick = function(){
	this.base.tick();
}



var Button = function(x,y,color){
	this.base = new Entity(x,y);
	this.base.falls = false;
	this.base.solid = false;
	this.base.kickable = false;
	this.color = color;
	this.trigger = 0;
	if(color=="green"){
		this.base.image = "green_button.png";
	}
	else if(color=="red"){
		this.base.image = "red_button.png";
	}
	else if(color=="blue"){
		this.base.image = "blue_button.png";
	}
};
Button.prototype.tick = function(){
	this.base.tick();
}
Button.prototype.activate = function(tf){
	snd.playSound("select.wav",false);
	if(tf){
		if(this.color=="green"){
			this.base.image = "green_button_activate.png";
		}
		else if(this.color=="red"){
			this.base.image = "red_button_activate.png";
		}
		else if(this.color=="blue"){
			this.base.image = "blue_button_activate.png";
		}
	}
	else{
		if(this.color=="green"){
			this.base.image = "green_button.png";
		}
		else if(this.color=="red"){
			this.base.image = "red_button.png";
		}
		else if(this.color=="blue"){
			this.base.image = "blue_button.png";
		}
	}
}

var Gravity = function(x,y,xg,yg){
	this.base = new Entity(x,y);
	this.base.falls = false;
	this.base.solid = false;
	this.base.kickable = false;
	this.xg = xg;
	this.yg = yg;
	
	if(yg==-1){
		this.base.image = "grav_up.png";
	}
	else if(yg==1){
		this.base.image = "grav_down.png";
	}
};
Gravity.prototype.tick = function(){
	this.base.tick();
}

var Door = function(x,y,color){
	this.base = new Entity(x,y);
	this.base.falls = false;
	this.base.solid = true;
	this.base.kickable = false;
	this.open = false;
	this.color = color;
	this.setOpen(false);
};
Door.prototype.setOpen = function(tf,m){
	
	if(m!=undefined && m.isSolid(this.base.x,this.base.y) && this.open){
		return;
	}
	this.open = tf;
	this.base.solid = !tf;
	
	if(tf){
		this.base.image = "open.png";
	}
	else{
		if(this.color=="green"){
			this.base.image = "green_door.jpg";
		}
		else if(this.color=="red"){
			this.base.image = "red_door.jpg";
		}
		else if(this.color=="blue"){
			this.base.image = "blue_door.jpg";
		}
	}
}
Door.prototype.tick = function(){
	this.base.tick();
}


var Teleporter = function(x,y,freq,side){
	this.base = new Entity(x,y);
	this.base.falls = false;
	this.base.solid = false;
	this.base.kickable = false;
	this.tp_player = false;
	this.freq = freq;
	this.side = side;
	
	if(freq=="yellow"){
		this.base.image = "yellow_teleporter.png";
	}
	else if(freq=="purple"){
		this.base.image = "purple_teleporter.png";
	}
	else if(freq=="cyan"){
		this.base.image = "cyan_teleporter.png";
	}
};
Teleporter.prototype.tick = function(){
	this.base.tick();
}

var Player = function(x,y){
	this.x = x*50;
	this.y = y*50;
	
	this.height = 40;
	this.width = 20;
	
	this.max_speed = 6;
	this.vx = 0;
	this.vy = 0;
	
	this.falls = true;
	this.solid = false;
	
	this.image = "player_stand.png";
	
	this.x_dir = 0;
	this.y_dir = 0;
	
	this.jump = 0;
	this.max_jump = 8.5;
	this.jumping = false;
	
	this.keys = [];
	
	this.dead = false;
	
	this.direction = 1;
};
Player.prototype.controlOn = function(k){
	this.keys[k] = true;
}
Player.prototype.controlOff = function(k){
	this.keys[k] = false;
}
Player.prototype.getControl = function(k){
	if(this.keys[k]!=undefined){
		return this.keys[k];
	}
	return false;
}
Player.prototype.tick = function(y_grav){
	
	if(this.getControl(68)){
		this.direction = 1;
		this.vx = Math.min(this.vx+2,this.max_speed);
	}
	else if(this.getControl(65)){
		this.direction = -1;
		this.vx = Math.max(this.vx-2,-this.max_speed);
	}
	else{
		this.vx *= 0.7;
	}
	
	if(this.jump<=0){
		this.jumping = false;
	}
	else if(this.getControl(87) && (this.jumping || this.jump == this.max_jump)){
		if(!this.jumping){
			this.vy = 0;
			//snd.playSound("jump.wav");
			
			this.jumping = true;
		}
		snd.playSound("exaust3.wav",false);
		if(y_grav>0){
			this.vy -= this.jump/2;
		}
		else{
			this.vy += this.jump/2;
		}
		this.jump -= 1;
	}
	else{
		this.jumping = false;
	}
}
Player.prototype.hitGround = function(){
	this.jump = this.max_jump;
	this.jumping = false;
	//playSound("land.wav");
}
Player.prototype.push = function(x,y){
	this.x_dir += x;
	this.y_dir += y;
}
Player.prototype.kick = function(){
	this.image = "player_kick.png";
	setTimeout(this.unkick.bind(this),500);
}
Player.prototype.unkick = function(){
	this.image = "player_stand.png";
}

var Particle = function(x,y,dx,dy,gx,gy,dur,image){
	this.x = x;
	this.y = y;
	this.dx = dx;
	this.dy = dy;
	this.gx = gx;
	this.gy = gy;
	this.max_dur = dur;
	this.dur = dur;
	this.image = image;
};
Particle.prototype.tick = function(){
	if(this.dur<=0){
		return true;
	}
	this.dx += this.gx;
	this.dy += this.gy;
	this.x += this.dx;
	this.y += this.dy;
	this.dur -= 1;
	
	return false;
}

var Animation = function(img,frames,speed){
	this.image = img;
	this.frames = frames;
	this.speed = speed;
	
	this.wait = 0;
	this.cur_frame = 0;
}
Animation.prototype.tick = function(){
	if(this.wait++>=this.speed){
		this.wait = 0;
		this.cur_frame = (this.cur_frame+1)%this.frames;
	}
}
Animation.prototype.drawFrame = function(ctx,image){
	sx = Math.floor(image.width/this.frames*this.cur_frame);
	ctx.drawImage(image,sx,0,image.width/this.frames,image.height,0,0,image.width/this.frames,image.height);
}

var Artist = function(){
	this.canvas = document.getElementById("canvas");
	
/*	if(this.canvas.webkitRequestFullScreen){
		this.canvas.webkitRequestFullScreen();
	}
	else{
		this.canvas.mozRequestFullScreen();
	}  */
	this.ctx = null;
	this.image_cache = [];
	this.loading_images = 0;
	this.doneload = function(){};
	this.delta = 0;
	this.cx = null;
	this.cy = null;
	this.deadzoom = 1;
	this.tiles = null;
	
	this.walk_anim = new Animation("player_walk.png",8,2);
};
Artist.prototype.getImage = function(name){
	if(this.image_cache[name]==undefined){
		img = new Image();
		this.loading_images += 1;
		img.onload = function(){this.imageLoaded()}.bind(this);
		img.src = "images/"+name;
		this.image_cache[name] = img;
	}
	return this.image_cache[name]
}
Artist.prototype.preload = function(images,fun){
	for(var i=0;i<images.length;i++){
		this.getImage(images[i]);
	}
	this.doneload = fun;
}
Artist.prototype.imageLoaded = function(){
	this.loading_images -= 1;
	if(this.loading_images==0){
		this.doneload();
	}
}
Artist.prototype.init = function(){
	try {
		this.ctx = this.canvas.getContext("2d")
	}
	catch(e) {}
	if (!this.ctx) {
		alert("Unable to initialize canvas.");
		this.ctx = null;
	}
}
Artist.prototype.tileBackground = function(img,ox,oy){
	img = this.getImage(img);
	c = 1000;
	w = img.width;
	h = img.height;
	for(var x=ox%w-w;x<this.width+w;x+=w-1){
		for(var y=oy%h-h;y<this.height+h;y+=h-1){
			this.ctx.drawImage(img,x,y);
			c -= 1;
			if(c<=0){
				return;
			}
		}
	}
}

Artist.prototype.reset = function(){
	this.cx = null;
	this.cy = null;
	this.deadzoom = 1;
	this.tiles = null;
}
Artist.prototype.preRenderTiles = function(map){
	//Draw tiles
	this.tiles = document.createElement("canvas");
	this.tiles.setAttribute("width",map.width*gridsize);
	this.tiles.setAttribute("height",map.height*gridsize);
	ctx = this.tiles.getContext("2d");
	for(var y=0;y<map.height;y++){
		for(var x=0;x<map.width;x++){
			ctx.save();
			ctx.translate(x*gridsize,y*gridsize);
			if(map.getAt(x,y)==="0"){
				mask = 0;
				if(map.getAt(x,y-1)==="0"){mask += 1}
				if(map.getAt(x+1,y)==="0"){mask += 2}
				if(map.getAt(x,y+1)==="0"){mask += 4}
				if(map.getAt(x-1,y)==="0"){mask += 8}
				img = this.getImage("floor_tile.jpg");
				
				ctx.drawImage(img,gridsize*(mask%4),gridsize*Math.floor(mask/4),gridsize,gridsize,0,0,gridsize,gridsize);
				
			}
			else if(map.getAt(x,y)==="x"){
				mask = 0;
				if(map.getAt(x,y-1)==="x" || map.getAt(x,y-1)==="0"){mask += 1}
				if(map.getAt(x+1,y)==="x" || map.getAt(x+1,y)==="0"){mask += 2}
				if(map.getAt(x,y+1)==="x" || map.getAt(x,y+1)==="0"){mask += 4}
				if(map.getAt(x-1,y)==="x" || map.getAt(x-1,y)==="0"){mask += 8}
				img = this.getImage("lava_tile.jpg");
				
				ctx.drawImage(img,gridsize*(mask%4),gridsize*Math.floor(mask/4),gridsize,gridsize,0,0,gridsize,gridsize);
			}
			else{
				img = this.getImage("dark.jpg");
				ctx.drawImage(img,0,0);
			}
			ctx.restore();
		}
	}
}
Artist.prototype.drawMap = function(map,ox,oy){
	var ctx = this.ctx;
	
	this.canvas.style.width ='100%';
	this.canvas.style.height='100%';
	this.canvas.width  = this.canvas.offsetWidth;
	this.canvas.height = this.canvas.offsetHeight;
	this.width = this.canvas.width
	this.height = this.canvas.height
	
	if(this.cx==null){
		this.cx = ox;
		this.cy = oy;
	}
	else{
		this.cx += (ox-this.cx)/10;
		this.cy += (oy-this.cy)/10;
	}
	ox = parseInt(this.cx);
	oy = parseInt(this.cy);
	
	this.tileBackground("background.jpg",-ox/2,-oy/2);
	
	ctx.save();
	
	
	ctx.translate(this.width/2,this.height/2);
	
	if(map.getPlayer().dead){
		if(this.deadzoom==1){
			snd.playSound("death.wav",true);
		}
		this.deadzoom += 0.05;
		ctx.scale(Math.min(2,this.deadzoom),Math.min(2,this.deadzoom));
		
		if(this.deadzoom>=3){
			map.player = null;
			return true;
		}
	}
	
	
	ctx.translate(-ox,-oy);
	
	
	//Draw tiles
	if(this.tiles==null){
		this.preRenderTiles(map);
	}
	ctx.drawImage(this.tiles,0,0);
	
	//Draw message
	if(map.msg!=""){
		
		msg = map.msg.split("\n");
		for(var i=0;i<msg.length;i++){
			ctx.font="20px Georgia";
			ctx.fillStyle = "#000";
			ctx.fillText(msg[i],map.msg_x*gridsize+10,map.msg_y*gridsize+30+i*30);
			
			ctx.fillStyle = "#fff";
			ctx.fillText(msg[i],map.msg_x*gridsize+10,map.msg_y*gridsize+29+i*30);
		}
	}
	
	//Draw entities
	ents = map.getEntities();
	for(var i=0;i<ents.length;i++){
		e = ents[i].base;
		img = this.getImage(e.image);
		ctx.save();
		ctx.translate(e.x*gridsize+e.dx,e.y*gridsize+e.dy);
		ctx.drawImage(img,0,0);
		ctx.restore();
	}
	
	//Draw player
	e = map.getPlayer();
	ctx.save();
	img = this.getImage(e.image);
	ctx.translate(e.x,e.y);
	
	if(e.direction==-1){
		ctx.scale(-1,1);
		ctx.translate(-e.width,0);
	}
	if(map.y_gravity<1){
		ctx.scale(1,-1);
		ctx.translate(0,-e.height);
	}
	if(Math.abs(e.vx)>1){
		this.walk_anim.tick();
		this.walk_anim.drawFrame(ctx,this.getImage(this.walk_anim.image));
	}
	else{
		ctx.drawImage(img,0,0);
	}
	
	ctx.restore();
	
	//Draw particles
	for(var i=0;i<map.particles.length;i++){
		ctx.save();
		p = map.particles[i];
		ctx.translate(p.x,p.y);
		img = this.getImage(p.image);
		ctx.drawImage(img,-img.width/2,-img.height/2);
		ctx.restore();
	}
	ctx.restore();
	
	return false;
	
}


var Ui = function(restart){
	this.keys = [];
	this.puppet = null;
	this.t1 = null;
	this.t2 = null;
	this.t3 = null;
	this.restart = restart;
};

Ui.prototype.init = function(canvas){
	window.addEventListener("keyup",function(e){
		e = e || window.event; 
		var charCode = e.charCode || e.keyCode
		this.keyUp(charCode);
	}.bind(this),false);
	
	window.addEventListener("keydown",function(e){
		e = e || window.event; 
		var charCode = e.charCode || e.keyCode
		this.keyDown(charCode);
		
	}.bind(this),false);
}

Ui.prototype.keyUp = function(k){
	if(k==32){
		k=87;
	}
	else if(k==37){
		k=65;
	}
	else if(k==38){
		k=87;
	}
	else if(k==39){
		k=68;
	}
	else if(k==82){
		this.restart();
	}
	
	this.keys[k] = false;
	if(this.puppet!=null){
		this.puppet.controlOff(k);
	}
}
Ui.prototype.keyDown = function(k){
	if(k==32){
		k=87;
	}
	else if(k==37){
		k=65;
	}
	else if(k==38){
		k=87;
	}
	else if(k==39){
		k=68;
	}
	this.keys[k] = true;
	if(this.puppet!=null){
		this.puppet.controlOn(k);
	}
}
Ui.prototype.removeTouch = function(){
	/*if(this.t1!=undefined){
		this.t1.parentNode.removeChild(t1);
		this.t2.parentNode.removeChild(t2);
		this.t3.parentNode.removeChild(t3);
	}*/
}
Ui.prototype.configTouchControls = function(){
	
	lbump = document.createElement("div");
	lbump.setAttribute("style","position:absolute;left:0px;top:0px;bottom:0px;width:20%;");
	document.getElementById("game_container").appendChild(lbump);
	lbump.addEventListener("touchstart",function(e){
		e.preventDefault();
		this.keyDown(65);
	}.bind(this));
	lbump.addEventListener("touchend",function(e){
		this.keyUp(65);
	}.bind(this));
	
	rbump = document.createElement("div");
	rbump.setAttribute("style","position:absolute;right:0px;top:0px;bottom:0px;width:20%;");
	document.getElementById("game_container").appendChild(rbump);
	rbump.addEventListener("touchstart",function(e){
		e.preventDefault();
		this.keyDown(68);
	}.bind(this));
	rbump.addEventListener("touchend",function(e){
		this.keyUp(68);
	}.bind(this));
	
	rev = document.createElement("div");
	rev.setAttribute("style","position:absolute;right:20%;left:20%;top:0px;bottom:0px;");
	document.getElementById("game_container").appendChild(rev);
	rev.addEventListener("touchstart",function(e){
		e.preventDefault();
		this.keyDown(87);
	}.bind(this));
	rev.addEventListener("touchend",function(e){
		this.keyUp(87);
	}.bind(this));
	
	this.t1 = lbump;
	this.t2 = rbump;
	this.t3 = rev;
}

Ui.prototype.getKey = function(k){
	if(this.keys.length<=k){
		return false;
	}
	return this.keys[k];
}
Ui.prototype.setControl = function(p){
	this.puppet = p;
}



var titleScreen = function(){
	
	
	ts = document.createElement("div");
	
	ts.lm = new LevelManager();
	if(getCookie("level")!=""){
		ts.lm.setMaxLevel(parseInt(getCookie("level")));
	}
	
	ts.timer = null;
	ts.running = false;
	
	ts.setAttribute("class","container");
	
	ts.redrawMenu = function(){
		begin = document.createElement("div");
		begin.setAttribute("class","titleScreen");
		begin.appendChild(document.createTextNode("Untitled Platformer"));
		
		
			start_btn = document.createElement("div");
			start_btn.setAttribute("class","btn");
			start_btn.appendChild(document.createTextNode("Start"));
			start_btn.onclick = function(){this.loadScreen(["play"])}.bind(ts);
			begin.appendChild(start_btn);
			
			start_btn = document.createElement("div");
			start_btn.setAttribute("class","btn");
			start_btn.appendChild(document.createTextNode("Level Select"));
			start_btn.onclick = function(){this.loadScreen(["levels"])}.bind(ts);
			begin.appendChild(start_btn);
		
		levels = document.createElement("div");
		levels.setAttribute("class","levelScreen");
		levels.appendChild(document.createTextNode("Levels"));
			
			back = document.createElement("div");
			back.setAttribute("class","btn back");
			back.appendChild(document.createTextNode("Back"));
			back.onclick = function(){this.loadScreen(["begin"])}.bind(ts);
			levels.appendChild(back);
			
			scroll = document.createElement("div");
			scroll.setAttribute("class","scroll");
				for(var i=0;i<ts.lm.maxLevels();i++){
					start_btn = document.createElement("div");
					start_btn.setAttribute("class","btn");
					start_btn.appendChild(document.createTextNode(i+1));
					if(i<=ts.lm.getMaxLevel()){
						start_btn.onclick = function(){this[0].loadScreen(["play",this[1]])}.bind([ts,i]);
					}
					else{
						start_btn.setAttribute("class","btn disabled");
					}
					scroll.appendChild(start_btn);
				}
			levels.appendChild(scroll);
		
		playarea = document.createElement("div");
		playarea.setAttribute("class","playScreen");
			back = document.createElement("div");
			back.setAttribute("class","btn back");
			back.appendChild(document.createTextNode("Back"));
			back.onclick = function(){this.loadScreen(["levels"])}.bind(ts);
			playarea.appendChild(back);
			
			res = document.createElement("div");
			res.setAttribute("class","btn res");
			res.appendChild(document.createTextNode("Restart"));
			res.onclick = function(){this.restart()}.bind(ts);
			playarea.appendChild(res);
			
			canvas = document.createElement("canvas");
			canvas.setAttribute("id","canvas");
			playarea.appendChild(canvas);
		
		victory = document.createElement("div");
		victory.setAttribute("class","victoryScreen");
		victory.appendChild(document.createTextNode("Victory"));
		
		
			start_btn = document.createElement("div");
			start_btn.setAttribute("class","btn");
			start_btn.appendChild(document.createTextNode("Back to menu"));
			start_btn.onclick = function(){this.loadScreen(["begin"])}.bind(ts);
			victory.appendChild(start_btn);
			
			
		ts.begin = begin;
		ts.levels = levels;
		ts.playarea = playarea;
		ts.canvas = canvas;
		ts.victory = victory;
	}.bind(ts);
	
	ts.redrawMenu();
	
	
	
	ts.loadScreen = function(s){
		//clearInterval(ts.timer);
		ts.running = false;
		if(this.ui!=undefined){
			this.ui.removeTouch();
		}
		this.redrawMenu();
		if(s[0]=="begin"){
			this.innerHTML = "";
			this.appendChild(this.begin);
		}
		if(s[0]=="levels"){
			this.innerHTML = "";
			this.appendChild(this.levels);
		}
		if(s[0]=="play"){
			if(s[1]!=undefined){
				this.lm.setLevel(s[1]);
			}
			this.innerHTML = "";
			this.appendChild(this.playarea);
			this.beginGame();
		}
		if(s[0]=="victory"){
			this.innerHTML = "";
			this.appendChild(this.victory);
		}
	}.bind(ts);
	
	
	ts.restart = function(){
		this.map = new Map(this.nextLevel.bind(this));
		this.map.loadData(this.lm.getLevel());
		this.artist.reset();
		this.ui.setControl(this.map.getPlayer());
	}.bind(ts);
	
	ts.nextLevel = function(){
		this.map = new Map(this.nextLevel.bind(this));
		this.lm.clearLevel();
		this.lm.nextLevel();
		
		setCookie("level",this.lm.getMaxLevel(),100*365);
		if(this.lm.getLevelNumber()==this.lm.maxLevels()){
			this.loadScreen(["victory"]);
			clearInterval(ts.timer);
			ts.running = false;
			this.victory = true;
			return;
		}
		this.artist.reset();
		this.map.loadData(this.lm.getLevel());
		this.ui.setControl(this.map.getPlayer());
	}.bind(ts);
	
	ts.start = function(){
		this.map = new Map(this.nextLevel);
		this.map.loadData(this.lm.getLevel());
		this.ui.init(this.canvas);
		this.artist.init();
		this.artist.reset();
		this.ui.setControl(this.map.getPlayer());
		this.ui.configTouchControls();
		//clearInterval(ts.timer);
		ts.running = true;
		ts.start = null;
		ts.timer = setInterval(this.tick,30);

		requestAnimationFrame(this.tick)
	}.bind(ts);
	
	ts.tick = function(elapsed){
		if (ts.start === undefined) {
			ts.start = elapsed;
		}
		const delta = elapsed - ts.start;
		if(delta<17){
			requestAnimationFrame(ts.tick)
			return;
		}
		ts.start = elapsed;

		this.map.tick();
		if(this.victory){
			this.victory = false;
			return;
		}
		if(this.map.player==null){
			this.restart();
			return;
		}
		
		p = this.map.getPlayer();		
		if(this.artist.drawMap(this.map,p.x+p.vx*10,p.y+p.vy*10)){
			this.restart();
			return;
		}

		if(ts.running) {
			requestAnimationFrame(ts.tick)
		}
	}.bind(ts);
	
	ts.beginGame = function(){
		this.victory = false;
		this.artist = new Artist();
		this.ui = new Ui(this.restart);
		this.artist.preload(
			["green_button_activate.png","red_button_activate.png","blue_button_activate.png","lava_tile.jpg","floor_tile.jpg","fire.png","dust.png","smoke.png","cyan_teleporter.png","yellow_teleporter.png","purple_teleporter.png","open.png","dark.jpg","grav_up.png","grav_down.png","lava.jpg","player_walk.png","player_stand.png","background.jpg","crate.jpg","floor.jpg","start_door.jpg","goal_door.jpg","player.png","player_kick.png","green_door_open.png","green_button.png","green_door.jpg","red_door_open.png","red_button.png","red_door.jpg","blue_door_open.png","blue_button.png","blue_door.jpg"],
			this.start.bind(this)
		);

	}.bind(ts);
	ts.loadScreen(["begin"]);
	
	
	return ts;
}();

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
} 
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return "";
}

var Sound = function(){
	this.sounds = [];
}
Sound.prototype.playSound = function(sn,multiple){
	var audio = this.getSound(sn);
	if(multiple){
		audio.pause();
		audio.currentTime = 0;
	}
	audio.play();
}
Sound.prototype.getSound = function(name){
	if(this.sounds[name]==undefined){
		sn = new Audio();
		sn.src = "sounds/"+name;
		this.sounds[name] = sn;
	}
	return this.sounds[name]
}
snd = new Sound();

document.getElementById("game_container").appendChild(ts);
