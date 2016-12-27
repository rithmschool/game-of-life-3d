var container = document.getElementById("main");
var start = document.getElementById("start");
var newBoard = document.getElementById("new-board");
var width = container.offsetWidth;
var height = window.innerHeight;
var viewAngle = 45;
var aspect = width / height;
var near = 0.1;
var far = 10000;
var min = -25;
var max = 25;
var len = 12;
var keepAliveMin       = document.getElementById("keep-alive-min");
var keepAliveMax       = document.getElementById("keep-alive-max");
var makeAliveMin       = document.getElementById("make-alive-min");
var makeAliveMax       = document.getElementById("make-alive-max");
var lifeProbability    = document.getElementById("life-probability");
var lifeProbabilityVal = document.getElementById("life-probability-val");
var layer 			   = document.getElementById("layer");
var layerVal 		   = document.getElementById("layer-val");
var gameModeOptions    = document.querySelectorAll("input[type='radio']");
var mouse = new THREE.Vector2();
var gameMode = 'random';

lifeProbability.addEventListener('input', function(e) {
	lifeProbabilityVal.innerText = e.target.value + "%";
});

layer.addEventListener('input', function(e) {
	layerVal.innerText = e.target.value;
	setManualInitialLifeState(cubes, +e.target.value);
});

gameModeOptions.forEach(function(gameModeInput) {
	gameModeInput.addEventListener('click', function(e) {
		var newGameMode = e.target.value;

		
		if (gameMode !== newGameMode) {
			document.getElementById(gameMode).style.display = "none";
			document.getElementById(newGameMode).style.display = "block";
			if (newGameMode === "random") {
				setRandomInitialLifeState(cubes, +lifeProbability.value / 100);
			} else {
				setManualInitialLifeState(cubes, 0);
			}
		}

		gameMode = newGameMode;

	});
});

var scene = new THREE.Scene();
scene.background = new THREE.Color(0xFFFFFF);

var camera = 
	new THREE.PerspectiveCamera(
		viewAngle,
		aspect,
		near,
		far
	);

camera.position.set(18,30,-21);
scene.add(camera);
var whiteLight = new THREE.PointLight(0xffffff);
whiteLight.position.set(0, 100, 0);
scene.add(whiteLight);
var raycaster = new THREE.Raycaster();
var renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);

container.appendChild(renderer.domElement);

var cubes = generateCubes(len);

setRandomInitialLifeState(cubes, +lifeProbability.value / 100);

newBoard.addEventListener('click', function() {
	setRandomInitialLifeState(cubes, +lifeProbability.value / 100);
});

start.addEventListener('click', function() {
	var then = Date.now();
	var keepAlive = [+keepAliveMin.value, +keepAliveMax.value];
	var makeAlive = [+makeAliveMin.value, +makeAliveMax.value];
	
	evolve(cubes, keepAlive, makeAlive);

	function evolve(cubes, keepAliveVals, makeAliveVals) {
		requestAnimationFrame(evolve.bind(this,cubes,keepAliveVals,makeAliveVals));

		var interval = 2000;
		var now = Date.now();
		var delta = now - then;
		if (delta > interval) {

			then = now - delta % interval;

			var newStatus = getEvolveStatuses(cubes, keepAliveVals, makeAliveVals);
			for (var i = 0; i < cubes.length; i++) {
				for (var j = 0; j < cubes.length; j++) {
					for (var k = 0; k < cubes.length; k++) {
						var cube = cubes[i][j][k];
						cube.userData.isAlive = newStatus[i][j][k];
						cube.material.opacity = +cube.userData.isAlive / 2;
					}
				}
			}
		}
	}

});

main.addEventListener('mousemove', onDocumentMouseMove, false);

var controls = new THREE.OrbitControls(camera, renderer.domElement);
var intersected = null;

render();

function render() {
	requestAnimationFrame(render);

	raycaster.setFromCamera( mouse, camera );

	var intersects = raycaster.intersectObjects( scene.children.slice(2) );
	if (intersects.length > 0) {
		if (intersected !== intersects[0].object) {
			if (intersected) {
				intersected.material.color = new THREE.Color(0x00ff00);
				intersected.material.opacity = +intersected.userData.isAlive / 2;
			}
			intersected = intersects[0].object;
			intersected.material.color = new THREE.Color(0xff0000);
			intersected.material.opacity = 1;
		}
	} else {
		if (intersected) {
			intersected.material.color = new THREE.Color(0x00ff00);
			intersected.material.opacity = +intersected.userData.isAlive / 2;
		}
		intersected = null;
	}

	renderer.render(scene, camera);
}

// cube stuff

function generateCubes(len) {
	var cubes = [];
	for (var i=0;i<len;i++) {
		var cubePlane = [];
		for (var j=0;j<len;j++) {
			var cubeRow = [];
			for (var k=0;k<len;k++) {
				var isAlive = Math.random() < lifeProbability;
				cubeRow.push(addCube([i - len/2,j - len/2,k - len/2]));
			}
			cubePlane.push(cubeRow);
		}
		cubes.push(cubePlane);
	}
	return cubes;
}

function addCube(coordinates) {
	var geometry = new THREE.BoxGeometry(1,1,1);
 	var material = new THREE.MeshLambertMaterial({
 		color: 0x00ff00,
 		transparent: true
 	});
	var cube = new THREE.Mesh(geometry, material);
	cube.position.set.apply(cube.position,coordinates);
	scene.add(cube);
	return cube;
}

function setLifeStatus(cube, isAlive) {
	cube.userData.isAlive = isAlive;
	cube.material.opacity = +cube.userData.isAlive / 2;
}

function setRandomInitialLifeState(cubes, lifeProbability) {
	for (var i = 0; i < cubes.length; i++) {
		for (var j = 0; j < cubes.length; j++) {
			for (var k = 0; k < cubes.length; k++) {
				setLifeStatus(cubes[i][j][k], Math.random() < lifeProbability);
			}
		}
	}
}

// manual stuff

function setManualInitialLifeState(cubes, layer) {
	for (var i = 0; i < cubes.length; i++) {
		for (var j = 0; j < cubes.length; j++) {
			for (var k = 0; k < cubes.length; k++) {
				setLifeStatus(cubes[i][j][k], inLayer(i, j, k, layer, cubes.length));
			}
		}
	}
}

function inLayer(x,y,z,layerId, len) {
	var lower = layerId;
	var upper = len - layerId - 1;
	var xSides = (x === lower || x === upper) && between(y, lower, upper) && between(z, lower, upper);
	var ySides = (y === lower || y === upper) && between(x, lower, upper) && between(z, lower, upper);
	var zSides = (z === lower || z === upper) && between(x, lower, upper) && between(y, lower, upper)  
	return xSides || ySides || zSides;
}

function between(x,a,b) {
	return a <= x && x <= b;    
}

// evolution / neighbor stuff

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

function inLayer(x,y,z,layerId, len) {
	var lower = layerId;
	var upper = len - layerId - 1;
	var xSides = (x === lower || x === upper) && between(y, lower, upper) && between(z, lower, upper);
	var ySides = (y === lower || y === upper) && between(x, lower, upper) && between(z, lower, upper);
	var zSides = (z === lower || z === upper) && between(x, lower, upper) && between(y, lower, upper); 
	return xSides || ySides || zSides;
}

function between(x,a,b) {
	return a <= x && x <= b;    
}

function setAlive(coords, aliveVals, cubes) {
	var nbrs = livingNeighborCount(coords,cubes);
	return nbrs >= aliveVals[0] && nbrs <= aliveVals[1];
}

function getEvolveStatuses(cubes, keepAliveVals, makeAliveVals) {
	return cubes.map(function(cubePlanes,i) {
		return cubePlanes.map(function(cubeRows,j) {
			return cubeRows.map(function(cube,k) {
				var aliveVals = cube.userData.isAlive ? keepAliveVals : makeAliveVals;
				return setAlive([i,j,k], aliveVals, cubes);
			});
		});
	});
}

// intersection stuff

function onDocumentMouseMove(evt) {
	mouse.x =   ( ( evt.clientX + width - window.innerWidth ) / width  ) * 2 - 1;
	mouse.y = - ( evt.clientY / window.innerHeight ) * 2 + 1;
}

// TODO
// pause / unpause
// reset
// create board manually
// clean up UI
// refactor EVERYTHING