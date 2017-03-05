function Cube(x,y,z) {

  // mesh options
  var geometry = new THREE.BoxGeometry(1, 1, 1);
  var material = new THREE.MeshLambertMaterial({
    color: 0x00ff00,
    transparent: true,
    opacity: 0
  });
  THREE.Mesh.call(this, geometry, material);

  // setting position and initial userData state
  this.position.set(x, y, z);
  this.userData = { isAlive: false };

}

Cube.prototype = Object.create(THREE.Mesh.prototype);
Cube.prototype.constructor = Cube;

Cube.prototype.setAlive = function(lifeBool) {
  // make sure the method is called correctly
  if (typeof lifeBool !== 'boolean') {
    throw new TypeError("setAlive called with wrong argument type");
  }

  // determine whether to hide the cube or not
  if (lifeBool) this.material.color = new THREE.Color( 0x00ff00 )
  this.material.opacity = +lifeBool / 2;
  this.userData.isAlive = lifeBool;
}

Cube.prototype.setPending = function(pendingBool) {
  // make sure the method is called correctly
  if (typeof pendingBool !== 'boolean') {
    throw new TypeError("setPending called with wrong argument type");
  }

  // life status takes priority over pending status,
  // so we need to check for it.
  var isAlive = this.userData.isAlive;

  if (pendingBool) this.material.color = new THREE.Color( 
    isAlive ? 0x00ff00 : 0xffff00 
  )
  this.material.opacity = isAlive || pendingBool ? 0.5 : 0;
  this.userData.isPending = pendingBool;
}

Cube.prototype.setHighlight = function(highlightBool) {
  // make sure the method is called correctly
  if (typeof highlightBool !== 'boolean') {
    throw new TypeError("setHighlight called with wrong argument type");
  }

  var isAlive = this.userData.isAlive;
  var isPending = this.userData.isPending;

  if (highlightBool) {
    // crank up opacity for highlight, and swap colors
    this.material.opacity = 1;
    this.material.color = new THREE.Color( isAlive ? 0xffff00 : 0x00ff00 );
  } else {
    // don't set to transparent if the cube's isAlive is set to true
    this.material.opacity = isAlive || isPending ? 0.5 : 0;
    this.material.color = new THREE.Color( isAlive ? 0x00ff00 : 0xffff00 );
  }
}