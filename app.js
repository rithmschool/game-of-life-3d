// DOM elements
var main = document.getElementById('main')
var sections = document.querySelectorAll("aside > section > h1");
var numberInputs = document.querySelectorAll("input[type='number']");
var randomProbabilityVal = document.getElementById('random-probability-val');
var start = document.getElementById('start');

// Game objects
var game = new GameRenderer( 
  main.clientWidth, 
  window.innerHeight,
  main
);

var universe = new CubeUniverse(12, [4, 5, 5, 5]);
var probability = 0.3;
var initialCubes = null;

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
    if (!game.playing) sectionArea.classList.toggle('open');
  });
}

// attaching event listeners to game parameters
for (var i = 0; i < numberInputs.length; i++) {
  numberInputs[i].addEventListener('click', function(e) {
    var tgt = e.target;
    var idx = tgt.dataset.idx;
    universe.evolveParams[idx] = +tgt.value;
  });
}

// attaching event listener for random probability
document.getElementById('random-probability')
  .addEventListener('input', function(e) {
    probability = +e.target.value / 100;
    randomProbabilityVal.innerText = e.target.value + "%";
  });

// attaching event listener for new random universe
document.getElementById('reset')
  .addEventListener('click', function() {
    if (game.playing) start.click();
    universe.setRandomInitialState(probability);
  });

// play the simulation
start.addEventListener('click', function(e) {
    e.target.innerText = e.target.innerText === 'Play' ? 'Pause' : 'Play';
    game.playing = !game.playing;
    for (var i = 0; i < sections.length; i++) {
      sections[i].nextElementSibling.classList.remove('open');
      sections[i].classList.toggle('disabled');
    }
  });