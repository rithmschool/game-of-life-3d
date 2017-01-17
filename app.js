var start = document.getElementById("start");
var reset = document.getElementById("reset");
var newUniverse = document.getElementById("new-universe");
var clearUniverse = document.getElementById("clear-universe");
var exampleList = document.getElementById("examples");
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

var initialCubeCoords = [];
var universe = new Universe(len);
var game = new Game(
	universe,
	[+keepAliveMin.value, +keepAliveMax.value],
	[+makeAliveMin.value, +makeAliveMax.value],
	+time.value * 1000
);

lifeProbability.addEventListener('input', function(e) {
	game.lifeProbability = +e.target.value / 100;
	lifeProbabilityVal.innerText = e.target.value + "%";
});

layer.addEventListener('input', function(e) {
	layerVal.innerText = e.target.value;
	game.layer = +e.target.value
	setManualInitialLifeState(universe, game.layer);
});

time.addEventListener('input', function(e) {
	timeVal.innerText = (+e.target.value).toFixed(1);
	game.evolutionTime = +e.target.value * 1000;
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
						child.position.x,
						child.position.y,
						child.position.z,
					]);
				}
				if (child.userData.inPurgatory) {
					child.userData.inPurgatory === false;
					child.material.opacity = 0;
				}
			});
		} else if (section.innerText === "Modes" && game.mode === "manual") {
			setManualInitialLifeState(universe, +layer.value);
		}
	});
});

gameModeOptions.forEach(function(gameModeInput) {
	gameModeInput.addEventListener('click', function(e) {
		var newGameMode = e.target.value;

		if (game.mode !== newGameMode) {
			document.getElementById(game.mode).style.display = "none";
			document.getElementById(newGameMode).style.display = "block";
			if (newGameMode === "random") {
				setRandomInitialLifeState(universe, game.lifeProbability );
			} else {
				setRandomInitialLifeState(universe, 0);
				setManualInitialLifeState(universe, +layer.value);
			}
		}

		game.mode = newGameMode;

	});
});

// raycasting
var raycaster = new THREE.Raycaster();

// rendering
var renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);

main.appendChild(renderer.domElement);

universe.addTo(scene);
var cubes = universe.cubes;

setRandomInitialLifeState(universe, game.lifeProbability);

newUniverse.addEventListener('click', function() {
	setRandomInitialLifeState(universe, game.lifeProbability);
});

clearUniverse.addEventListener('click', function() {
	setRandomInitialLifeState(universe, 0);
	setManualInitialLifeState(universe, +layer.value);
});

reset.addEventListener('click', function() {
	game.playing = false;
	start.innerText = "Play";
	setRandomInitialLifeState(universe, 0);
	setGameState({
		keepAlive: [+keepAliveMin.value, +keepAliveMax.value],
		makeAlive: [+makeAliveMin.value, +makeAliveMax.value],
		coords: initialCubeCoords
	})
});

start.addEventListener('click', function(e) {
	game.playing = !game.playing;
	e.target.innerText = game.playing ? "Pause" : "Play";

	var then = Date.now();
	var keepAlive = [+keepAliveMin.value, +keepAliveMax.value];
	var makeAlive = [+makeAliveMin.value, +makeAliveMax.value];

	if (game.mode === "manual") {
		setManualInitialLifeState(universe, -1, 0x00ff00);
	}
	

	evolve(cubes, keepAlive, makeAlive);

	function evolve(cubes, keepAliveVals, makeAliveVals) {
		if (!game.playing) return

		requestAnimationFrame(evolve.bind(this,cubes,keepAliveVals,makeAliveVals));

		var now = Date.now();
		var delta = now - then;
		if (delta > game.evolutionTime) {
			then = now - delta % game.evolutionTime;

			var newStatus = getEvolveStatuses(universe, keepAliveVals, makeAliveVals);
			universe.forEach(function(cube, i, j, k) {
				cube.userData.isAlive = newStatus[i][j][k];
				cube.material.opacity = +cube.userData.isAlive / 2;
			});
		}
	}

});

main.addEventListener('mousemove', onDocumentMouseMove);
main.addEventListener('mousedown', toggleIntersect);

var controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.target = new THREE.Vector3(len / 2, len / 2, len / 2);
controls.update();

var intersected = null;

render();

function render() {
	requestAnimationFrame(render);
	if (game.mode === "manual" && !game.playing) {
		raycaster.setFromCamera( mouse, camera );
		var layerCubes = scene.children.filter(function(child) {
			if (child.constructor === "Cube") {	
				var x = child.position.x;
				var y = child.position.y;
				var z = child.position.z;
				return universe.inLayer(cubes[x][y][z], +layer.value);
			}
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
// universe function
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
// universe function
function setManualInitialLifeState(universe, layer, color) {
	universe.forEach(function(cube) {
		if (!cube.userData.isAlive) {
			var inPurgatory = universe.inLayer(cube, layer);
			cube.setCubeState({
				inPurgatory: inPurgatory
			}, {
				opacity: +inPurgatory / 5,
				color: new THREE.Color(color || 0xffff00)
			});
		}
	});
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

function setAlive(universe, cube, aliveVals) {
	var nbrs = universe.neighborCount(cube);
	return nbrs >= aliveVals[0] && nbrs <= aliveVals[1];
}

function getEvolveStatuses(universe, keepAliveVals, makeAliveVals) {
	return universe.map(function(cube, i, j, k) {
		var aliveVals = cube.userData.isAlive ? keepAliveVals : makeAliveVals;
		return setAlive(universe, cube, aliveVals);
	});
}

// curated initial state stuff
// game function
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