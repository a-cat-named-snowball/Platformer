
enum Physics {
	collision = 0x01,
	static    = 0x02,
	trigger   = 0x04,
	moving    = 0x08,
	liquid    = 0x10,
	res5      = 0x20,
	res6      = 0x40,
	res7      = 0x80,
}

type Entities = {
	head       : number,
	grave      : number[],
	dead       : Uint8Array,
	on_tiles   : Uint16Array,
	offx       : Int8Array,
	offy       : Int8Array,
	height     : Uint8Array,
	width      : Uint8Array,
	image_id   : Uint8Array,
	physics    : Uint8Array,
}

const SIZE = 1024
const MAX_TILES_COVERED = 4

export function create():Entities {
	return {
		head       : 0,
		grave      : [],
		dead       : new Uint8Array(SIZE),
		on_tiles   : new Uint16Array(SIZE*MAX_TILES_COVERED),
		offx       : new Int8Array(SIZE),
		offy       : new Int8Array(SIZE),
		height     : new Uint8Array(SIZE),
		width      : new Uint8Array(SIZE),
		image_id   : new Uint8Array(SIZE),
		physics    : new Uint8Array(SIZE),
	}
}

export function add(e:Entities) {
	if(e.grave.length>0){
		return e.grave.pop()
	} else {
		return e.head++
	}
}

export function remove(e:Entities,i:number) {

	for(let o=i;o<i+MAX_TILES_COVERED;o++){
		e.on_tiles[o] = 0
	}

	e.dead[i]     = 1
	e.offx[i]     = 0
	e.offy[i]     = 0
	e.width[i]    = 0
	e.height[i]   = 0
	e.image_id[i] = 0
	e.physics[i]  = 0

	if(i==e.head-1){
		e.head--
	} else {
		e.grave.push(i)
	}
}