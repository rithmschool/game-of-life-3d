var main = document.querySelector("main");
var start = document.getElementById("start");
var reset = document.getElementById("reset");
var newUniverse = document.getElementById("new-universe");
var clearUniverse = document.getElementById("clear-universe");
var exampleList = document.getElementById("examples");
var width = main.offsetWidth;
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
var time 		   	   = document.getElementById("time");
var timeVal 		   = document.getElementById("time-val");
var gameModeOptions    = document.querySelectorAll("input[type='radio']");
var sections 		   = document.querySelectorAll("section > h1");
var mouse = new THREE.Vector2();
var gameMode = 'random';
var playing = false;
var interval = 2000;
var initialCubeCoords = [];

lifeProbability.addEventListener('input', function(e) {
	lifeProbabilityVal.innerText = e.target.value + "%";
});

layer.addEventListener('input', function(e) {
	layerVal.innerText = e.target.value;
	setManualInitialLifeState(universe, +e.target.value);
});

time.addEventListener('input', function(e) {
	timeVal.innerText = e.target.value;
	interval = +e.target.value * 1000;
});

exampleList.addEventListener('click', function(e) {
	if (e.target.tagName === "LI") {
		setRandomInitialLifeState(universe, 0);
		var exampleName = e.target.innerText.split(" ")[0].toLowerCase()
		setGameState(examples[exampleName]);
	}
});

sections.forEach(function(section) {
	section.addEventListener('click', function(e) {
		sections.forEach(function(sectionHeading) {
			sectionHeading.nextElementSibling.classList.remove("open");
		});
		e.target.nextElementSibling.classList.add("open");
		if (section.innerText === "Play!") {
			initialCubeCoords = [];
			scene.children.forEach(function(child) {
				if (child.userData.isAlive) {
					initialCubeCoords.push([
						child.position.x + len / 2,
						child.position.y + len / 2,
						child.position.z + len / 2,
					]);
				}
				if (child.userData.inPurgatory) {
					child.userData.inPurgatory === false;
					child.material.opacity = 0;
				}
			});
		} else if (section.innerText === "Modes" && gameMode === "manual") {
			setManualInitialLifeState(universe, +layer.value);
		}
	});
});

gameModeOptions.forEach(function(gameModeInput) {
	gameModeInput.addEventListener('click', function(e) {
		var newGameMode = e.target.value;

		if (gameMode !== newGameMode) {
			document.getElementById(gameMode).style.display = "none";
			document.getElementById(newGameMode).style.display = "block";
			if (newGameMode === "random") {
				setRandomInitialLifeState(universe, +lifeProbability.value / 100);
			} else {
				setRandomInitialLifeState(universe, 0);
				setManualInitialLifeState(universe, +layer.value);
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

main.appendChild(renderer.domElement);

var universe = new Universe(len);
universe.addTo(scene);
var cubes = universe.cubes;

setRandomInitialLifeState(universe, +lifeProbability.value / 100);

newUniverse.addEventListener('click', function() {
	setRandomInitialLifeState(universe, +lifeProbability.value / 100);
});

clearUniverse.addEventListener('click', function() {
	setRandomInitialLifeState(universe, 0);
	setManualInitialLifeState(universe, +layer.value);
});

reset.addEventListener('click', function() {
	playing = false;
	start.innerText = "Play";
	setRandomInitialLifeState(universe, 0);
	setGameState({
		keepAlive: [+keepAliveMin.value, +keepAliveMax.value],
		makeAlive: [+makeAliveMin.value, +makeAliveMax.value],
		coords: initialCubeCoords
	})
});

start.addEventListener('click', function(e) {
	playing = !playing;
	var then = Date.now();
	var keepAlive = [+keepAliveMin.value, +keepAliveMax.value];
	var makeAlive = [+makeAliveMin.value, +makeAliveMax.value];

	if (gameMode === "manual") {
		setManualInitialLifeState(universe, -1, 0x00ff00);
	}
	
	e.target.innerText = playing ? "Pause" : "Play"

	evolve(cubes, keepAlive, makeAlive);

	function evolve(cubes, keepAliveVals, makeAliveVals) {
		if (!playing) return

		requestAnimationFrame(evolve.bind(this,cubes,keepAliveVals,makeAliveVals));

		var now = Date.now();
		var delta = now - then;
		if (delta > interval) {
			then = now - delta % interval;

			var newStatus = getEvolveStatuses(universe, keepAliveVals, makeAliveVals);
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

main.addEventListener('mousemove', onDocumentMouseMove);
main.addEventListener('mousedown', toggleIntersect);

var controls = new THREE.OrbitControls(camera, renderer.domElement);
var intersected = null;

render();

function render() {
	requestAnimationFrame(render);
	if (gameMode === "manual" && !playing) {
		raycaster.setFromCamera( mouse, camera );
		var layerCubes = scene.children.filter(function(child) { 
			var x = child.position.x + len / 2;
			var y = child.position.y + len / 2;
			var z = child.position.z + len / 2;
			return inLayer(x, y, z, +layer.value, len);
		});
		var intersects = raycaster.intersectObjects( layerCubes );
		if (intersects.length > 0) {
			// we have an intersection! 
			// should highlight cell in color that it will become, with full opacity
			if (intersected !== intersects[0].object) {
				// we have a new intersection! make sure to reset the old one.
				if (intersected) {
					if (intersected.userData.inPurgatory) {
						intersected.material.color = new THREE.Color(0xffff00);
						intersected.material.opacity = 1 / 5;
					} else {
						intersected.material.color = new THREE.Color(0x00ff00);
						intersected.material.opacity = 1 / 2;
					}
				}
				// style the new one.
				intersected = intersects[0].object;
				var color = intersected.userData.inPurgatory ? 0x00ff00 : 0xffff00;
				intersected.material.color = new THREE.Color(color);
				intersected.material.opacity = 1;
			}
		} else {
			// no intersection. reset color of former intersected cube, if it exists.
			if (intersected) {
				if (intersected.userData.inPurgatory) {
					intersected.material.color = new THREE.Color(0xffff00);
					intersected.material.opacity = 1 / 5;
				} else {
					intersected.material.color = new THREE.Color(0x00ff00);
					intersected.material.opacity = 1 / 2;
				}
			}
			intersected = null;
		}
	}

	renderer.render(scene, camera);
}

// cube stuff

function setRandomInitialLifeState(universe, lifeProbability) {
	universe.forEach(function(cube) {
		var isAlive = Math.random() < lifeProbability;
		cube.setCubeState({
			isAlive: isAlive,
			inPurgatory: false
		}, {
			opacity: +isAlive / 2,
			color: new THREE.Color(0x00ff00)
		});
	});
}

// manual stuff

function setManualInitialLifeState(universe, layer, color) {
	universe.forEach(function(cube, i, j, k) {
		if (!cube.userData.isAlive) {
			var inPurgatory = inLayer(i, j, k, layer, universe.cubes.length);
			cube.setCubeState({
				inPurgatory: inPurgatory
			}, {
				opacity: +inPurgatory / 5,
				color: new THREE.Color(color || 0xffff00)
			});
		}
	})
}

function inLayer(x,y,z,layerId, len) {
	var lower = len / 2 - 1 - layerId;
	var upper = len /2 + layerId;
	var xSides = (x === lower || x === upper) && between(y, lower, upper) && between(z, lower, upper);
	var ySides = (y === lower || y === upper) && between(x, lower, upper) && between(z, lower, upper);
	var zSides = (z === lower || z === upper) && between(x, lower, upper) && between(y, lower, upper)  
	return xSides || ySides || zSides;
}

function between(x,a,b) {
	return a <= x && x <= b;    
}

function toggleIntersect() {
	if (intersected) {
		var newLifeStatus = !intersected.userData.isAlive;
		intersected.setCubeState({
			isAlive: newLifeStatus,
			inPurgatory: !newLifeStatus
		}, {
			opacity: 1,
			color: new THREE.Color(newLifeStatus ? 0xffff00 : 0x00ff00)
		});
	}
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

function setAlive(coords, aliveVals, cubes) {
	var nbrs = livingNeighborCount(coords,cubes);
	return nbrs >= aliveVals[0] && nbrs <= aliveVals[1];
}

function getEvolveStatuses(universe, keepAliveVals, makeAliveVals) {
	return universe.map(function(cube, i, j, k) {
		var aliveVals = cube.userData.isAlive ? keepAliveVals : makeAliveVals;
		return setAlive([i,j,k], aliveVals, cubes);
	});
}

// curated initial state stuff

function setGameState(stateObj) {
	keepAliveMin.value = stateObj.keepAlive[0];
	keepAliveMax.value = stateObj.keepAlive[1];
	makeAliveMin.value = stateObj.makeAlive[0];
	makeAliveMax.value = stateObj.makeAlive[1];

	setRandomInitialLifeState(universe, 0);

	for (var i = 0; i < stateObj.coords.length; i++) {
		var x = stateObj.coords[i][0]
		var y = stateObj.coords[i][1]
		var z = stateObj.coords[i][2]
		cubes[x][y][z].setCubeState({
			isAlive: true,
			inPurgatory: false
		}, {
			opacity: 0.5,
			color: new THREE.Color(0x00ff00)
		});
	}
}

// intersection stuff

function onDocumentMouseMove(evt) {
	mouse.x =   ( ( evt.pageX + width - window.innerWidth ) / width  ) * 2 - 1;
	mouse.y = - ( evt.pageY / window.innerHeight ) * 2 + 1;
}

// TODO
// fix bugs around manual mode in play
// refactor EVERYTHING
// add saving via localStorage