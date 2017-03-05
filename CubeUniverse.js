function CubeUniverse(len, evolveParams, pendingLayer) {
  this.len = len;
  this.evolveParams = evolveParams;
  this.pendingLayer = pendingLayer || 0;

  this.cubes = [];

  // generating the 3D array
  for (var i = 0; i < len; i++) {
    var cubePlane = [];
    for (var j = 0; j < len; j++) {
      var cubeRow = [];
      for (var k = 0; k < len; k++) {
        var cube = new Cube(i,j,k);
        cubeRow.push(cube);
      }
      cubePlane.push(cubeRow);
    }
    this.cubes.push(cubePlane);
  }
}

CubeUniverse.prototype.eachCube = function(callback) {
  for (var i = 0; i < this.len; i++) {
    for (var j = 0; j < this.len; j++) {
      for (var k = 0; k < this.len; k++) {
        callback(this.cubes[i][j][k]);
      }
    }
  }
}

CubeUniverse.prototype.__neighborCount = function(cube) {
  var x = cube.position.x;
  var y = cube.position.y;
  var z = cube.position.z;
  var count = cube.userData.isAlive ? -1 : 0;
  for (var i = -1; i < 2; i++) {
    for (var j = -1; j < 2; j++) {
      for (var k = -1; k < 2; k++) {
        // if the coordinates are valid, check the neighbor
        // otherwise, move on
        try {
          if (this.cubes[x + i][y + j][z + k].userData.isAlive) count++;
        } catch(e) {
          continue
        }
      }
    }
  }
  return count;
};

CubeUniverse.prototype.evolve = function() {
  // look at each cube, count its neighbors, 
  // determine whether it should live in the next generation
  this.eachCube(function(cube) {
    var count = this.__neighborCount(cube);
    // if the cube is alive, the first two parameters determine
    // its status in the next generation; otherwise, 
    // otherwise, use the second two parameters do this.
    var aliveVals = cube.userData.isAlive ? 
                    this.evolveParams.slice(0, 2) : 
                    this.evolveParams.slice(2);
    var nextGenIsAlive = aliveVals[0] <= count && count <= aliveVals[1];
    cube.userData.nextGenIsAlive = nextGenIsAlive;
  }.bind(this));

  // go through the cubes again, update isAlive with
  // nextGenIsAlive
  this.eachCube(function(cube) {
    cube.setAlive(cube.userData.nextGenIsAlive);
  });
}

CubeUniverse.prototype.setRandomInitialState = function(prob) {
  this.eachCube(function(cube) {
    cube.setAlive(Math.random() < prob);
  });
}

CubeUniverse.prototype.clear = function() {
  this.setRandomInitialState(0);
}

CubeUniverse.prototype.setPendingLayer = function(y) {
  this.eachCube(function(cube) {
    cube.setPending(cube.position.y === y);
  });
  this.pendingLayer = y;
}