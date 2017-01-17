var main = document.querySelector("main");
var width = main.offsetWidth;
var height = window.innerHeight;
var viewAngle = 45;
var aspect = width / height;
var near = 0.1;
var far = 10000;
var camera = 
	new THREE.PerspectiveCamera(
		viewAngle,
		aspect,
		near,
		far
	);