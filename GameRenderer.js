function GameRenderer(width, height, root) {

	if (GameRenderer.instance) return GameRenderer.instance;
	GameRenderer.instance = this;

	// camera setup
	var viewAngle = 45;
	var aspect = width / height;
	var near = 0.1;
	var far = 10000;
	this.camera = new THREE.PerspectiveCamera(viewAngle, aspect, near, far);
	this.camera.position.set(3,3,20);

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

	root.appendChild( this.renderer.domElement );

}

GameRenderer.prototype.render = function() {

	requestAnimationFrame(this.render.bind(this));
	this.renderer.render(this.scene, this.camera);

}