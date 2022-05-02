type TriggerColor = number

type Vector2 = {x:number,y:number}
function add_vec(v1:Vector2,v2:Vector2):Vector2{
	return { x:v1.x+v2.x, y:v1.y+v2.y }
}

enum Direction {
	none  = 0,
	left  = 1,
	down  = 2,
	up    = 3,
	right = 4,
}
function direction_to_vec(g:Direction):Vector2 {
	return [{x:0,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1},{x:1,y:0}][g]
}

type Trigger = "button" | "box"

enum PhysicsFlags {
	solid     = 0x01,
	liquid    = 0x02,
  mobile    = 0x04,
	pushable  = 0x08,
	deadly    = 0x10,
	trigger   = 0x20,
	teleport  = 0x40,
	res2      = 0x80,
}
enum RenderFlags {
	transparent = 0x01,
	animated    = 0x02,
}


type TileMap = {
	physics_flags : Uint8Array,
	render_flags  : Uint8Array,
	color         : Uint8Array,
	type          : Uint8Array,
	image         : Uint8Array,
	free_mobile   : Uint8Array,
}

type MobileData = {
	inertia:Uint8Array,
}

type Map_ = {
	dimensions     : Vector2
	tiles          : TileMap,
	mobile_objects : MobileData,
	gravity        : Direction,
}

function update_mobile_indices(map:Map_) {
	
	let mobile_index = 0;
	map.tiles.physics_flags.forEach((flag,i) => {
		if (flag & PhysicsFlags.mobile){
			map.mobile_objects.inertia[mobile_index] = 0;
			mobile_index += 1;
		}
	})
}


function is_within_bounds(pos:Vector2,dimensions:Vector2):boolean {
	return pos.x<0 || pos.y<0 || pos.x>=dimensions.x || pos.y>=dimensions.y
}
// Only valid if pos is within bounds
function vec_to_index(pos:Vector2,dimensions:Vector2) {
	return pos.x + (pos.y * dimensions.x)
}

function update_mobility(map:Map_,pos:Vector2) {
	const grav = direction_to_vec(map.gravity)
	let below_pos = add_vec(pos,grav)
	let can_move = false
	if (is_within_bounds(below_pos,map.dimensions)){

	}
}

function move_mobile(map:Map_) {
	map.tiles.physics_flags.forEach((t,i)=>{
		if(t & PhysicsFlags.mobile){

		}
	})
}