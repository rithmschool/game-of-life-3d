function Cube(dimensions, material, coordinates, userData) {

	var geometry = new THREE.BoxGeometry(dimensions[0], dimensions[1], dimensions[2]);
	THREE.Mesh.call(this, geometry, material);
	this.position.set.apply(this.position, coordinates);
	this.userData = userData || {};

}

Cube.prototype = Object.create(THREE.Mesh.prototype);
Cube.prototype.constructor = Cube;

Cube.prototype.colors = {
	alive: 0x00ff00,
	inPurgatory: 0xffff00
}

Cube.prototype.addTo = function(scene) {
	scene.add(this);
	return this;
}

Cube.prototype.setState = function(key, newState) {
	for (var option in newState) {
		this[key][option] = newState[option];
	}
}

Cube.prototype.setRandomLifeState = function(lifeProbability) {
	var isAlive = Math.random() < lifeProbability;
	this.setState('userData', {
		isAlive: isAlive,
		inPurgatory: false
	});
	this.setState('material', {
		opacity: +isAlive / 2,
		color: new THREE.Color(this.colors.alive)
	});
}

Cube.prototype.setHighlight = function(bool) {
	var inPurgatory = this.userData.inPurgatory;
	var newColorKey, newOpacity;
	if (bool) {
		newColorKey = inPurgatory ? 'alive' : 'inPurgatory';
		newOpacity = 1;
	} else {
		newColorKey = inPurgatory ? 'inPurgatory' : 'alive';
		newOpacity = inPurgatory ? 1 / 5 : 1 / 2;
	}
	this.setState('material', {
		color: new THREE.Color(this.colors[newColorKey]),
		opacity: newOpacity
	});
}