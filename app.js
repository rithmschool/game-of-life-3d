// DOM elements
var main = document.getElementById("main")
var sections = document.querySelectorAll("aside > section > h1");
var numberInputs = document.querySelectorAll("input[type='number']");
var randomProbabilityVal = document.getElementById('random-probability-val');
var layerVal = document.getElementById("layer-val");
var start = document.getElementById("start");
var gameModeOptions = document.getElementById("game-modes");
var width = main.clientWidth;
var height = window.innerHeight;
var asideWidth = document.querySelector('aside').clientWidth;

// Game objects
var game = new GameRenderer( width,
  height,
  main
);

var universe = new CubeUniverse(12, [4, 5, 5, 5]);
var probability = 0.3;

// creating the game
universe.eachCube(function(cube) {
  game.scene.add(cube);
});

universe.setRandomInitialState(probability);

game.addCameraControls(universe.len / 2, universe.len / 2, universe.len / 2);
game.render(universe);

// attaching event listeners to menu
for (var i = 0; i < sections.length; i++) {
  sections[i].addEventListener('click', function(e) {
    var sectionArea = e.target.nextElementSibling;
    if (!game.playing) sectionArea.classList.toggle("open");
    if (e.target.innerText === "Settings" && 
        game.mode === "manual" && 
        sectionArea.classList.contains("open")) {
      universe.setPendingLayer(+layerVal.innerText - 1);
    } else {
      universe.setPendingLayer(-1);
    }
    game.setup = true;
  });
}

// attaching event listeners to game parameters
for (var i = 0; i < numberInputs.length; i++) {
  numberInputs[i].addEventListener('input', function(e) {
    console.log(e.target.value)
    var tgt = e.target;
    var idx = tgt.dataset.idx;
    universe.evolveParams[idx] = +tgt.value;
  });
}

// attaching event listener for random probability slider
document.getElementById('random-probability')
  .addEventListener('input', function(e) {
    probability = +e.target.value / 100;
    randomProbabilityVal.innerText = e.target.value + "%";
  });

// attaching event listener for pending layer slider
document.getElementById('layer')
  .addEventListener('input', function(e) {
    universe.setPendingLayer(+e.target.value);
    layerVal.innerText = +e.target.value + 1;
  });

// attaching event listener for new random universe
document.getElementById('new-universe')
  .addEventListener('click', function() {
    universe.setRandomInitialState(probability);
  });

// attaching event listener for examples
document.getElementById("examples")
  .addEventListener("click", function(e) {
    if (e.target.tagName === "LI") {
      document.querySelector("input[value='manual']").click();
      universe.setPendingLayer(-1);
      var exampleState = examples[e.target.dataset.example];
      universe.setManualInitialState(exampleState);
      exampleState.evolveParams.forEach(function(param, i) {
        numberInputs[i].value = param;
      });
    }
  });

// attaching event listener for game modes
gameModeOptions.addEventListener("click", function(e) {
  if (e.target.tagName === "INPUT") {
    var currentMode = e.target.value;
    
    if (game.mode !== currentMode) {
      document.getElementById(game.mode).classList.add("hidden");
      document.getElementById(currentMode).classList.remove("hidden");

      if (currentMode === "random") {
        universe.setRandomInitialState(probability);
      } else {
        universe.clear();
        universe.setPendingLayer(+layerVal.innerText - 1);
      }
    }

    game.mode = currentMode;

  }
});

// play the simulation
start.addEventListener('click', function(e) {
    e.target.innerText = e.target.innerText === 'Play' ? 'Pause' : 'Play';
    game.playing = !game.playing;
    for (var i = 0; i < sections.length; i++) {
      sections[i].nextElementSibling.classList.remove("open");
      sections[i].classList.toggle('disabled');
    }
    if (game.playing) {
      game.oldTime = Date.now()
      universe.setPendingLayer(-1);
    }
  });

// mouse events on canvas
main.addEventListener('mousemove', function(e) {
  // grab the components of the moust position,
  // and normalize so that x and y are between -1 and 1
  game.mouse.x = (e.pageX - asideWidth) / width * 2 - 1
  game.mouse.y = (height - e.layerY) / height * 2 - 1
});

main.addEventListener('click', function(e) {
  var cube = game.intersected;
  if (cube) {
    cube.setAlive(!cube.userData.isAlive);
    cube.setHighlight(true);
  }
});