var scene = new THREE.Scene();
scene.background = new THREE.Color(0xFFFFFF);

camera.position.set(28,23,-21);
scene.add(camera);
var whiteLight = new THREE.PointLight(0xffffff);
whiteLight.position.set(0, 100, 0);
scene.add(whiteLight);