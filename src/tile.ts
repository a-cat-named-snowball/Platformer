type TriggerColor = number;
enum GravityDirection {
	left  = 0x8,
	down  = 0x4,
	up    = 0x2,
	right = 0x1,
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
	color        : Uint8Array,
	type         : Uint8Array,
	image        : Uint8Array,
}

type Map_ = {
	width:number,height:number,
	tiles:TileMap,
}

function move_mobile(map:Map_) {

	map.tiles.physics_flags.forEach((t,i)=>{
		if(t & PhysicsFlags.mobile){

		}
	})
}