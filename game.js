function Game(universe, keepAlive, makeAlive, evolutionTime, mode, layer, lifeProbability) {

	this.universe = universe;
	this.keepAlive = keepAlive;
	this.makeAlive = makeAlive;
	this.evolutionTime = evolutionTime;
	this.mode = mode || 'random';
	this.layer = layer || 0;
	this.lifeProbability = lifeProbability || 0.3;
	this.playing = false;
	this.lastTime = null;

}

Game.prototype.setState = function(newState) {
	this.keepAlive = newState.keepAlive;
	this.makeAlive = newState.makeAlive;
	this.universe.clear();

	for (var i = 0; i < newState.coords.length; i++) {
		var x = newState.coords[i][0];
		var y = newState.coords[i][1];
		var z = newState.coords[i][2];
		var cube = this.universe.cubes[x][y][z];
		cube.setState('userData', {
			isAlive: true,
			inPurgatory: false
		});
		cube.setState('material', {
			opacity: 0.5,
			color: new THREE.Color(cube.colors.alive)
		});
	}	

}

Game.prototype.evolve = function() {

	if (!this.playing) {
		cancelAnimationFrame(this.evolveId);
		return;
	}

	this.evolveId = requestAnimationFrame(this.evolve.bind(this));

	var now = Date.now();
	var delta = now - this.lastTime;

	if (delta > this.evolutionTime) {
		this.lastTime = now - delta % this.evolutionTime;

		var newStatus = universe.getNextLifeState(this.keepAlive, this.makeAlive);
		universe.forEach(function(cube, i, j, k) {
			var isAlive = newStatus[i][j][k]
			cube.setState('userData', {
				isAlive: isAlive
			});
			cube.setState('material', {
				opacity: +isAlive / 2,
				color: new THREE.Color(cube.colors.alive)
			});
		});
	}
}

Game.prototype.init = function(width, height) {
	// camera options
	var viewAngle = 45;
	var aspect = width / height;
	var near = 0.1;
	var far = 10000;

	// initialize moust intersection
	this.intersected = null;

	// initialize renderer
	this.renderer = new THREE.WebGLRenderer();
	this.renderer.setSize(width, height);

	// three.js objects
	var whiteLight = new THREE.PointLight(0xffffff);
	this.mouse = new THREE.Vector2();
	this.raycaster = new THREE.Raycaster();
	this.camera = new THREE.PerspectiveCamera(viewAngle, aspect, near, far);
	this.scene = new THREE.Scene();

	// customizing objects
	whiteLight.position.set(0, 100, 0);
	this.scene.background = new THREE.Color(0xFFFFFF);
	this.camera.position.set(28,23,-21);
	this.scene.add(this.camera);
	this.scene.add(whiteLight);

	// controls for rotating the scene
	var controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
	var coord = this.universe.len / 2;
	controls.target = new THREE.Vector3(coord, coord, coord);
	controls.update();
	
	return this;
}

Game.prototype.render = function() {

	requestAnimationFrame(this.render.bind(this));
	if (this.mode === "manual" && !this.playing) {
		this.raycaster.setFromCamera( this.mouse, this.camera );
		var layerCubes = this.scene.children.filter(function(child) {
			if (child.constructor === Cube) {	
				var x = child.position.x;
				var y = child.position.y;
				var z = child.position.z;
				return universe.inLayer(universe.cubes[x][y][z], +layer.value);
			}
		});
		var intersects = this.raycaster.intersectObjects( layerCubes );
		if (intersects.length > 0) {
			// we have an intersection! 
			// should highlight cell in color that it will become, with full opacity
			if (this.intersected !== intersects[0].object) {
				// we have a new intersection! make sure to reset the old one.
				if (this.intersected) this.intersected.setHighlight(false);
				// style the new one.
				this.intersected = intersects[0].object;
				this.intersected.setHighlight(true);
			}
		} else {
			// no intersection. reset color of former intersected cube, if it exists.
			if (this.intersected) this.intersected.setHighlight(false);
			this.intersected = null;
		}
	}

	this.renderer.render(this.scene, this.camera);
}