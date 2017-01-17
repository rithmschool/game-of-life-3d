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
					[i, j, k]
				)
				cubeRow.push(cube);
			}
			cubePlane.push(cubeRow);
		}
		this.cubes.push(cubePlane);
	}
};

Universe.prototype.forEach = function(cb) {
	for (var i = 0; i < this.cubes.length; i++) {
		for (var j = 0; j < this.cubes.length; j++) {
			for (var k = 0; k < this.cubes.length; k++) {
				cb(this.cubes[i][j][k], i, j, k);
			}
		}
	}
};

Universe.prototype.map = function(cb) {
	var new3DArray = []
	for (var i = 0; i < len; i++) {
		var plane = [];
		for (var j = 0; j < len; j++) {
			var row = [];
			for (var k = 0; k < len; k++) {
				row.push(cb(this.cubes[i][j][k], i, j, k));
			}
			plane.push(row);
		}
		new3DArray.push(plane);
	}
	return new3DArray;
};

Universe.prototype.addTo = function(scene) {
	this.forEach(function(cube) { cube.addTo(scene); });
	return this;
};

Universe.prototype.neighborCount = function(cube) {
	var x = cube.position.x;
	var y = cube.position.y;
	var z = cube.position.z;
	var count = cube.userData.isAlive ? -1 : 0;
	for (var i = -1; i < 2; i++) {
		for (var j = -1; j < 2; j++) {
			for (var k = -1; k < 2; k++) {
				try {
					if (cubes[x + i][y + j][z + k].userData.isAlive) count++;
				} catch(e) {
					continue
				}
			}
		}
	}
	return count;
};

Universe.prototype.inLayer = function(cube, layerId) {
	var len = this.cubes.length;
	var x = cube.position.x;
	var y = cube.position.y;
	var z = cube.position.z;
	var lower = len / 2 - 1 - layerId;
	var upper = len /2 + layerId;
	var onXSide = (x === lower || x === upper) && between(y, lower, upper) && between(z, lower, upper);
	var onYSide = (y === lower || y === upper) && between(x, lower, upper) && between(z, lower, upper);
	var onZSide = (z === lower || z === upper) && between(x, lower, upper) && between(y, lower, upper);  
	return onXSide || onYSide || onZSide;

	function between(x,a,b) {
		return a <= x && x <= b;    
	}
}

// Universe.prototype.setState = function(cb) {
// 	this.forEach(function(cube) {
// 		cube.setCubeState(cb);
// 	});
// };