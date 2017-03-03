function Cube(x,y,z) {

  var geometry = new THREE.BoxGeometry(1, 1, 1);
  var material = new THREE.MeshLambertMaterial({
    color: 0x00ff00,
    transparent: true,
    opacity: 0
  });
  THREE.Mesh.call(this, geometry, material)
  this.position.set(x, y, z);
  this.userData = { isAlive: false };

}

Cube.prototype = Object.create(THREE.Mesh.prototype);
Cube.prototype.constructor = Cube;

Cube.prototype.setAlive = function(lifeBool) {
  if (typeof lifeBool !== 'boolean' && arguments.length) {
    throw new TypeError("setAlive called with wrong argument type");
  }
  if (arguments.length === 0 || lifeBool) {
    this.material.opacity = 0.5;
  } else {
    this.material.opacity = 0
  }
  this.userData.isAlive = lifeBool;
}