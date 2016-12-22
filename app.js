var width = window.innerWidth;
var height = window.innerHeight;
var viewAngle = 75;
var aspect = width / height;
var near = 0.1;
var far = 10000;
var min = -50;
var max = 50;

var container = document.getElementById("main");

var scene = new THREE.Scene();
scene.background = new THREE.Color(0xFFFFFF);

var camera = 
	new THREE.PerspectiveCamera(
		viewAngle,
		aspect,
		near,
		far
	);
scene.add(camera);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);

container.appendChild(renderer.domElement);

camera.position.z = 2.4*min;
camera.position.y = max;
camera.position.x = max;

addCubes(1000, min, max);

var light = new THREE.PointLight(0xffffff);
light.position.set(0, 100, 0);
scene.add(light);

var controls = new THREE.OrbitControls(camera, renderer.domElement);

function render() {
	requestAnimationFrame(render);
	renderer.render(scene, camera);
}
render();

function addCubes(cubeCount, min, max) {
 	var geometry = new THREE.BoxGeometry(1,1,1);
 	var material = new THREE.MeshLambertMaterial({
 		color: 0x00ff00,
 		transparent: true,
 		opacity: 0.5
 	});
	for (var i = 0; i < cubeCount; i++) {
		var cube = new THREE.Mesh(geometry, material);
		cube.position.set(
			randInt(min,max),
			randInt(min,max),
			randInt(min,max)
		);
		scene.add(cube);
	}
}

function randInt(min, max) {
	return Math.floor(Math.random() * (max + 1 - min) + min )
}