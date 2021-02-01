Hooks.once('init',function() {

if ((game.modules.has('grape_juice-isometrics') && game.modules.get('grape_juice-isometrics').active))
	throw 'Full Version loaded, disabling embedded Viewer'

// Add flag to global scope for interfacing with multiple Viewers
if (globalThis.isometric_viewer !== 1){
	globalThis.isometric_viewer=1;

	if (!game.modules.get('grape_juice-isometrics')) {
	            game.modules.set('grape_juice-isometrics', {
	                active: false,
	                id: "grape_juice-isometrics",
	                data: {
	                    name: "grape_juice-isometrics",
	                    title: "grape_juice-isometrics",
	                    description: "Isometric Module for foundry.",
	                    languages:[]
	                }
	            });
	        }


// helpers

function getWorldTransformMatrix() {
	    const world = new Matrix();
        world.a = canvas.app.stage.worldTransform.a;
        world.b = canvas.app.stage.worldTransform.b;
        world.c = canvas.app.stage.worldTransform.c;
        world.d = canvas.app.stage.worldTransform.d;
        world.e = canvas.app.stage.worldTransform.tx;
        world.f = canvas.app.stage.worldTransform.ty;
        return world
}

function getWorldTransformPIXIMatrix() {
	    const world = getWorldTransformMatrix()

        m = new PIXI.Matrix()
	    m.a = world.inverse().a
	    m.b = world.inverse().b
	    m.c = world.inverse().c
	    m.d = world.inverse().d
	    m.tx = world.inverse().e
	    m.ty = world.inverse().f
        return m

}



Hooks.on("dragDropPositioning", (positioning) => {
    let event = positioning.event;
    let data = positioning.data;
    if (game.scenes.viewed.getFlag('grape_juice-isometrics', 'is_isometric')) {
        const [x, y] = [event.clientX, event.clientY];
		world = getWorldTransformMatrix()
        data.x = (world.inverse().applyToPoint(x, y).x);
        data.y = (world.inverse().applyToPoint(x, y).y);
    }
});


Hooks.on("transformPosToIso", (data) => {
    if (game.scenes.viewed.getFlag('grape_juice-isometrics', 'is_isometric')) {
        const {x, y} = data;
		var world = getWorldTransformMatrix()
        data.x = (world.inverse().applyToPoint(x, y).x);
        data.y = (world.inverse().applyToPoint(x, y).y);
    }
});


function array_move(arr, old_index, new_index) {
    if (new_index >= arr.length) {
        var k = new_index - arr.length + 1;
        while (k--) {
            arr.push(undefined);
        }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    return arr; // for testing
};//ui

// 
Hooks.on('dropCanvasData', function(that, data) {
	if (game.scenes.viewed.getFlag('grape_juice-isometrics', 'is_isometric')) {

		world = getWorldTransformMatrix()
		const [x, y] = [event.clientX, event.clientY];
		data.x = (world.inverse().applyToPoint(x, y).x)
		data.y = (world.inverse().applyToPoint(x, y).y)


	}
})


function tool_bar_toggler(togg, name) {
	if (gm_global_view === name) {
		gm_global_view = "isometrics_Auto_Hide";
	} else {
		gm_global_view = name;

	}
	if(gm_global_view !=="isometrics_Auto_Hide"){
	// Hooks.call('sightRefresh',{'sources':[]})
	Hooks.call('sightRefresh')

	}
}

// renderApplication
// renderSceneControls


Hooks.on("renderApplication", (controls) => {
 if (game.scenes.viewed.getFlag('grape_juice-isometrics', 'is_isometric')) {

	for (aa of $('#controls > li.scene-control.active > ol > li.control-tool[data-tool^="isometrics"]')) {
		if (aa.attributes['data-tool'].value !== gm_global_view) {
			aa.classList.remove('active')
		}
		else{
			aa.classList.add('active')

		}
	}
}
});


Hooks.on("getSceneControlButtons", (controls) => {
 if (game.scenes.viewed.getFlag('grape_juice-isometrics', 'is_isometric')) {

	if (game.user.isGM) {
		tools = controls.find(x => x['name'] == 'tiles').tools
		tools.push({
			active: true,
			icon: "fas fa-eye-dropper",
			name: "isometrics_Auto_Hide",
			title: "Auto Hides Based on Token (default)",
			onClick: (togg) => {
				tool_bar_toggler(togg, 'isometrics_Auto_Hide')
			},
			toggle: true
		}, {
			active: false,
			icon: "fas fa-eye",
			name: "isometrics_Always_Show",
			title: "Always Show Tiles",
			onClick: (togg) => {
				tool_bar_toggler(togg, 'isometrics_Always_Show')
			},
			toggle: true
		}, {
			active: false,
			icon: "fas fa-low-vision",
			name: "isometrics_Always_Show_50",
			title: "Always Show Tiles at %50 alpha",
			onClick: (togg) => {
				tool_bar_toggler(togg, 'isometrics_Always_Show_50')
			},
			toggle: true
		}, {
			active: false,
			icon: "fas fa-eye-slash",
			name: "isometrics_Always_Hide",
			title: "Always Hide Tiles",
			onClick: (togg) => {
				tool_bar_toggler(togg, 'isometrics_Always_Hide')
			},
			toggle: true
		}, );

	}
}
	
});

Hooks.on('init', function() {
	KeyboardManager.prototype._handleCanvasPan = (function() {
		return function() {

		    // Determine movement offsets
		    const directions = this._moveKeys;
		    let dx = 0;
		    let dy = 0;
			if (game.scenes.viewed.getFlag('grape_juice-isometrics', 'is_isometric')) {
				if (directions.has("left")) {
					dx -= 1;
					dy -= 1
				};
				if (directions.has("up")) {dy -= 1;dx+=1}
				if (directions.has("right")) {dx += 1;dy+=1}
				if (directions.has("down")) {dy += 1;dx-=1}
				dy/=directions.size
				dx/=directions.size
			} else {
				if (directions.has("left")) dx -= 1;
				if (directions.has("up")) dy -= 1;
				if (directions.has("right")) dx += 1;
				if (directions.has("down")) dy += 1;
			}

		    // Pan by the grid size
		    const s = canvas.dimensions.size;
		    canvas.animatePan({
		      x: canvas.stage.pivot.x + (dx * s),
		      y: canvas.stage.pivot.y + (dy * s),
		      duration: 100
		    });

		    // Clear the pending set
		    this._moveKeys.clear();
	}

	})();

	KeyboardManager.prototype._handleMovement = (function(event, layer) {
		return function(event, layer) {

			if (!this._moveKeys.size) return;

			// Get controlled objects
			let objects = layer.placeables.filter(o => o._controlled);
			if (objects.length === 0) return;

			// Define movement offsets and get moved directions
			const directions = this._moveKeys;
			let dx = 0;
			let dy = 0;
			if (game.scenes.viewed.getFlag('grape_juice-isometrics', 'is_isometric')) {
				if (directions.has("left")) {
					dx -= 1;
					dy -= 1
				};
				if (directions.has("up")) {dy -= 1;dx+=1}
				if (directions.has("right")) {dx += 1;dy+=1}
				if (directions.has("down")) {dy += 1;dx-=1}
				dy/=directions.size
				dx/=directions.size
			} else {
				if (directions.has("left")) dx -= 1;
				if (directions.has("up")) dy -= 1;
				if (directions.has("right")) dx += 1;
				if (directions.has("down")) dy += 1;
			}
			// Assign movement offsets

			this._moveKeys.clear();
			// Perform the shift or rotation
			layer.moveMany({
				dx,
				dy,
				rotate: event.shiftKey
			});
		}

	})();
});//hud

Hooks.on('canvasInit', function() {

    if (game.scenes.viewed.getFlag('grape_juice-isometrics', 'is_isometric')) {
        BasePlaceableHUD.prototype._render = (function() {
            var cached_function = BasePlaceableHUD.prototype._render;

            return async function() {
                // your code

                var result = await cached_function.apply(this, arguments); // use .apply() to call it

                if (game.scenes.viewed.getFlag('grape_juice-isometrics', 'is_isometric')) {
                ratio = canvas.app.stage.scale.x
                var glob = this.object.toGlobal(new PIXI.Point(0))

                var point = new PIXI.Point(canvas.app.stage.localTransform.tx, canvas.app.stage.localTransform.ty)
                var x = glob.x - point.x + (this.object.width / (4 / ratio)) //+ 25// - (this.object.width) //todo
                var y = glob.y - point.y - (this.object.height / (4 / ratio)); // - 25// - (this.object.height) //todo
                this.element.css('left', (x / ratio) + 'px')
                this.element.css('top', (y / ratio) + 'px')
            }
                return result;
            };
        })();
    }
});
Hooks.on('canvasInit', function() {
// Hooks.on('init', function() {
// Hooks.on('canvasReady', function() {
    // if (true) {
    if (game.scenes.viewed.getFlag('grape_juice-isometrics', 'is_isometric')) {
        SightLayer.computeSight = (function(origin, radius, {angle=360, density=6, rotation=0, unrestricted=false}={}) {
            return function(origin, radius, {angle=360, density=6, rotation=0, unrestricted=false}={}){

     // The maximum ray distance needs to reach all areas of the canvas
        let d = canvas.dimensions;
        let {x, y} = origin;
        const dx = Math.max(origin.x, d.width - origin.x);
        const dy = Math.max(origin.y, d.height - origin.y);
        const distance = Math.max(radius, Math.hypot(dx, dy));
        const limit = radius / distance;



        // Determine the direction of facing, the angle of vision, and the angles of boundary rays
        const limitAngle = angle.between(0, 360, false);
        const aMin = limitAngle ? normalizeRadians(toRadians(rotation + 90 - (angle / 2))) : -Math.PI;
        const aMax = limitAngle ? aMin + toRadians(angle) : Math.PI;

        // For high wall count maps, restrict to a subset of endpoints using quadtree bounds
        // Target wall endpoints within the vision radius or within 10 grid units, whichever is larger
        let endpoints = unrestricted ? [] : canvas.walls.endpoints;
        let bounds = null;
        if ( endpoints.length > SightLayer.EXACT_VISION_THRESHOLD ) {
          const rb2 = Math.max(d.size * 10, radius);
          bounds = new NormalizedRectangle(origin.x - rb2, origin.y - rb2, (2 * rb2), (2 * rb2));
          let walls = canvas.walls.quadtree.getObjects(bounds);
          endpoints = WallsLayer.getUniqueEndpoints(walls, {bounds, blockMovement: false, blockSenses: true});
        }

        // Cast sight rays at target endpoints using the full unrestricted line-of-sight distance
        const rays = this._castRays(x, y, distance, {density, endpoints, limitAngle, aMin, aMax});

        // Partition rays by node
        const quadMap = new Map();
        for ( let r of rays ) {
          r._cs = null;
          r._c = null;
          const nodes = canvas.walls.quadtree.getLeafNodes(r.bounds);
          for ( let n of nodes ) {
            let s = quadMap.get(n);
            if ( !s ) {
              s = new Set();
              quadMap.set(n, s);
            }
            s.add(r);
          }
        }

        // Start with the node that contains the sight origin
        let nodes = new Set(canvas.walls.quadtree.getLeafNodes({x: origin.x, y: origin.y, width: 0, height: 0}));
        const testedNodes = new Set();
        const nodeQueue = new Set(nodes);
        if ( unrestricted ) nodeQueue.clear();
        const rayQueue = new Set(rays);

        // Iterate until there are no nodes remaining to test
        while ( nodeQueue.size ) {
          const batch = Array.from(nodeQueue);
          for (let n of batch) {
            for (let o of n.objects) {
              const w = o.t;
              if ((w.data.door > CONST.WALL_DOOR_TYPES.NONE) && (w.data.ds === CONST.WALL_DOOR_STATES.OPEN)) continue;
              if (w.data.sense === CONST.WALL_SENSE_TYPES.NONE) continue;

              // Iterate over rays
              const rays = quadMap.get(n) || [];
              for (let r of rays) {
                if ( r._c ) continue;

                // Test collision for the ray
                if (!w.canRayIntersect(r)) continue;
                const x = WallsLayer.testWall(r, w);
                if ( this._performance ) this._performance.tests++;
                if (!x) continue;

                // Flag the collision
                r._cs = r._cs || {};
                const pt = `${Math.round(x.x)},${Math.round(x.y)}`;
                const c = r._cs[pt];
                if ( c ) {
                  c.sense = Math.min(w.data.sense, c.sense);
                  for ( let n of o.n ) c.nodes.push(n);
                }
                else {
                  x.sense = w.data.sense;
                  x.wall_id = w.data._id;
                  x.nodes = Array.from(o.n);
                  r._cs[pt] = x;
                }
              }
            }

            // Cascade outward to sibling nodes
            testedNodes.add(n);
            nodeQueue.delete(n);
            const siblings = canvas.walls.quadtree.getLeafNodes({
              x: n.bounds.x - 1,
              y: n.bounds.y - 1,
              width: n.bounds.width + 2,
              height: n.bounds.height + 2
            });
            for (let s of siblings) {
              if (!testedNodes.has(s)) nodeQueue.add(s);
            }
          }

          // After completing a tier of nodes, test each ray for completion
          for ( let r of rayQueue ) {
            if ( !r._cs ) continue;
            const c = Object.values(r._cs);
            const closest = WallsLayer.getClosestCollision(c);
            if ( closest && closest.nodes.every(n => testedNodes.has(n)) ) {
              rayQueue.delete(r);
              r._c = closest;
            }
          }
          if ( !rayQueue.size ) break;
        }

        // Construct visibility polygons
        const losPoints = [];
        const fovPoints = [];
        for ( let r of rays ) {
          r.los = r._c || { x: r.B.x, y: r.B.y, t0: 1, t1: 0};
          losPoints.push(r.los);
          r.fov = r.los.t0 <= limit ? r.los : r.project(limit);
          fovPoints.push(r.fov)
        }
        const los = new PIXI.Polygon(...losPoints);
        const fov = new PIXI.Polygon(...fovPoints);

        // Visualize vision rendering
        if ( CONFIG.debug.sightRays ) this._visualizeSight(bounds, endpoints, rays, los, fov);
        if ( CONFIG.debug.sight ) this._performance.rays = rays.length;
        // debugger;
        // Return rays and polygons
        return {rays, los, fov};
        };
        })();





        PointSource.prototype.initialize = (function(data={}) {
            return function(data={}){

    // Clean input data
    data.animation = data.animation || {type: null};
    data.angle = data.angle ?? 360;
    data.alpha = data.alpha ?? 0.5;
    data.bright = data.bright ?? 0;
    data.color = typeof data.color === "string" ? colorStringToHex(data.color) : (data.color ?? null);
    data.darknessThreshold = data.darknessThreshold ?? 0;
    data.dim = data.dim ?? 0;
    data.rotation = data.rotation ?? 0;
    data.type = data.type ?? SOURCE_TYPES.LOCAL;
    data.x = data.x ?? 0;
    data.y = data.y ?? 0;
    data.z = data.z ?? null;

    // Identify changes and assign cleaned data
    const changes = diffObject(this, data);
    mergeObject(this, data);

    // Derived data attributes
    this.colorRGB = hexToRGB(this.color);
    this.radius = Math.max(Math.abs(this.dim), Math.abs(this.bright));
    this.ratio = Math.clamped(Math.abs(this.bright) / this.radius, 0, 1);
    this.darkness = Math.min(this.dim, this.bright) < 0;
    this.limited = this.angle !== 360;
    this._animateSeed = data.seed ?? this._animateSeed ?? Math.floor(Math.random() * 100000);

    // Always update polygons for the source as the environment may have changed
    const {rays, fov, los} = SightLayer.computeSight({x: this.x, y: this.y}, this.radius, {
      angle: this.angle,
      rotation: this.rotation,
      unrestricted: this.type === SOURCE_TYPES.UNIVERSAL
    });
    this.fov = fov;
    this.los = los;
    //grapes

     // The maximum ray distance needs to reach all areas of the canvas
        let d = canvas.dimensions;
        let origin = {x: this.x, y: this.y};
        let {x, y} = origin;
        const dx = Math.max(origin.x, d.width - origin.x);
        const dy = Math.max(origin.y, d.height - origin.y);
        const distance = Math.max(this.radius, Math.hypot(dx, dy));
        const limit = this.radius / distance;
     // 
    // this.hit_walls = rays.reduce((acc, r) => {
    //                     // if (r._c != null && r._c.wall_id != null && r.los.t0 <= limit) {
    //                     if (r._c != null && r._c.wall_id != null) {

    //                          // if( inside([r.x,r.y],los)){
    //                         acc.push(r._c.wall_id);
    //                     }
    //                     return acc;
    //                 }, []).filter((v, i, a) => a.indexOf(v) === i);
    // debugger;

    //     this.hit_walls = rays.reduce((acc, r) => {
    //                     // if (r._c != null && r._c.wall_id != null && r.los.t0 <= limit) {
    //                     if (r._c != null && r._c.wall_id != null) {

    //                          // if( inside([r.x,r.y],los)){
    //                         acc.push([r._c.wall_id, (r.los.t0 <= limit)]);
    //                     }
    //                     return acc;
    //                 }, []).filter((v, i, a) => a.indexOf(v[0]) === i[0]);
    this.hit_walls = rays.reduce((acc, r) => {
                        // if (r._c != null && r._c.wall_id != null && r.los.t0 <= limit) {
                        if (r._c != null && r._c.wall_id != null) {

                             if (r.los.t0 <= limit){
                            acc.red.add(r._c.wall_id )}else{acc.no.add(r._c.wall_id )}
                        }
                        return acc;
                    }, {'red':new Set(),'no':new Set()})

    // console.log(data)
    // console.log(this.hit_walls)
    // Update shaders if the animation type changed
    const updateShaders = "animation" in changes;
    if ( updateShaders ) this._initializeShaders();

    // Initialize uniforms if the appearance of the light changed
    const uniformAttrs = ["dim", "bright", "color", "alpha", "animation"];
    if ( uniformAttrs.some(k => k in changes) ) {
      this._resetColorationUniforms = true;
      this._resetIlluminationUniforms = true;
    }

    // Initialize blend modes and sorting
    this._initializeBlending();
    return this;
 };
        })();
    }});

function inside(point, vs) {
    // ray-casting algorithm based on
    // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html/pnpoly.html
    
    var x = point[0], y = point[1];
    
    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0], yi = vs[i][1];
        var xj = vs[j][0], yj = vs[j][1];
        
        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    
    return inside;
};

Hooks.on('sightRefresh', function(data) {
    // debugger;
    if (game.scenes.viewed.getFlag('grape_juice-isometrics', 'is_isometric')) {

        if (gm_global_view === 'isometrics_Auto_Hide') {

        // for (tile of canvas.tiles.objects.children.filter(tile => tile.data.flags["grape_juice-isometrics"] && tile.data.flags["grape_juice-isometrics"].attach_wall_id != '')) {
        //         // let tile_object = canvas.tiles.get(tile)
        //         tile.alpha = 0 //tile.getFlag('grape_juice-isometrics', 'tile_alpha');
        //     }
          try{
            // debugger;
            for (bb of data.sources) {

                iso_magic_token_view({
                    x: bb.x,
                    y: bb.y
                }, bb.hit_walls)
            }

            for (tile in overlay_tiles) {
                hide_overlay_tile(tile)
                let tile_object = canvas.tiles.get(tile)
                // overlay_tiles[tile].visible = false;
                // canvas.tiles.get(tile).visible = false;
                if (under_tile.indexOf(tile) !== -1) {
                    try {
                        tile_object.alpha = tile_object.getFlag('grape_juice-isometrics', 'tile_alpha'); // 0.5; //todo bug
                    } catch {
                        tile_object.alpha = 0
                    }

                } else {
                    tile_object.alpha = 0
                }


            }
            // canvas.sight.fog.unexplored.children=[]

       
            for (tile of add_tile) {
                tile.visible = true;
                tile.alpha = 1;

                show_overlay_tile(tile)
            }
          }catch{}
        } else {
          let all_tiles_for =   canvas.tiles.objects.children.filter(tile => tile.data.flags["grape_juice-isometrics"] && tile.data.flags["grape_juice-isometrics"].attach_wall_id != '').reduce((a, x) => ([
                ...a,
                 x.data._id
            ]), [])

            for (tile of all_tiles_for) {
                let tile_object = canvas.tiles.get(tile)
                hide_overlay_tile(tile)
                show_overlay_tile(tile_object)
                if (gm_global_view === 'isometrics_Always_Show') {
                    tile_object.alpha = 1
                } else if (gm_global_view === 'isometrics_Always_Show_50') {
                    tile_object.alpha = 0.5
                } else if (gm_global_view === 'isometrics_Always_Hide') {
                    tile_object.alpha = 0

                }
            }
        }



        add_tile = [];
        under_tile = []
    // update_mask_filter()
}
});

the_sprite=''
function show_overlay_tile(tile) {

                        let sprite = 0;
            if (tile.data._id in overlay_tiles){

            // canvas.sight.msk.addChild(sprite)
                 sprite = overlay_tiles[tile.data._id]

            }
            else{
            
                        let img_tile = tile.children[1]
                        // let sprite = new PIXI.Sprite(PIXI.Texture.from(img_tile.img.texture.baseTexture.resource.url))
                        sprite = new PIXI.Sprite.fromImage(img_tile.img.texture.baseTexture.resource.url)
                        the_sprite=sprite
                        sprite.tint = 0xffffff
                        sprite.isSprite = true
                        // sprite.width = img_tile.img.width
                        // sprite.height = img_tile.img.height
                        sprite.width = tile.data.width
                        sprite.height = tile.data.height
                        sprite.position = tile.position
                        sprite.position.x += img_tile.img.x 
                        sprite.position.y += img_tile.img.y 
                        sprite.anchor = img_tile.img.anchor
            
                        sprite.angle = img_tile.img.angle
                        overlay_tiles[tile.data._id] = sprite
            
                        // sprite.blendMode=26
                        sprite.blendMode=26
            }
                        canvas.sight.fog.addChild(sprite) //this
                        // canvas.sight.addChild(sprite) //this

            // canvas.sight.fog.unexplored.addChild(sprite)
            // canvas.sight.fog.unexplored.addChild(sprite)
            // canvas.sight.fog.explored.addChild(sprite)
            // canvas.sight.fog.current.addChild(sprite)
// 
            // canvas.sight.fog.filters.push(new PIXI.SpriteMaskFilter(sprite))
            // canvas.sight.filter=[new PIXI.SpriteMaskFilter(sprite)]
            // canvas.sight.los.filter+=new PIXI.SpriteMaskFilter(sprite);
        }

        function hide_overlay_tile(tile_id) {
            let sprite = overlay_tiles[tile_id]
            // canvas.sight.removeChild(sprite)
            canvas.sight.fog.removeChild(sprite)

            // sprite.tint = 0xffffff
            // sprite.texture = PIXI.Texture.WHITE;
            // canvas.sight.fog.removeChild(sprite)
        }





//tile
Hooks.on('preCreateTile', (a, b, c, d, e) => {
    // debugger;

    if(((!b.flags) || (b.flags["grape_juice-isometrics"] === undefined)) && !('hidden' in b))
{
    // console.error('in if')
    let sprite = new PIXI.Sprite()
    sprite.width = b.width
    sprite.height = b.height

    sprite.x = b.x
    sprite.y = b.y

    canvas.tiles.addChild(sprite)


    m = getWorldTransformPIXIMatrix()

    sprite.transform.setFromMatrix(m)

    // m.a = world.a
    // m.b = world.b
    // m.c = world.c
    // m.d = world.d
    // m.tx = world.e
    // m.ty = world.f
    // b.transform.setFromMatrix(m)

    b.height *= sprite.height * canvas.stage.scale.y
    b.width *= sprite.width * canvas.stage.scale.x
    b.rotation = (sprite.rotation / (Math.PI / 180))
    // b.x = sprite.x
    // b.y = sprite.y
    canvas.tiles.removeChild(sprite)
}
else{
    delete(b.flags["grape_juice-isometrics"]) 
    // console.error('in else')

}

})


Hooks.on('hoverTile', (a, b, c, d, e) => {
    if (game.scenes.viewed.getFlag('grape_juice-isometrics', 'is_isometric')) {

    Hooks.call('sightRefresh')
}
})

Hooks.on('updateTile', async (a, b, c, d, e) => {
    // debugger;

    // tile.alpha = tile.getFlag('grape_juice-isometrics', 'tile_alpha');
await                 canvas.sight.refresh()

});// tokens

var slow_count = 0
var slow_count_upper = 0
var slow_sign = 1
Hooks.on('canvasInit_no_thanks', (a, b, c, d, e) => {
	canvas.app.ticker.add((delta) => {
		// rotate the container!
		// use delta to create frame-independent transform
		slow_count++
		if (slow_count > 0) {
			slow_count = 0
			slow_count_upper++;
			if (slow_count_upper > 100) {
				slow_count_upper = 0
				slow_sign *= -1
			}

			flyer(slow_sign)
		}
	});

})

function flyer(slow_sign) {
	for (tok of canvas.tokens.placeables) {
		if (tok.data.elevation > 0) {
			let {
				x,
				y
			} = tok.icon.anchor
			rand_ele = 0.002 * slow_sign
			y + rand_ele
			tok.icon.anchor.set(x, y + rand_ele)
			// } else {
			// 	// tok.icon.scale.y += 0.00005* slow_sign
			// 	// tok.icon.scale.x -= 0.00005* slow_sign
			// 	let {
			// 		x,
			// 		y
			// 	} = tok.icon.skew

			// 	tok.icon.skew.set(x + (0.0005 * slow_sign), y)

			// }
		}
	}
}

function selectedflyer(slow_sign) {
	for (tok of canvas.tokens.controlled) {
		if (tok.data.elevation > 0) {
			let {
				x,
				y
			} = tok.icon.anchor
			rand_ele = 0.002 * slow_sign
			y + rand_ele
			tok.icon.anchor.set(x, y + rand_ele)
		} else {
			// tok.icon.scale.y += 0.00005* slow_sign
			// tok.icon.scale.x -= 0.00005* slow_sign
			let {
				x,
				y
			} = tok.icon.skew

			tok.icon.skew.set(x + (0.0005 * slow_sign), y)

		}
	}
}


Hooks.on('createToken', (aaa, b, c, d, e) => {
	a = canvas.tokens.get(b._id);
	token_isometric_fixup(a)

})

Hooks.on('targetToken',async (a, b, c, d, e) => {
	// a = canvas.tokens.get(b.data._id);
	await new Promise(r => setTimeout(r, 1));
	token_isometric_fixup(b)
})

Hooks.on('hoverToken', (a, b, c, d, e) => {
	token_isometric_fixup(a)
})

Hooks.on('controlToken', (a, b, c, d, e) => {
	token_isometric_fixup(a)
})

Hooks.on('renderSceneControls', (abla, b, c, d, e) => {
	try {
		for (a of canvas.tokens.objects.children) {
			token_isometric_fixup(a)
		}
	} catch {}
})

Hooks.on('updateToken', (abla, b, c, d, e) => {
	a = canvas.tokens.get(b._id);
	token_isometric_fixup(a)
// generate_mask_filer_old()
	
})

lighted_walls = []

Hooks.on('sightRefresh', (abla, b, c, d, e) => {
	for (a of canvas.tokens.objects.children) {
		token_isometric_fixup(a)
	}
})


Hooks.on('lightingRefresh', (abla, b, c, d, e) => {
	// debugger;
	// lighted_walls = abla.sources.reduce((acc,s) => {if (s.active){acc = acc.concat(s.hit_walls)};return acc},[]).filter((v, i, a) => a.indexOf(v) === i);
	try{
		lighted_walls = abla.sources.reduce((acc,s) => {if (s.active){acc = acc.concat([...s.hit_walls.red])};return acc},[]).filter((v, i, a) => a.indexOf(v) === i);
	}catch{}

})

function token_isometric_fixup(token) {
	if (game.scenes.viewed.getFlag('grape_juice-isometrics', 'is_isometric')) {
		try {
			token.icon.rotation = (45 * (Math.PI / 180));
			// token.icon.scale.y = 2 * token.icon.scale.x;
    		// token.icon.scale.x = Math.abs(token.icon.scale.x) * (token.data.mirrorX ? -1 : 1);

			token.icon.scale.y = 1.73 * token.icon.scale.x * (token.data.mirrorY ? -1 : 1)* (token.data.mirrorX ? -1 : 1);
			token.icon.anchor.set(0.5, 0.7071 * ((token.data.elevation / 5) / token.data.height / token.data.scale + 1)); // *token.data.elevation/((canvas.grid.size / 100 )+1))
		} catch {}
	}
}


// I NEED TO KEEP ALL WALLS LIT, WITH THE HOOK IN LIGHT, IN TOKEN MAGIC IT WILL HIDE UNLESS IT IS IN LITE

// all lit walls, test if are in hitted, regardless of radius.
// if hitted, keep them.


function iso_magic_token_view(a, hit_walls) {

	aa = new PIXI.Sprite
	canvas.stage.addChild(aa)
	aa.x = a.x
	aa.y = a.y
	var {
		x = x, y = y
	} = aa.toGlobal(new PIXI.Point()) // wall

	canvas.stage.removeChild(aa)


	x -= canvas.app.stage.localTransform.tx
	y -= canvas.app.stage.localTransform.ty
	// debugger;


	for (wall in attach_wall) {
		try {
			var [x1, y1, x2, y2] = wall_position(canvas.walls.get(wall).coords)

			if (x1 == x2) {
				console.log('private case')
				return
			}
			var slope = (y2 - y1) / (x2 - x1) //slop

			// console.log('y:' + y, 'liney:' + line_y)
			let tile = canvas.tiles.get(attach_wall[wall])
			// debugger;
			if (hit_walls.red.has(wall) || (lighted_walls.includes(wall) && hit_walls.no.has(wall))) {
			// if (( lighted_walls.includes(wall))) {

				if (((y - y1) > slope * (x - x1))) {
					// tile.visible = true

					// show_overlay_tile(tile)
					add_tile.push(tile)
					console.log('over me')
				} else {
					under_tile.push(tile.data._id)
					console.log('under me and hit')

				}
			} else {
				// tile.visible = false
				// hide_overlay_tile(tile)

				console.log('under me')

			}
		} catch {}
	}
}



//remove shader on controlled token
// Hooks.on('controlToken', (a,b)=> {if (b){a.icon.filters=[]}else{a.icon.filters=[mask_filter]}})//walls

Hooks.on('updateWall', async (_, wall) => {


    if (game.user.isGM) {
        let tile = canvas.tiles.get(door_hooks[wall._id])
        if (tile != null) {
            await tile.update({
                'hidden': wall.ds == 1
            })
        }
    }
    // debugger;
})


// updateTile


function wall_position(coo) {
    var tx = canvas.app.stage.localTransform.tx
    var ty = canvas.app.stage.localTransform.ty
    var [x1, y1, x2, y2] = coo
    var ret = [0, 0, 0, 0]
    aa = new PIXI.Sprite
    canvas.stage.addChild(aa)
    aa.x = x1
    aa.y = y1
    var {
        x = x, y = y
    } = aa.toGlobal(new PIXI.Point()) // wall
    ret[0] = x - tx
    ret[1] = y - ty

    aa.x = x2
    aa.y = y2
    var {
        x = x, y = y
    } = aa.toGlobal(new PIXI.Point()) // wall
    ret[2] = x - tx
    ret[3] = y - ty

    canvas.stage.removeChild(aa)

    return ret;
}




/*
  _____
 / ____|                      
 | (___   ___  _ __ _ __ _   _ 
  \___ \ / _ \| '__| '__| | | |
  ____) | (_) | |  | |  | |_| |
 |_____/ \___/|_|  |_|   \__, |
                          __/ |
                         |___/ 
for the shitty code :(
*/

console.log(`%c🍇%c
     ██████╗ ██████╗  █████╗ ██████╗ ███████╗             ██╗██╗   ██╗██╗ ██████╗███████╗
    ██╔════╝ ██╔══██╗██╔══██╗██╔══██╗██╔════╝             ██║██║   ██║██║██╔════╝██╔════╝
    ██║  ███╗██████╔╝███████║██████╔╝█████╗               ██║██║   ██║██║██║     █████╗  
    ██║   ██║██╔══██╗██╔══██║██╔═══╝ ██╔══╝          ██   ██║██║   ██║██║██║     ██╔══╝  
    ╚██████╔╝██║  ██║██║  ██║██║     ███████╗███████╗╚█████╔╝╚██████╔╝██║╚██████╗███████╗
     ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚══════╝╚══════╝ ╚════╝  ╚═════╝ ╚═╝ ╚═════╝╚══════╝
`,"font-size: 102px;","color: purple;");
// console.log(String.raw`%c
//                   ___           ___           ___           ___                       ___                       ___     
//     ___          /  /\         /  /\         /__/\         /  /\          ___        /  /\        ___          /  /\    
//    /  /\        /  /:/_       /  /::\       |  |::\       /  /:/_        /  /\      /  /::\      /  /\        /  /:/    
//   /  /:/       /  /:/ /\     /  /:/\:\      |  |:|:\     /  /:/ /\      /  /:/     /  /:/\:\    /  /:/       /  /:/     
//  /__/::\      /  /:/ /::\   /  /:/  \:\   __|__|:|\:\   /  /:/ /:/_    /  /:/     /  /:/~/:/   /__/::\      /  /:/  ___ 
//  \__\/\:\__  /__/:/ /:/\:\ /__/:/ \__\:\ /__/::::| \:\ /__/:/ /:/ /\  /  /::\    /__/:/ /:/___ \__\/\:\__  /__/:/  /  /\
//     \  \:\/\ \  \:\/:/~/:/ \  \:\ /  /:/ \  \:\~~\__\/ \  \:\/:/ /:/ /__/:/\:\   \  \:\/:::::/    \  \:\/\ \  \:\ /  /:/
//      \__\::/  \  \::/ /:/   \  \:\  /:/   \  \:\        \  \::/ /:/  \__\/  \:\   \  \::/~~~~      \__\::/  \  \:\  /:/ 
//      /__/:/    \__\/ /:/     \  \:\/:/     \  \:\        \  \:\/:/        \  \:\   \  \:\          /__/:/    \  \:\/:/  
//      \__\/       /__/:/       \  \::/       \  \:\        \  \::/          \__\/    \  \:\         \__\/      \  \::/   
//                  \__\/         \__\/         \__\/         \__\/                     \__\/                     \__\/    
// `);
console.log(String.raw`%c🍇Isometric🍇%c

    ` ,'font-size: 72px; color: #b87ee8; font-family: "Arial Black", Gadget, sans-serif; text-shadow: 0px 0px 0 rgb(179,121,227),1px 1px 0 rgb(174,116,222),2px 2px 0 rgb(169,111,217),3px 3px 0 rgb(164,106,212),4px 4px 0 rgb(159,101,207),5px 5px 0 rgb(154,96,202),6px 6px 0 rgb(149,91,197),7px 7px 0 rgb(144,86,192),8px 8px 0 rgb(139,81,187),9px 9px 0 rgb(133,75,181),10px 10px 0 rgb(128,70,176),11px 11px 0 rgb(123,65,171),12px 12px 0 rgb(118,60,166),13px 13px 0 rgb(113,55,161),14px 14px 0 rgb(108,50,156),15px 15px 0 rgb(103,45,151),16px 16px 0 rgb(98,40,146),17px 17px 0 rgb(93,35,141),18px 18px  0 rgb(88,30,136),19px 19px 18px rgba(0,0,0,0.6),19px 19px 1px rgba(0,0,0,0.5),0px 0px 18px rgba(0,0,0,.2);',"");
 

door_hooks = {}
attach_wall = {}
overlay_tiles = {}
add_tile = []
under_tile= []

gm_global_view = "isometrics_Auto_Hide";

// Hooks.on('canvasInit', function() {
//     door_hooks = {}
//     attach_wall = {}
//     overlay_tiles = {}
//     add_tile = []
//     under_tile= []
//     // canvas.dimensions.height*=2
//     // canvas.dimensions.width*=2
// // canvas.dimensions.shiftY=0
//     if (game.scenes.viewed.getFlag('grape_juice-isometrics', 'is_isometric')) {
//         canvas.dimensions.sceneRect.y=0
//         canvas.dimensions.sceneRect.x=0

//         canvas.dimensions.sceneRect.height*=2
//         canvas.dimensions.sceneRect.width*=2

//         canvas.dimensions.height*=2
//         canvas.dimensions.width*=2
//         canvas.dimensions.rect.height*=2
//         canvas.dimensions.rect.width*=2

//         canvas.dimensions.sceneHeight*=2
//         canvas.dimensions.sceneWidth*=2

//     }
// })


width_scale = 1;
height_scale = 1;

Hooks.on('canvasInit', function() {
    door_hooks = {}
    attach_wall = {}
    overlay_tiles = {}
    add_tile = []
    under_tile= []
    // canvas.dimensions.height*=2
    // canvas.dimensions.width*=2
// canvas.dimensions.shiftY=0
    if (game.scenes.viewed.getFlag('grape_juice-isometrics', 'is_isometric')) {
        canvas.dimensions.sceneRect.y=0
        canvas.dimensions.sceneRect.x=0
            let srh = canvas.dimensions.sceneRect.height;
            let srw = canvas.dimensions.sceneRect.width;
            let hyp = Math.sqrt((srh*srh) + (srw*srw));
            height_scale = hyp / srh;
            width_scale = hyp / srw;
            height_scale =  height_scale * 1.1
            width_scale = width_scale * 1.1
        canvas.dimensions.sceneRect.height*=height_scale;
        canvas.dimensions.sceneRect.width*=width_scale;

        canvas.dimensions.height*=height_scale;
        canvas.dimensions.width*=width_scale;

        canvas.dimensions.rect.height*=height_scale;
        canvas.dimensions.rect.width*=width_scale;

        canvas.dimensions.sceneHeight*=height_scale;
        canvas.dimensions.sceneWidth*=width_scale;






    }
})

Hooks.on('renderGridConfig',  function() {

            // m = getWorldTransformPIXIMatrix() 
        // // m.tx = 0
        // // m.ty = 0
        // m = getWorldTransformPIXIMatrix() 
        // canvas.pan({x:canvas.dimensions.width/2,y:canvas.dimensions.height/2})
        // canvas.layers[1].img.transform.setFromMatrix(m)
        // canvas.background.img.x+=canvas.scene.data.shiftX
        // canvas.background.img.y+=canvas.scene.data.shiftY
})

Hooks.on('canvasReady', async function() {

    if (game.scenes.viewed.getFlag('grape_juice-isometrics', 'is_isometric')) {
        saved_pan_x = canvas.stage.pivot.x
        saved_pan_y = canvas.stage.pivot.y
        saved_pan_zoom = canvas.stage.scale.x
        console.error(saved_pan_x,saved_pan_y,saved_pan_zoom)
        

        // canvas.scene.data.shiftY=0; 
        // canvas.draw(canvas.scene)


        canvas.app.stage.scale.x = 1;
        canvas.app.stage.scale.y = 1;

        // canvas.layers[0].img.x=0
        // canvas.layers[0].img.y=0
        canvas.pan({x:canvas.dimensions.width/2,y:canvas.dimensions.height/2})


        canvas.app.stage.skew.set((30 * (Math.PI / 180)), 0);
        canvas.app.stage.rotation = (-30 * (Math.PI / 180));

        canvas.pan({x:canvas.dimensions.width/2,y:canvas.dimensions.height/2})





        if (canvas.stage.children[1].iso_layer === true) {
            await canvas.app.stage.removeChild(canvas.stage.children[1]);
        }
        // if (canvas.layers[1].iso_layer === true) {
        //     await canvas.app.stage.removeChild(canvas.layers[1]);
        // }

        var my_bg_layer = new BackgroundLayer()
        my_bg_layer.iso_layer = true;

        // await canvas.app.stage.removeChild(canvas.layers[0]);
        canvas.stage.addChildAt(my_bg_layer, 1);

        // await canvas.app.stage.addChild(my_bg_layer);
        // canvas.app.stage.children = await array_move(canvas.app.stage.children, 13, 1);

        canvas.stage.children[0].visible = false;
        // canvas.layers[0].visible = false;
        // canvas.layers[0].img.anchor.set(0.5,0.5)

        // m.tx = canvas.layers[0].img.transform.worldTransform.tx
        // m.ty = canvas.layers[0].img.transform.worldTransform.ty
        // canvas.layers[0].img.transform.setFromMatrix(m)


        await my_bg_layer.draw()
        if (my_bg_layer.img){
            await my_bg_layer.img.anchor.set(0.5,0.5)
        }

        m = await getWorldTransformPIXIMatrix() 
                m.tx = 0

        m.ty = 0
    // console.error(my_bg_layer.img.x)
    // console.error(my_bg_layer.img.y)
    // console.error(m)
    // console.error(my_bg_layer.img.transform)

        // my_bg_layer.img.transform.setFromMatrix(m)
        await my_bg_layer.transform.setFromMatrix(m)

        if (my_bg_layer.img){

                    canvas.background.img = await my_bg_layer.img
                    // canvas.layers[1].img= canvas.background.img 
                // console.error(m)
                // console.error(canvas.layers[1].img.transform)
                    canvas.background.img.width/=await width_scale
                    
                    canvas.background.img.height/=await height_scale
            }

        
        await canvas.pan({x: saved_pan_x,y: saved_pan_y,scale: saved_pan_zoom})



            // console.error(canvas.layers[1].img.x)
    // console.error(canvas.layers[1].img.y)
        // canvas.layers[1].img.x+=canvas.scene.data.shiftX
        // canvas.layers[1].img.y+=canvas.scene.data.shiftY
    // console.error(canvas.layers[1].img.x)
    // console.error(canvas.layers[1].img.y)
        // canvas.background.img.transform.setFromMatrix(m)

        // canvas.layers[1].img.anchor.x=0.5
        // canvas.layers[1].img.anchor.y=0.5
        // canvas.layers[1].img.anchor.x=-0.25
        // canvas.layers[1].img.anchor.y=0.75


        // canvas.layers[1].img.anchor.set(canvas.layers[1].width.img/2,canvas.layers[1].height.img/2)
        // m.tx = canvas.layers[1].transform.worldTransform.tx
        // m.ty = canvas.layers[1].transform.worldTransform.ty
        // canvas.layers[1].img.anchor.set(0.5,0.5)

        // canvas.layers[1].transform.setFromMatrix(m)

        // canvas.layers[1].x=0
        // canvas.layers[1].y=0
        // canvas.layers[1].x=canvas.layers[0].img.x*4
        // canvas.layers[1].y=canvas.layers[0].img.y*-2
        // canvas.layers[1].x = canvas.layers[0].img.width
        // canvas.layers[1].y = canvas.layers[0].img.height / -2

        // var world = getWorldTransformMatrix()
        // aa = world.inverse().applyToPoint(0, 0)
        // canvas.layers[1].img.x-=aa.x
        // canvas.layers[1].img.y-=aa.y


        // var world = getWorldTransformMatrix()
        // aa = world.inverse().applyToPoint(canvas.layers[1].img.x, canvas.layers[1].img.y)
        // canvas.layers[1].img.x-=aa.x
        // canvas.layers[1].img.y-=aa.y


        // x = (world.inverse().applyToPoint(canvas.layers[1].x, canvas.layers[1].y).x);
        // y = (world.inverse().applyToPoint(canvas.layers[1].x, canvas.layers[1].y).y);
        // canvas.layers[1].y-= y
        // canvas.layers[1].x= x

        // canvas.background.img = canvas.layers[1].img

        // canvas.layers[1].visible=false;

        // canvas.layers[1].img = canvas.layers[0]
        // canvas.layers[0].transform.setFromMatrix(m)
        // canvas.layers[8].transform.setFromMatrix(m)
        // canvas.layers[9].transform.setFromMatrix(m)


 
    } else {

        if (canvas.stage.children[1].iso_layer === true) {
        // if (canvas.layers[1].iso_layer === true) {

            await canvas.app.stage.removeChild(canvas.stage.children[1]);
            // await canvas.app.stage.removeChild(canvas.layers[1]);
            canvas.stage.children[0].visible = true;
            // canvas.layers[0].visible = true;
            canvas.app.stage.skew.set((0 * (Math.PI / 180)), 0);
            canvas.app.stage.rotation = (0 * (Math.PI / 180));

        }
    }



           door_hooks = canvas.tiles.objects.children.filter(tile => tile.data.flags["grape_juice-isometrics"] && tile.data.flags["grape_juice-isometrics"].hook_door_id != '').reduce((a, x) => ({
            ...a,
            [x.data.flags["grape_juice-isometrics"].hook_door_id]: x.data._id
        }), {})
           all_iso_tiles = canvas.tiles.objects.children.filter(tile => tile.data.flags["grape_juice-isometrics"] && tile.data.flags["grape_juice-isometrics"].attach_wall_id != '')
        _attach_wall = all_iso_tiles.reduce((a, x) => ({
            ...a,
            [x.data.flags["grape_juice-isometrics"].attach_wall_id]: x.data._id
        }), {})


        for (key in _attach_wall) {
            for (id of key.split(',')) {
                attach_wall[id] = _attach_wall[key];
            }
        }

        // let all_tiles_for =   canvas.tiles.objects.children.filter(tile => tile.data.flags["grape_juice-isometrics"] && tile.data.flags["grape_juice-isometrics"].attach_wall_id != '').reduce((a, x) => ([
        //         ...a,
        //          x.data._id
        //     ]), [])

        //     for (tile of all_tiles_for) {
        //         let tile_object = canvas.tiles.get(tile)
        //         show_overlay_tile(tile_object)
        //         hide_overlay_tile(tile)
                
        //     }





   let all_tiles_for =   canvas.tiles.objects.children.filter(tile => tile.data.flags["grape_juice-isometrics"] && tile.data.flags["grape_juice-isometrics"].attach_wall_id != '').reduce((a, x) => ([
                ...a,
                 x.data._id
            ]), [])
            for (tile of all_tiles_for) {
                let tile_object = canvas.tiles.get(tile)
                show_overlay_tile(tile_object)
                hide_overlay_tile(tile)


            }

    for (tile of canvas.tiles.objects.children.filter(tile => tile.data.flags["grape_juice-isometrics"] && tile.data.flags["grape_juice-isometrics"].attach_wall_id != '')) {
                // let tile_object = canvas.tiles.get(tile)
                tile.visible=true;
                tile.alpha = tile.getFlag('grape_juice-isometrics', 'tile_alpha');
            }


             await canvas.lighting.refresh()

             await canvas.sight.refresh()

});


Hooks.once('ready',  async function() {
         
                        // await canvas.lighting.refresh()

           door_hooks = canvas.tiles.objects.children.filter(tile => tile.data.flags["grape_juice-isometrics"] && tile.data.flags["grape_juice-isometrics"].hook_door_id != '').reduce((a, x) => ({
            ...a,
            [x.data.flags["grape_juice-isometrics"].hook_door_id]: x.data._id
        }), {})
           all_iso_tiles = canvas.tiles.objects.children.filter(tile => tile.data.flags["grape_juice-isometrics"] && tile.data.flags["grape_juice-isometrics"].attach_wall_id != '')
        _attach_wall = all_iso_tiles.reduce((a, x) => ({
            ...a,
            [x.data.flags["grape_juice-isometrics"].attach_wall_id]: x.data._id
        }), {})


        for (key in _attach_wall) {
            for (id of key.split(',')) {
                attach_wall[id] = _attach_wall[key];
            }
        }



   let all_tiles_for =   canvas.tiles.objects.children.filter(tile => tile.data.flags["grape_juice-isometrics"] && tile.data.flags["grape_juice-isometrics"].attach_wall_id != '').reduce((a, x) => ([
                ...a,
                 x.data._id
            ]), [])
            for (tile of all_tiles_for) {
                let tile_object = canvas.tiles.get(tile)
                show_overlay_tile(tile_object)
                hide_overlay_tile(tile)


            }

    for (tile of canvas.tiles.objects.children.filter(tile => tile.data.flags["grape_juice-isometrics"] && tile.data.flags["grape_juice-isometrics"].attach_wall_id != '')) {
                // let tile_object = canvas.tiles.get(tile)
                tile.visible=true;
                tile.alpha = tile.getFlag('grape_juice-isometrics', 'tile_alpha');
            }


             await canvas.lighting.refresh()

             await canvas.sight.refresh()

        });
//matrix.js
/*!
    2D Transformation Matrix v2.0

    (c) Epistemex 2014-2015
    www.epistemex.com
    By Ken Nilsen
    Contributions by leeoniya.
    License: MIT, header required.
*/

/**
 * 2D transformation matrix object initialized with identity matrix.
 *
 * The matrix can synchronize a canvas context by supplying the context
 * as an argument, or later apply current absolute transform to an
 * existing context.
 *
 * All values are handled as floating point values.
 *
 * @param {CanvasRenderingContext2D} [context] - Optional context to sync with Matrix
 * @prop {number} a - scale x
 * @prop {number} b - shear y
 * @prop {number} c - shear x
 * @prop {number} d - scale y
 * @prop {number} e - translate x
 * @prop {number} f - translate y
 * @prop {CanvasRenderingContext2D|null} [context=null] - set or get current canvas context
 * @constructor
 */
function Matrix(context) {

	var me = this;
	me._t = me.transform;

	me.a = me.d = 1;
	me.b = me.c = me.e = me.f = 0;

	me.context = context;

	// reset canvas transformations (if any) to enable 100% sync.
	if (context) context.setTransform(1, 0, 0, 1, 0, 0);
}

Matrix.prototype = {

	/**
	 * Concatenates transforms of this matrix onto the given child matrix and
	 * returns a new matrix. This instance is used on left side.
	 *
	 * @param {Matrix} cm - child matrix to apply concatenation to
	 * @returns {Matrix}
	 */
	concat: function(cm) {
		return this.clone()._t(cm.a, cm.b, cm.c, cm.d, cm.e, cm.f);
	},

	/**
	 * Flips the horizontal values.
	 */
	flipX: function() {
		return this._t(-1, 0, 0, 1, 0, 0);
	},

	/**
	 * Flips the vertical values.
	 */
	flipY: function() {
		return this._t(1, 0, 0, -1, 0, 0);
	},

	/**
	 * Reflects incoming (velocity) vector on the normal which will be the
	 * current transformed x axis. Call when a trigger condition is met.
	 *
	 * NOTE: BETA, simple implementation
	 *
	 * @param {number} x - vector end point for x (start = 0)
	 * @param {number} y - vector end point for y (start = 0)
	 * @returns {{x: number, y: number}}
	 */
	reflectVector: function(x, y) {

		var v = this.applyToPoint(0, 1),
			d = 2 * (v.x * x + v.y * y);

		x -= d * v.x;
		y -= d * v.y;

		return {
			x: x,
			y: y
		};
	},

	/**
	 * Short-hand to reset current matrix to an identity matrix.
	 */
	reset: function() {
		return this.setTransform(1, 0, 0, 1, 0, 0);
	},

	/**
	 * Rotates current matrix accumulative by angle.
	 * @param {number} angle - angle in radians
	 */
	rotate: function(angle) {
		var cos = Math.cos(angle),
			sin = Math.sin(angle);
		return this._t(cos, sin, -sin, cos, 0, 0);
	},

	/**
	 * Converts a vector given as x and y to angle, and
	 * rotates (accumulative).
	 * @param x
	 * @param y
	 * @returns {*}
	 */
	rotateFromVector: function(x, y) {
		return this.rotate(Math.atan2(y, x));
	},

	/**
	 * Helper method to make a rotation based on an angle in degrees.
	 * @param {number} angle - angle in degrees
	 */
	rotateDeg: function(angle) {
		return this.rotate(angle * Math.PI / 180);
	},

	/**
	 * Scales current matrix uniformly and accumulative.
	 * @param {number} f - scale factor for both x and y (1 does nothing)
	 */
	scaleU: function(f) {
		return this._t(f, 0, 0, f, 0, 0);
	},

	/**
	 * Scales current matrix accumulative.
	 * @param {number} sx - scale factor x (1 does nothing)
	 * @param {number} sy - scale factor y (1 does nothing)
	 */
	scale: function(sx, sy) {
		return this._t(sx, 0, 0, sy, 0, 0);
	},

	/**
	 * Scales current matrix on x axis accumulative.
	 * @param {number} sx - scale factor x (1 does nothing)
	 */
	scaleX: function(sx) {
		return this._t(sx, 0, 0, 1, 0, 0);
	},

	/**
	 * Scales current matrix on y axis accumulative.
	 * @param {number} sy - scale factor y (1 does nothing)
	 */
	scaleY: function(sy) {
		return this._t(1, 0, 0, sy, 0, 0);
	},

	/**
	 * Apply shear to the current matrix accumulative.
	 * @param {number} sx - amount of shear for x
	 * @param {number} sy - amount of shear for y
	 */
	shear: function(sx, sy) {
		return this._t(1, sy, sx, 1, 0, 0);
	},

	/**
	 * Apply shear for x to the current matrix accumulative.
	 * @param {number} sx - amount of shear for x
	 */
	shearX: function(sx) {
		return this._t(1, 0, sx, 1, 0, 0);
	},

	/**
	 * Apply shear for y to the current matrix accumulative.
	 * @param {number} sy - amount of shear for y
	 */
	shearY: function(sy) {
		return this._t(1, sy, 0, 1, 0, 0);
	},

	/**
	 * Apply skew to the current matrix accumulative.
	 * @param {number} ax - angle of skew for x
	 * @param {number} ay - angle of skew for y
	 */
	skew: function(ax, ay) {
		return this.shear(Math.tan(ax), Math.tan(ay));
	},

	/**
	 * Apply skew for x to the current matrix accumulative.
	 * @param {number} ax - angle of skew for x
	 */
	skewX: function(ax) {
		return this.shearX(Math.tan(ax));
	},

	/**
	 * Apply skew for y to the current matrix accumulative.
	 * @param {number} ay - angle of skew for y
	 */
	skewY: function(ay) {
		return this.shearY(Math.tan(ay));
	},

	/**
	 * Set current matrix to new absolute matrix.
	 * @param {number} a - scale x
	 * @param {number} b - shear y
	 * @param {number} c - shear x
	 * @param {number} d - scale y
	 * @param {number} e - translate x
	 * @param {number} f - translate y
	 */
	setTransform: function(a, b, c, d, e, f) {
		var me = this;
		me.a = a;
		me.b = b;
		me.c = c;
		me.d = d;
		me.e = e;
		me.f = f;
		return me._x();
	},

	/**
	 * Translate current matrix accumulative.
	 * @param {number} tx - translation for x
	 * @param {number} ty - translation for y
	 */
	translate: function(tx, ty) {
		return this._t(1, 0, 0, 1, tx, ty);
	},

	/**
	 * Translate current matrix on x axis accumulative.
	 * @param {number} tx - translation for x
	 */
	translateX: function(tx) {
		return this._t(1, 0, 0, 1, tx, 0);
	},

	/**
	 * Translate current matrix on y axis accumulative.
	 * @param {number} ty - translation for y
	 */
	translateY: function(ty) {
		return this._t(1, 0, 0, 1, 0, ty);
	},

	/**
	 * Multiplies current matrix with new matrix values.
	 * @param {number} a2 - scale x
	 * @param {number} b2 - shear y
	 * @param {number} c2 - shear x
	 * @param {number} d2 - scale y
	 * @param {number} e2 - translate x
	 * @param {number} f2 - translate y
	 */
	transform: function(a2, b2, c2, d2, e2, f2) {

		var me = this,
			a1 = me.a,
			b1 = me.b,
			c1 = me.c,
			d1 = me.d,
			e1 = me.e,
			f1 = me.f;

		/* matrix order (canvas compatible):
		 * ace
		 * bdf
		 * 001
		 */
		me.a = a1 * a2 + c1 * b2;
		me.b = b1 * a2 + d1 * b2;
		me.c = a1 * c2 + c1 * d2;
		me.d = b1 * c2 + d1 * d2;
		me.e = a1 * e2 + c1 * f2 + e1;
		me.f = b1 * e2 + d1 * f2 + f1;

		return me._x();
	},

	/**
	 * Divide this matrix on input matrix which must be invertible.
	 * @param {Matrix} m - matrix to divide on (divisor)
	 * @returns {Matrix}
	 */
	divide: function(m) {

		if (!m.isInvertible())
			throw "Input matrix is not invertible";

		var im = m.inverse();

		return this._t(im.a, im.b, im.c, im.d, im.e, im.f);
	},

	/**
	 * Divide current matrix on scalar value != 0.
	 * @param {number} d - divisor (can not be 0)
	 * @returns {Matrix}
	 */
	divideScalar: function(d) {

		var me = this;
		me.a /= d;
		me.b /= d;
		me.c /= d;
		me.d /= d;
		me.e /= d;
		me.f /= d;

		return me._x();
	},

	/**
	 * Get an inverse matrix of current matrix. The method returns a new
	 * matrix with values you need to use to get to an identity matrix.
	 * Context from parent matrix is not applied to the returned matrix.
	 * @returns {Matrix}
	 */
	inverse: function() {

		if (this.isIdentity()) {
			return new Matrix();
		} else if (!this.isInvertible()) {
			throw "Matrix is not invertible.";
		} else {
			var me = this,
				a = me.a,
				b = me.b,
				c = me.c,
				d = me.d,
				e = me.e,
				f = me.f,

				m = new Matrix(),
				dt = a * d - b * c; // determinant(), skip DRY here...

			m.a = d / dt;
			m.b = -b / dt;
			m.c = -c / dt;
			m.d = a / dt;
			m.e = (c * f - d * e) / dt;
			m.f = -(a * f - b * e) / dt;

			return m;
		}
	},

	/**
	 * Interpolate this matrix with another and produce a new matrix.
	 * t is a value in the range [0.0, 1.0] where 0 is this instance and
	 * 1 is equal to the second matrix. The t value is not constrained.
	 *
	 * Context from parent matrix is not applied to the returned matrix.
	 *
	 * Note: this interpolation is naive. For animation use the
	 * intrpolateAnim() method instead.
	 *
	 * @param {Matrix} m2 - the matrix to interpolate with.
	 * @param {number} t - interpolation [0.0, 1.0]
	 * @param {CanvasRenderingContext2D} [context] - optional context to affect
	 * @returns {Matrix} - new instance with the interpolated result
	 */
	interpolate: function(m2, t, context) {

		var me = this,
			m = context ? new Matrix(context) : new Matrix();

		m.a = me.a + (m2.a - me.a) * t;
		m.b = me.b + (m2.b - me.b) * t;
		m.c = me.c + (m2.c - me.c) * t;
		m.d = me.d + (m2.d - me.d) * t;
		m.e = me.e + (m2.e - me.e) * t;
		m.f = me.f + (m2.f - me.f) * t;

		return m._x();
	},

	/**
	 * Interpolate this matrix with another and produce a new matrix.
	 * t is a value in the range [0.0, 1.0] where 0 is this instance and
	 * 1 is equal to the second matrix. The t value is not constrained.
	 *
	 * Context from parent matrix is not applied to the returned matrix.
	 *
	 * Note: this interpolation method uses decomposition which makes
	 * it suitable for animations (in particular where rotation takes
	 * places).
	 *
	 * @param {Matrix} m2 - the matrix to interpolate with.
	 * @param {number} t - interpolation [0.0, 1.0]
	 * @param {CanvasRenderingContext2D} [context] - optional context to affect
	 * @returns {Matrix} - new instance with the interpolated result
	 */
	interpolateAnim: function(m2, t, context) {

		var me = this,
			m = context ? new Matrix(context) : new Matrix(),
			d1 = me.decompose(),
			d2 = m2.decompose(),
			rotation = d1.rotation + (d2.rotation - d1.rotation) * t,
			translateX = d1.translate.x + (d2.translate.x - d1.translate.x) * t,
			translateY = d1.translate.y + (d2.translate.y - d1.translate.y) * t,
			scaleX = d1.scale.x + (d2.scale.x - d1.scale.x) * t,
			scaleY = d1.scale.y + (d2.scale.y - d1.scale.y) * t;

		m.translate(translateX, translateY);
		m.rotate(rotation);
		m.scale(scaleX, scaleY);

		return m._x();
	},

	/**
	 * Decompose the current matrix into simple transforms using either
	 * QR (default) or LU decomposition. Code adapted from
	 * http://www.maths-informatique-jeux.com/blog/frederic/?post/2013/12/01/Decomposition-of-2D-transform-matrices
	 *
	 * The result must be applied in the following order to reproduce the current matrix:
	 *
	 *     QR: translate -> rotate -> scale -> skewX
	 *     LU: translate -> skewY  -> scale -> skewX
	 *
	 * @param {boolean} [useLU=false] - set to true to use LU rather than QR algorithm
	 * @returns {*} - an object containing current decomposed values (rotate, skew, scale, translate)
	 */
	decompose: function(useLU) {

		var me = this,
			a = me.a,
			b = me.b,
			c = me.c,
			d = me.d,
			acos = Math.acos,
			atan = Math.atan,
			sqrt = Math.sqrt,
			pi = Math.PI,

			translate = {
				x: me.e,
				y: me.f
			},
			rotation = 0,
			scale = {
				x: 1,
				y: 1
			},
			skew = {
				x: 0,
				y: 0
			},

			determ = a * d - b * c; // determinant(), skip DRY here...

		if (useLU) {
			if (a) {
				skew = {
					x: atan(c / a),
					y: atan(b / a)
				};
				scale = {
					x: a,
					y: determ / a
				};
			} else if (b) {
				rotation = pi * 0.5;
				scale = {
					x: b,
					y: determ / b
				};
				skew.x = atan(d / b);
			} else { // a = b = 0
				scale = {
					x: c,
					y: d
				};
				skew.x = pi * 0.25;
			}
		} else {
			// Apply the QR-like decomposition.
			if (a || b) {
				var r = sqrt(a * a + b * b);
				rotation = b > 0 ? acos(a / r) : -acos(a / r);
				scale = {
					x: r,
					y: determ / r
				};
				skew.x = atan((a * c + b * d) / (r * r));
			} else if (c || d) {
				var s = sqrt(c * c + d * d);
				rotation = pi * 0.5 - (d > 0 ? acos(-c / s) : -acos(c / s));
				scale = {
					x: determ / s,
					y: s
				};
				skew.y = atan((a * c + b * d) / (s * s));
			} else { // a = b = c = d = 0
				scale = {
					x: 0,
					y: 0
				}; // = invalid matrix
			}
		}

		return {
			scale: scale,
			translate: translate,
			rotation: rotation,
			skew: skew
		};
	},

	/**
	 * Returns the determinant of the current matrix.
	 * @returns {number}
	 */
	determinant: function() {
		return this.a * this.d - this.b * this.c;
	},

	/**
	 * Apply current matrix to x and y point.
	 * Returns a point object.
	 *
	 * @param {number} x - value for x
	 * @param {number} y - value for y
	 * @returns {{x: number, y: number}} A new transformed point object
	 */
	applyToPoint: function(x, y) {

		var me = this;

		return {
			x: x * me.a + y * me.c + me.e,
			y: x * me.b + y * me.d + me.f
		};
	},

	/**
	 * Apply current matrix to array with point objects or point pairs.
	 * Returns a new array with points in the same format as the input array.
	 *
	 * A point object is an object literal:
	 *
	 * {x: x, y: y}
	 *
	 * so an array would contain either:
	 *
	 * [{x: x1, y: y1}, {x: x2, y: y2}, ... {x: xn, y: yn}]
	 *
	 * or
	 * [x1, y1, x2, y2, ... xn, yn]
	 *
	 * @param {Array} points - array with point objects or pairs
	 * @returns {Array} A new array with transformed points
	 */
	applyToArray: function(points) {

		var i = 0,
			p, l,
			mxPoints = [];

		if (typeof points[0] === 'number') {

			l = points.length;

			while (i < l) {
				p = this.applyToPoint(points[i++], points[i++]);
				mxPoints.push(p.x, p.y);
			}
		} else {
			for (; p = points[i]; i++) {
				mxPoints.push(this.applyToPoint(p.x, p.y));
			}
		}

		return mxPoints;
	},

	/**
	 * Apply current matrix to a typed array with point pairs. Although
	 * the input array may be an ordinary array, this method is intended
	 * for more performant use where typed arrays are used. The returned
	 * array is regardless always returned as a Float32Array.
	 *
	 * @param {*} points - (typed) array with point pairs
	 * @param {boolean} [use64=false] - use Float64Array instead of Float32Array
	 * @returns {*} A new typed array with transformed points
	 */
	applyToTypedArray: function(points, use64) {

		var i = 0,
			p,
			l = points.length,
			mxPoints = use64 ? new Float64Array(l) : new Float32Array(l);

		while (i < l) {
			p = this.applyToPoint(points[i], points[i + 1]);
			mxPoints[i++] = p.x;
			mxPoints[i++] = p.y;
		}

		return mxPoints;
	},

	/**
	 * Apply to any canvas 2D context object. This does not affect the
	 * context that optionally was referenced in constructor unless it is
	 * the same context.
	 * @param {CanvasRenderingContext2D} context
	 */
	applyToContext: function(context) {
		var me = this;
		context.setTransform(me.a, me.b, me.c, me.d, me.e, me.f);
		return me;
	},

	/**
	 * Returns true if matrix is an identity matrix (no transforms applied).
	 * @returns {boolean} True if identity (not transformed)
	 */
	isIdentity: function() {
		var me = this;
		return (me._q(me.a, 1) &&
			me._q(me.b, 0) &&
			me._q(me.c, 0) &&
			me._q(me.d, 1) &&
			me._q(me.e, 0) &&
			me._q(me.f, 0));
	},

	/**
	 * Returns true if matrix is invertible
	 * @returns {boolean}
	 */
	isInvertible: function() {
		return !this._q(this.determinant(), 0)
	},

	/**
	 * Test if matrix is valid.
	 */
	isValid: function() {
		return !this._q(this.a * this.d, 0);
	},

	/**
	 * Clones current instance and returning a new matrix.
	 * @param {boolean} [noContext=false] don't clone context reference if true
	 * @returns {Matrix}
	 */
	clone: function(noContext) {
		var me = this,
			m = new Matrix();
		m.a = me.a;
		m.b = me.b;
		m.c = me.c;
		m.d = me.d;
		m.e = me.e;
		m.f = me.f;
		if (!noContext) m.context = me.context;

		return m;
	},

	/**
	 * Compares current matrix with another matrix. Returns true if equal
	 * (within epsilon tolerance).
	 * @param {Matrix} m - matrix to compare this matrix with
	 * @returns {boolean}
	 */
	isEqual: function(m) {

		var me = this,
			q = me._q;

		return (q(me.a, m.a) &&
			q(me.b, m.b) &&
			q(me.c, m.c) &&
			q(me.d, m.d) &&
			q(me.e, m.e) &&
			q(me.f, m.f));
	},

	/**
	 * Returns an array with current matrix values.
	 * @returns {Array}
	 */
	toArray: function() {
		var me = this;
		return [me.a, me.b, me.c, me.d, me.e, me.f];
	},

	/**
	 * Generates a string that can be used with CSS `transform:`.
	 * @returns {string}
	 */
	toCSS: function() {
		return "matrix(" + this.toArray() + ")";
	},

	/**
	 * Returns a JSON compatible string of current matrix.
	 * @returns {string}
	 */
	toJSON: function() {
		var me = this;
		return '{"a":' + me.a + ',"b":' + me.b + ',"c":' + me.c + ',"d":' + me.d + ',"e":' + me.e + ',"f":' + me.f + '}';
	},

	/**
	 * Returns a string with current matrix as comma-separated list.
	 * @returns {string}
	 */
	toString: function() {
		return "" + this.toArray();
	},

	/**
	 * Compares floating point values with some tolerance (epsilon)
	 * @param {number} f1 - float 1
	 * @param {number} f2 - float 2
	 * @returns {boolean}
	 * @private
	 */
	_q: function(f1, f2) {
		return Math.abs(f1 - f2) < 1e-14;
	},

	/**
	 * Apply current absolute matrix to context if defined, to sync it.
	 * @private
	 */
	_x: function() {
		var me = this;
		if (me.context)
			me.context.setTransform(me.a, me.b, me.c, me.d, me.e, me.f);
		return me;
	}
};



}

});
