var width = window.innerWidth;
var height = window.innerHeight;
var viewAngle = 45;
var aspect = width / height;
var near = 0.1;
var far = 10000;
var min = -25;
var max = 25;
var len = 12;
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
camera.position.set(12,20,-14);

// addRandomCubes(1000, min, max);
// addCube([0,0,0]);
// addCube([1,1,1]);
var cubes = addAllCubes(len,1);

var whiteLight = new THREE.PointLight(0xffffff);
whiteLight.position.set(0, 100, 0);
scene.add(whiteLight);

var controls = new THREE.OrbitControls(camera, renderer.domElement);

function render() {
	requestAnimationFrame(render);
	renderer.render(scene, camera);
}
render();

function addAllCubes(len, lifeProbability) {
	var cubes = []
	for (var i=0;i<len;i++) {
		var cubePlane = [];
		for (var j=0;j<len;j++) {
			var cubeRow = [];
			for (var k=0;k<len;k++) {
				var isAlive = Math.random() < lifeProbability;
				cubeRow.push(addCube([i - len/2,j - len/2,k - len/2], isAlive));
			}
			cubePlane.push(cubeRow);
		}
		cubes.push(cubePlane);
	}
	return cubes;
}

function addCube(coordinates, isAlive) {
	var geometry = new THREE.BoxGeometry(1,1,1);
 	var material = new THREE.MeshLambertMaterial({
 		color: 0x00ff00,
 		transparent: true,
 		opacity: +isAlive / 2
 	});
	var cube = new THREE.Mesh(geometry, material);
	cube.position.set.apply(cube.position,coordinates);
	cube.userData.isAlive = isAlive;
	scene.add(cube);
	return cube;
}

function livingNeighborCount(coords, cubes) {
	var numAlive = cubes[coords[0]][coords[1]][coords[2]].userData.isAlive ? -1 : 0;
	for (var i = coords[0] - 1; i <= coords[0] + 1; i++) {
		for (var j = coords[1] - 1; j <= coords[1] + 1; j++) {
			for (var k = coords[2] - 1; k <= coords[2] + 1; k++) {
				try {
					if (cubes[i][j][k].userData.isAlive) numAlive++;
				} catch(e) {
					continue
				}
			}
		}
	}
	return numAlive;
}