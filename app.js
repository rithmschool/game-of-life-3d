var game = new GameRenderer( 
  window.innerWidth, 
  window.innerHeight,
  document.getElementById('main')
);

var universe = new CubeUniverse(12, [4, 5], [5, 5]);
var probability = 0.3;

universe.eachCube(function(cube) {
  game.scene.add(cube);
  cube.setAlive(Math.random() < probability);
});

game.render();
