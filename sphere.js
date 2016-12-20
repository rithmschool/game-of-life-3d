var width = 400;
var height = 300;

var viewAngle = 45;
var aspect = width / height;
var near = 0.1;
var far = 10000;

var container = document.getElementById("main");

// details on scene, camera, renderer: https://threejs.org/docs/#Manual/Introduction/Creating_a_scene
var scene = new THREE.Scene();
var camera = 
	new THREE.PerspectiveCamera(
		viewAngle,
		aspect,
		near,
		far
	);
var renderer = new THREE.WebGLRenderer();

scene.add(camera);
renderer.setSize(width, height);
container.appendChild(renderer.domElement);

// sphere stuff

var radius = 50;
var segments = 16;
var rings = 16;
var sphereGeometry = new THREE.SphereGeometry(radius, segments, rings)
var sphereMaterial = new THREE.MeshLambertMaterial({color: 0xCC0000});

var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

sphere.position.z = -300;
scene.add(sphere);

var pointLight = new THREE.PointLight(0xFFFFFF);
pointLight.position = {x: 10, y: 50, z: 130};
scene.add(pointLight);

function render() {
	requestAnimationFrame(render)
	renderer.render(scene, camera);
}
render();