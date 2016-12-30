function Game(universe, keepAlive, makeAlive, evolutionTime, mode, layer, lifeProbability) {

	this.universe = universe;
	this.keepAlive = keepAlive;
	this.makeAlive = makeAlive;
	this.evolutionTime = evolutionTime;
	this.mode = mode || 'random';
	this.layer = layer || 0;
	this.lifeProbability = lifeProbability || 0.3;
	this.playing = false;

}

Game.prototype.init = function(color, cameraOptions, cameraPosition) {
// 
}