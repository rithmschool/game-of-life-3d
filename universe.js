function Universe(len) {
	this.cubes = []
	for (var i = 0; i < len; i++) {
		var cubePlane = [];
		for (var j = 0; j < len; j++) {
			var cubeRow = [];
			for (var k = 0; k < len; k++) {
				var cube = new Cube(
					[1,1,1],
					new THREE.MeshLambertMaterial({transparent: true}),
					[i - len / 2, j - len / 2, k - len / 2]
				)
				cubeRow.push(cube);
			}
			cubePlane.push(cubeRow);
		}
		this.cubes.push(cubePlane);
	}
}

Universe.prototype.forEach = function(cb) {
	for (var i = 0; i < this.cubes.length; i++) {
		for (var j = 0; j < this.cubes.length; j++) {
			for (var k = 0; k < this.cubes.length; k++) {
				cb(this.cubes[i][j][k], [i, j, k]);
			}
		}
	}
}

Universe.prototype.map = function(cb) {
	var new3DArray = []
	for (var i = 0; i < len; i++) {
		var plane = [];
		for (var j = 0; j < len; j++) {
			var row = [];
			for (var k = 0; k < len; k++) {
				row.push(cb(this.cubes[i][j][k], [i, j, k]));
			}
			plane.push(row);
		}
		new3DArray.push(plane);
	}
	return new3DArray;
}

Universe.prototype.addTo = function(scene) {
	this.forEach(function(cube) { cube.addTo(scene); });
	return this;
}