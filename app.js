var start = document.getElementById("start");
var reset = document.getElementById("reset");
var newUniverse = document.getElementById("new-universe");
var clearUniverse = document.getElementById("clear-universe");
var exampleList = document.getElementById("examples");
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
var main = document.querySelector("main");
var width = main.offsetWidth;
var height = window.innerHeight;

var initialCubeCoords = [];
var universe = new Universe(len);
var game = new Game(
	universe,
	[+keepAliveMin.value, +keepAliveMax.value],
	[+makeAliveMin.value, +makeAliveMax.value],
	+time.value * 1000
);

game.init(width, height);

lifeProbability.addEventListener('input', function(e) {
	game.lifeProbability = +e.target.value / 100;
	lifeProbabilityVal.innerText = e.target.value + "%";
});

layer.addEventListener('input', function(e) {
	layerVal.innerText = e.target.value;
	game.layer = +e.target.value
	universe.setPurgatoryState(game.layer);
});

time.addEventListener('input', function(e) {
	timeVal.innerText = (+e.target.value).toFixed(1);
	game.evolutionTime = +e.target.value * 1000;
});

exampleList.addEventListener('click', function(e) {
	if (e.target.tagName === "LI") {
		universe.clear();
		var exampleName = e.target.innerText.split(" ")[0].toLowerCase();
		var newState = examples[exampleName];
		keepAliveMin.value = newState.keepAlive[0];
		keepAliveMax.value = newState.keepAlive[1];
		makeAliveMin.value = newState.makeAlive[0];
		makeAliveMax.value = newState.makeAlive[1];
		game.setState(newState);
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
			game.scene.children.forEach(function(child) {
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
			universe.setPurgatoryState(+layer.value);
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
				universe.setRandomLifeState(game.lifeProbability);
			} else {
				universe.clear();
				universe.setPurgatoryState(+layer.value);
			}
		}

		game.mode = newGameMode;

	});
});

main.appendChild(game.renderer.domElement);

universe.addTo(game.scene);
universe.setRandomLifeState(game.lifeProbability);

newUniverse.addEventListener('click', function() {
	universe.setRandomLifeState(game.lifeProbability);
});

clearUniverse.addEventListener('click', function() {
	universe.clear();
	universe.setPurgatoryState(+layer.value);
});

reset.addEventListener('click', function() {
	game.playing = false;
	start.innerText = "Play";
	game.setState({
		keepAlive: [+keepAliveMin.value, +keepAliveMax.value],
		makeAlive: [+makeAliveMin.value, +makeAliveMax.value],
		coords: initialCubeCoords
	});
});

start.addEventListener('click', function(e) {
	game.playing = !game.playing;
	e.target.innerText = game.playing ? "Pause" : "Play";

	game.lastTime = Date.now();
	game.keepAlive = [+keepAliveMin.value, +keepAliveMax.value];
	game.makeAlive = [+makeAliveMin.value, +makeAliveMax.value];

	if (game.mode === "manual") {
		universe.setPurgatoryState(-1);
	} 
	
	game.evolve();

});

main.addEventListener('mousemove', onDocumentMouseMove);
main.addEventListener('mousedown', toggleIntersect);

game.render();

function toggleIntersect() {
	if (game.intersected) {
		var newLifeStatus = !game.intersected.userData.isAlive;
		game.intersected.setState('userData', {
			isAlive: newLifeStatus,
			inPurgatory: !newLifeStatus,
		});
		game.intersected.setState('material', {
			opacity: 1,
			color: new THREE.Color(newLifeStatus ? 0xffff00 : 0x00ff00)
		});
	}
}

// intersection stuff

function onDocumentMouseMove(evt) {
	game.mouse.x =   ( ( evt.pageX + width - window.innerWidth ) / width  ) * 2 - 1;
	game.mouse.y = - ( evt.pageY / window.innerHeight ) * 2 + 1;
}

// TODO

// on load, have rules open
// refactor EVERYTHING
// add saving via localStorage
// put colors in variable