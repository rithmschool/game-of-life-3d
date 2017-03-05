function GameRenderer(width, height, root) {

	// camera setup
	var viewAngle = 45;
	var aspect = width / height;
	var near = 0.1;
	var far = 10000;
	this.camera = new THREE.PerspectiveCamera(viewAngle, aspect, near, far);
	this.camera.position.set(10, 20, 40);
	this.camera.lookAt(new THREE.Vector3(3,3,3));

	// scene setup
	this.scene = new THREE.Scene();
	this.scene.background = new THREE.Color(0xffffff);

	// initialize renderer
	this.renderer = new THREE.WebGLRenderer();
	this.renderer.setSize(width, height);

	// custom objects 
	var whiteLight = new THREE.PointLight(0xffffff);
	whiteLight.position.set(0, 10, 0);
	this.scene.add(whiteLight);

	// add placeholders for timers
	this.oldTime = Date.now();
	this.newTime = null;

	// games start paused
	this.playing = false;

	// mouse setup
	this.mouse = new THREE.Vector2();
	this.raycaster = new THREE.Raycaster();
	this.intersected = null;

	root.appendChild( this.renderer.domElement );

}

GameRenderer.prototype.render = function(universe) {
	this.newTime = Date.now();
	var step = 1500;
	var change = this.newTime - this.oldTime;
	requestAnimationFrame(this.render.bind(this, universe));

	// find a potential new intersection
	this.raycaster.setFromCamera(this.mouse, this.camera);
	var layerCubes = this.scene.children.filter(function(child) {
		var isCube = child.constructor === Cube;
		var inPendingLayer = child.position.y === universe.pendingLayer;
		return isCube && inPendingLayer;
	});
	var intersects = this.raycaster.intersectObjects(layerCubes);

	// check if there's a new intersection
	var newIntersection = intersects.length > 0 && 
		this.intersected !== intersects[0].object;

	// check if there's no intersection
	var noIntersection = intersects.length === 0;

	// if necessary, unhighlight the previous intersected
	if ((newIntersection || noIntersection) && this.intersected) {
		this.intersected.setHighlight(false);
	}

	// if necessary, update highlight to new intersection
	if (newIntersection) {
		this.intersected = intersects[0].object;
		this.intersected.setHighlight();
	}

	// if necessary, reset this.intersected
	if (noIntersection) {
		this.intersected = null;
	}

	if (game.playing && change > step) {
		this.oldTime = this.newTime - change % step;
		universe.evolve();
	}

	this.renderer.render(this.scene, this.camera);

}

GameRenderer.prototype.addCameraControls = function(x,y,z) {
    var controls = new THREE.OrbitControls(
    	this.camera,
    	this.renderer.domElement
    );
    // set the center of the rotation
    // for the most natural movement, make this 
    // the center of the cube universe
    controls.target = new THREE.Vector3(x, y, z);
    controls.update();
    return controls;
}