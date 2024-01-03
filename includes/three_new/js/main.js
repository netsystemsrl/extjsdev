// main.js
//(function(THREE){
//"use strict"; 
if (!Detector.webgl) Detector.addGetWebGLMessage();

var camera, controls, scene, renderer, guicontrols;
var clock = new THREE.Clock();
var cube, line, box, dots, room;
var floorSize = {x:100, z:100}; //x,z
var racks = 5;
var volumeNames = [];
var boxSize = 10;
var relativeBoxStartPosition = {x:floorSize['x']/2, y: 5, z: - floorSize['z']/2 + boxSize};

var maxCubex = 0;
var maxCubey = 0;
var maxCubez = 0;

var floorPlane, vertSxPlane, vertRearPlane, vertDxPlane;

/*LOADING BAR*/
const progressBar = document.querySelector( '#progress' );
const loadingOverlay = document.querySelector( '#loading-overlay' );
let percentComplete = 1;
let frameID = null;
const updateAmount = 0.5; // in percent of bar width, should divide 100 evenly
const animateBar = () => {
	percentComplete += updateAmount;

	// if the bar fills up, just reset it.
	// I'm changing the color only once, you 
	// could get fancy here and set up the colour to get "redder" every time
	if ( percentComplete >= 100 ) {
	  progressBar.style.backgroundColor = 'blue'
	  percentComplete = 1;
	}
	progressBar.style.width = percentComplete + '%';

	frameID = requestAnimationFrame( animateBar )
}

/*INIZIO PARTE SPOSTAMENTO */
var angle = 0;
var position = 0;

//3D
var path3D;

//2D
// direction vector for movement
//var direction = new THREE.Vector3(1, 0, 0);
var up = new THREE.Vector3(0, 0, 1);
//var axis = new THREE.Vector3();
// scalar to simulate speed
var speed = 0.5;
/*FINE PARTE SPOSTAMENTO*/

// RequestAnimationFrame shim
/*
window.requestAnimFrame = ( function( callback ) {
	return window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	window.oRequestAnimationFrame ||
	window.msRequestAnimationFrame ||
	function ( callback ) {
		window.setTimeout( callback, 1000 / 60 );
	};
})();
*/

init();
//render(); // remove when using next line for animation loop (requestAnimationFrame)
//animate();

function init() {
	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0xcccccc );
	scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );
	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
	//camera.position.set( 100, 50, 0 );
	camera.position.set( floorSize['x']*2, 50, floorSize['z']/2 );
	// controls
	controls = new THREE.OrbitControls( camera, renderer.domElement );
	//controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)
	controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
	controls.dampingFactor = 0.25;
	controls.screenSpacePanning = false;
	controls.minDistance = 10;
	controls.maxDistance = 500;
	controls.maxPolarAngle = Math.PI / 2;
	controls.target.set( 0, 0, floorSize['z']/2 );
	
	// world
	
	// lights
	var light = new THREE.DirectionalLight( 0xffffff );
	light.position.set( 1, 1, 1 );
	scene.add( light );
	var light = new THREE.DirectionalLight( 0x002288 );
	light.position.set( - 1, - 1, - 1 );
	scene.add( light );
	var light = new THREE.AmbientLight( 0x222222 );
	scene.add( light );
	
	//listeners
	window.addEventListener( 'resize', onWindowResize, false );
	/*
	document.addEventListener( 'mousedown', onDocumentMouseDown, false );
	document.addEventListener( 'touchstart', onDocumentTouchStart, false );
	document.addEventListener( 'touchmove', onDocumentTouchMove, false );
	*/
	
	//GUI
	guicontrols = new function () {
		this.rotationSpeed = 0.02;
		this.bouncingSpeed = 0.03;
	};
	/*
	var gui = new dat.GUI();
	gui.add(guicontrols, 'rotationSpeed', 0, 0.5);
	gui.add(guicontrols, 'bouncingSpeed', 0, 0.5);
	*/
	
	createDome();
	createHelpers();
	createRoom();
	//createFunkyObjects();
	/*
	createRack();
	createBoxes();
	*/
	
	//draw2DPath();
	//draw3DPath();
	
	animate();
}
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}
function animate() {
	//move2D();
	move3D();
	
	//if ( frameID !== null ) return;
    animateBar();
	
	requestAnimationFrame(animate);

	controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
	render();
}
function render() {
	// rotate the cube around its axes
	if (cube && 1==2) {
		cube.rotation.x += guicontrols.rotationSpeed;
		cube.rotation.y += guicontrols.rotationSpeed;
		cube.rotation.z += guicontrols.rotationSpeed;
	}
	if (line) {
		line.rotation.z += guicontrols.rotationSpeed;
	}
	
	renderer.render(scene, camera);
}

function createDome(){
	// Dome
	geometry = new THREE.IcosahedronGeometry(2000, 1);
	var domeMaterial = new THREE.MeshPhongMaterial({
		color: 0xfb4550,
		//shading: THREE.FlatShading,
		flatShading: true,
		side: THREE.BackSide
	});
	var dome = new THREE.Mesh(geometry, domeMaterial);
	scene.add(dome);
}

function createHelpers(){
	// helpers
	var axes = new THREE.AxesHelper(floorSize['x']/2);
	scene.add(axes);
	//grid Helper
	var size = 100;
	var divisions = 100;
	var planeGridHelper = new THREE.GridHelper(size, divisions);
	//planeGridHelper.position.y = 0;
	//scene.add(planeGridHelper);
	var vertSxGridHelper = new THREE.GridHelper(size, divisions);
	vertSxGridHelper.rotation.x = degra(90);
	vertSxGridHelper.position.z = 50;
	vertSxGridHelper.position.y = 50;
	//scene.add(vertSxGridHelper);
	var vertDxGridHelper = new THREE.GridHelper(size, divisions);
	vertDxGridHelper.rotation.x = degra(90);
	vertDxGridHelper.position.z = -50;
	vertDxGridHelper.position.y = 50;
	//scene.add(vertDxGridHelper);
		
	var radius = 10;
	//PolarGridHelper
	var radials = 16;
	var circles = 8;
	var divisions = 64;
	var polarGridHelper = new THREE.PolarGridHelper( radius, radials, circles, divisions );
	//scene.add( polarGridHelper );
}

function createFunkyObjects(){
	//coni
	var geometry = new THREE.CylinderBufferGeometry( 0, 10, 30, 4, 1 );
	var material = new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true } );
	for ( var i = 0; i < 500; i ++ ) {
		var piramid = new THREE.Mesh( geometry, material );
		piramid.position.x = Math.random() * 1600 - 800;
		piramid.position.y = 0;
		piramid.position.z = Math.random() * 1600 - 800;
		piramid.updateMatrix();
		piramid.matrixAutoUpdate = false;
		//scene.add(piramid);
	}
	
	//2Dpath
	var path = new THREE.Path();
	path.lineTo( relativeBoxStartPosition.x, relativeBoxStartPosition.z );
	path.quadraticCurveTo( 0, 1, 0.2, 1 );
	path.lineTo( 100, 100 );

	var points = path.getPoints();

	var geometry = new THREE.BufferGeometry().setFromPoints( points );
	var material = new THREE.LineBasicMaterial( { color: 0xffffff } );

	var pathline = new THREE.Line( geometry, material );
	//scene.add( pathline );
	
	//Create a closed wavey loop - 3D path
	curve = new THREE.CatmullRomCurve3( [
		//new THREE.Vector3( -10, 0, 10 ),
		new THREE.Vector3( relativeBoxStartPosition.x, relativeBoxStartPosition.y, relativeBoxStartPosition.z),
		//new THREE.Vector3( -5, 5, 5 ),
		new THREE.Vector3( relativeBoxStartPosition.x, relativeBoxStartPosition.y, relativeBoxStartPosition.z/2 ),
		//new THREE.Vector3( 5, -5, 5 ),
		//new THREE.Vector3( 10, 0, 10 )
		//new THREE.Vector3( relativeBoxStartPosition.x, relativeBoxStartPosition.y, relativeBoxStartPosition.z)
		new THREE.Vector3( -10, relativeBoxStartPosition.y, 10 )
	] );

	var points = curve.getPoints( 50 );
	var geometry = new THREE.BufferGeometry().setFromPoints( points );

	var material = new THREE.LineBasicMaterial( { color : 0xff0000 } );

	// Create the final object to add to the scene
	var curveObject = new THREE.Line( geometry, material );
	//scene.add( curveObject );
	
	//create a blue LineBasicMaterial
	var linebasicmaterial = new THREE.LineBasicMaterial( { color: 0x0000ff } );
	var linebasicgeometry = new THREE.Geometry();
	linebasicgeometry.vertices.push(new THREE.Vector3( -10, 0, 0) );
	linebasicgeometry.vertices.push(new THREE.Vector3( 0, 10, 0) );
	linebasicgeometry.vertices.push(new THREE.Vector3( 10, 0, 0) );
	var line = new THREE.Line( linebasicgeometry, linebasicmaterial );
	//scene.add( line );
	
	//cube
	var cubeSize = 10;
	var cubegeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
	//var cubematerial = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
	var cubematerial = new THREE.MeshLambertMaterial({wireframe: true});
	cube = new THREE.Mesh( cubegeometry, cubematerial );
	//cube.position.y = 0;
	cube.position.set( 10, 5, 10 );
	//cube.cubematerial.wireframe = true;
	//scene.add( cube );
		
	var cube1 = new THREE.Mesh( cubegeometry, cubematerial );
	cube1.position.set( 20, 5, 10 );
	//scene.add( cube1 );
}

function createRoom(){
	scene.remove(room);
	room = new THREE.Object3D();
	// planes
	var floorPlaneGeometry = new THREE.PlaneGeometry( floorSize['x'], floorSize['z'], floorSize['x'], floorSize['z'] );
	//var material = new THREE.MeshBasicMaterial( { color: 0x0000ff, wireframe: true, side: THREE.DoubleSide } );
	var florMaterial = new THREE.MeshBasicMaterial({color: 0x919191, wireframe: false, side: THREE.DoubleSide});
	floorPlane = new THREE.Mesh( floorPlaneGeometry, florMaterial );
	floorPlane.rotation.x = degra(90);
	floorPlane.position.x = floorSize['x']/2;
	floorPlane.position.z = floorSize['z']/2;
	//scene.add( floorPlane );
	room.add(floorPlane);
	
	var wallMaterial = new THREE.MeshBasicMaterial({color: 0xddeeee, wireframe: false, side: THREE.DoubleSide});
	var vertPlaneGeometry = new THREE.PlaneGeometry( 100, 30, 100, 30  );
	vertSxPlane = new THREE.Mesh( vertPlaneGeometry, wallMaterial );
	vertSxPlane.position.x = +floorSize['x']/2;
	vertSxPlane.position.z = +floorSize['z'];
	vertSxPlane.position.y = 15;
	//scene.add( vertSxPlane );
	room.add(vertSxPlane);
	
	vertRearPlane = new THREE.Mesh( vertPlaneGeometry, wallMaterial );
	vertRearPlane.rotation.y = degra(90);
	//vertRearPlane.position.x = -floorSize['x']/2;
	vertRearPlane.position.z = +floorSize['x']/2;
	vertRearPlane.position.y = 15;
	//scene.add( vertRearPlane );
	room.add(vertRearPlane);
	
	vertDxPlane = new THREE.Mesh( vertPlaneGeometry, wallMaterial );
	vertDxPlane.position.x = +floorSize['x']/2;
	//vertDxPlane.position.z = -floorSize['z']/2;
	vertDxPlane.position.y = 15;
	//scene.add( vertDxPlane );
	room.add(vertDxPlane);
	
	scene.add(room);
}

function createRackFromJson(jsonObj) {
	//console.log(jsonObj.data);
	
	/*
	M = magazzino
	H = altezza
	X = fila
	Y = scaffale
	*/
	
	var cubeSize = 10;
	/*
	var relativCoord = {
		'x':-floorSize['x']/2,
		'z':floorSize['z']/2,
	};
	*/
	var relativCoord = {
		'x':0,
		'z':0,
	};

	var colors = {
		'green': 0x00ff00, //green
		'red': 0xFF0000, //red
		'blue': 0x0000FF, //blue
		'yellow': 0xFFFF00, //yellow
	};
	
    dots = new THREE.Object3D();
	var zaddpos = 0;
	var r = 0;
	Object.keys(jsonObj).forEach(function(key) {
		//console.log(key, jsonObj[key]);
		if (r != 0) {
			var zaddpos = zaddpos + 2 * cubeSize;
		}
		
		
		var m = parseInt(jsonObj[key].GRUPPOM.substr(1, 2));
		
		var x = 1;
		var y = 1;
		var z = 1;
		if (jsonObj[key].GRUPPOX != null){
			x = jsonObj[key].GRUPPOX.substr(1, 1).charCodeAt(0) - 65; //LETTERA A NUMERO
		}
		if (jsonObj[key].GRUPPOH != null){
			y = parseInt(jsonObj[key].GRUPPOH);
		}
		if (jsonObj[key].GRUPPOY != null){
			z = parseInt(jsonObj[key].GRUPPOY);
		}
		
		var x1 = x; 
		var y1 = y * cubeSize ;
		var z1 = z * cubeSize ;
		

		var cubex = relativCoord['x'] + cubeSize/2 + x1 * cubeSize +  10  ;
		var cubey = y1 ;
		var cubez = relativCoord['z'] + cubeSize/2 + z1 ;
		var cubegeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
		//var cubematerial = new THREE.MeshBasicMaterial( { color: 0x00ff00 } ); 
		
		//TESTO SUL CUBO
		var dynamicTexture  = new THREEx.DynamicTexture(512,512);
		dynamicTexture.context.font	= "bolder 40px Verdana";
		var cubematerial = new THREE.MeshBasicMaterial({
			map : dynamicTexture.texture
		});
		dynamicTexture.texture.needsUpdate  = true
		
		
		if (jsonObj[key].ARTCODICE != null) {
			dynamicTexture.clear('red');
			dynamicTexture.drawText( jsonObj[key].ARTCODICE, 32, 256, 'white')
		}else{
			dynamicTexture.clear('green');	
			dynamicTexture.drawText(jsonObj[key].CODICE , 32, 256, 'white')
		}
		
		
		//CREA CUBO
		cube = new THREE.Mesh( cubegeometry, cubematerial );
		//cube.position.y = 0;
		//cube.position.set( i * cubeSize + cubeSize/2 , 5, cubeSize/2 + zaddpos);
		
		//POSIZIONE E DEFINZIONE CUBO
		if (isOdd(x)) {	x = x + 5; console.log(x);}
		
		//var cubePosX = cubex + x;
		var cubePosX = cubez;
		var cubePosY = cubey + y;
		//var cubePosZ = cubez;
		var cubePosZ = cubex + x;
		
		if (cubePosX > Math.abs(maxCubex))
			maxCubex = cubePosX;
		
		if (cubePosY > Math.abs(maxCubey))
			maxCubey = cubePosY;
		
		if (cubePosZ > Math.abs(maxCubey))
			maxCubez = cubePosZ;
		
		cube.position.set( cubePosX, cubePosY, cubePosZ );
		cube.name = jsonObj[key].CODICE;
		cube.userData.id = jsonObj[key].CODICE;
		
		volumeNames.push(cube.name);
		dots.add(cube);
		
		r++;
	});
	
	console.log(maxCubex);
	console.log(maxCubey);
	console.log(maxCubez);
	
	floorSize['x'] = maxCubex;
	floorSize['y'] = maxCubey;
	floorSize['z'] = maxCubez + cubeSize/2;
	createRoom();
	
	//floorPlane.scale.set( 2, 1, 1 );
	//vertSxPlane.position.z = maxCubez + cubeSize/2;
	//vertRearPlane.scale.set( 0, maxCubey, maxCubez );
	
	camera.position.set( maxCubex*2, maxCubey/2, maxCubez/2 );
	controls.target.set( 0, 0, maxCubez/2 );
	
	//DISEGNA IL TUTTO
	scene.add(dots);
}

function isOdd(num) { return num % 2;}

function createRack() {
	
	var cubeSize = 10;
	/*
	var relativCoord = {
		'x':-floorSize['x']/2,
		'z':floorSize['z']/2,
	};
	*/
	
	var relativCoord = {
		'x':0,
		'z':0,
	};

	
	var relativCoordCubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
	//var relativCoordCubeMaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
	var relativCoordCubeMaterial = new THREE.MeshLambertMaterial({color: 0xFF0000});
	relativCoordCube = new THREE.Mesh( relativCoordCubeGeometry, relativCoordCubeMaterial );
	//relativCoordCube.position.y = 0;
	relativCoordCube.position.set( relativCoord['x'], 5, relativCoord['z']);	
	//scene.add(relativCoordCube);
	
	var colors = {
		'0': 0x00ff00, //green
		'1': 0xFF0000, //red
		'2': 0x0000FF, //blue
		'3': 0xFFFF00, //yellow
	};
	
    dots = new THREE.Object3D();
	var zaddpos = 0;
	for (r = 0; r < racks; r++) {
		if (r != 0) {
			var zaddpos = zaddpos + 2 * cubeSize;
		}
		/*
		if (r % 2) {
			//is odd
			var zaddpos = zaddpos + r * cubeSize + cubeSize;
			console.log(r);
			console.log(zaddpos);
		} else {
			var zaddpos = zaddpos + r * cubeSize;
			console.log(r);
			console.log(zaddpos);
		}
		*/
		
		for (var i = 0; i < 8; i++) {
			var cubegeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
			//var cubematerial = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
			var cubematerial = new THREE.MeshLambertMaterial({wireframe: true, color: colors[r]});
			cube = new THREE.Mesh( cubegeometry, cubematerial );
			//cube.position.y = 0;
			//cube.position.set( i * cubeSize + cubeSize/2 , 5, cubeSize/2 + zaddpos);
			cube.position.set( relativCoord['x'] + cubeSize/2 + i * cubeSize , 5, relativCoord['z'] + cubeSize/2 + zaddpos);
			cube.data = { rack: r, line: 1, pos: i };
			cube.name = r+'1'+i;
			volumeNames.push(cube.name);
			cube.userData.id = r+'1'+i;
			
			dots.add(cube);
		}

		for (var i = 0; i < 8; i++) {
			var cubegeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
			//var cubematerial = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
			var cubematerial = new THREE.MeshLambertMaterial({wireframe: true});
			cube = new THREE.Mesh( cubegeometry, cubematerial );
			//cube.position.y = 0;
			//cube.position.set( i * cubeSize + cubeSize/2, 5 + cubeSize, cubeSize/2 + zaddpos);
			cube.position.set( relativCoord['x'] + cubeSize/2 + i * cubeSize , 5 + cubeSize, relativCoord['z'] + cubeSize/2 + zaddpos);
			cube.data = { rack: r, line: 2, pos: i };
			cube.name = r+'2'+i;
			volumeNames.push(cube.name);
			cube.userData.id = r+'2'+i;
			
			dots.add(cube);
		}
	}	
	/*
    dots.position.x = 70;
    dots.position.y = 9;
    dots.position.z = -2;
    dots.rotation.y = Math.PI * 600;
    dots.rotation.z = Math.PI * 500;
	*/
	
    scene.add(dots);
};

function createBoxes() {
	
	var loader = new THREE.TextureLoader();
	loader.load('img/pallet-s-h.png', function ( texture ) {

		var boxgeometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
		//var boxmaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
		//var boxmaterial = new THREE.MeshLambertMaterial({ color: 0x0000FF });
		var boxmaterial = new THREE.MeshLambertMaterial({ map: texture, overdraw: 0.5 });
		box = new THREE.Mesh( boxgeometry, boxmaterial );
		//cube.position.y = 0;
		box.position.set( relativeBoxStartPosition.x , relativeBoxStartPosition.y, relativeBoxStartPosition.z );
		box.name = 'box';
		//cube.boxmaterial.wireframe = true;
		scene.add(box);
		
		box2 = box.clone();
		scene.add(box2);
	  
		//set a initial position or rotation
		//box2.rotation.z = Math.PI/4;
		box2.position.set( relativeBoxStartPosition.x , relativeBoxStartPosition.y, -relativeBoxStartPosition.z);

	});
	
}

function draw2DPath() {
	// the path
	path = new THREE.Path([
		new THREE.Vector2(-50, -50),
		new THREE.Vector2(0, -50)
	]);
	
	var arcRadius = 50;
	path.moveTo(0, 0 - arcRadius);
	path.absarc(0, 0, arcRadius, -Math.PI / 2, 0, false);
	path.lineTo(50, 50);

	// Start angle and point
	previousAngle = getAngle( position );
	previousPoint = path.getPointAt( position );
	
	var vertices = path.getSpacedPoints(20);

	// Change 2D points to 3D points
	for (var i = 0; i < vertices.length; i++) {
		point = vertices[i]
		vertices[i] = new THREE.Vector3(point.x, point.y, 0);
	}
	var lineGeometry = new THREE.Geometry();
	lineGeometry.vertices = vertices;
	var lineMaterial = new THREE.LineBasicMaterial({
		color: 0x000000
	});
	var line = new THREE.Line(lineGeometry, lineMaterial)
	scene.add(line);
}

function draw3DPath() {
	//Create a closed wavey loop - 3D path
	path3D = new THREE.CatmullRomCurve3( [
		//new THREE.Vector3( -10, 0, 10 ),
		new THREE.Vector3( relativeBoxStartPosition.x, relativeBoxStartPosition.y, -relativeBoxStartPosition.z),
		//new THREE.Vector3( -5, 5, 5 ),
		new THREE.Vector3( relativeBoxStartPosition.x, relativeBoxStartPosition.y, 0 ),
		//new THREE.Vector3( 5, -5, 5 ),
		//new THREE.Vector3( 10, 0, 10 )
		//new THREE.Vector3( relativeBoxStartPosition.x, relativeBoxStartPosition.y, relativeBoxStartPosition.z)
		new THREE.Vector3( 25, relativeBoxStartPosition.y, 5 )
	] );

	var points = path3D.getPoints( 50 );
	var geometry = new THREE.BufferGeometry().setFromPoints( points );

	var material = new THREE.LineBasicMaterial( { color : 0xff0000 } );

	// Create the final object to add to the scene
	var curveObject = new THREE.Line( geometry, material );
	scene.add( curveObject );
}

function move3D(){
	if (path3D != undefined) {
		position += 0.001;
		var pos =  path3D.getPoint(position);
		box2.position.set(pos.x, pos.y, pos.z);
	}
}

function move2D() {
  
	// add up to position for movement
	position += 0.001;

	// get the point at position
	try {
		var point = path.getPointAt(position);
		//var point = curve.getPointAt(position);
		if(point !== null) {
			box.position.x = point.x;
			box.position.y = point.y;

			var angle = getAngle(position);
			// set the quaternion
			box.quaternion.setFromAxisAngle( up, angle );

			/*
			box2.position.x += ( point.x - previousPoint.x );
			box2.position.y += ( point.y - previousPoint.y );

			// set the quaternion
			box2.rotation.z += ( angle - previousAngle );
			*/

			previousPoint = point;
			previousAngle = angle;
		}
	}
	catch(error) {
		console.error(error);
		// expected output: SyntaxError: unterminated string literal
		// Note - error messages will vary depending on browser
	}
}

function showProgressBar() {
    loadingOverlay.classList.remove('loading-overlay-hidden');

    // reset the bar in case we need to use it again
    percentComplete = 1;
    progressBar.style.width = 0;
    cancelAnimationFrame( frameID );
}

function hideProgressBar() {
    loadingOverlay.classList.add('loading-overlay-hidden');

    // reset the bar in case we need to use it again
    percentComplete = 0;
    progressBar.style.width = 0;
    cancelAnimationFrame( frameID );
}

function getAngle( position ){
	// get the 2Dtangent to the curve
	var tangent = path.getTangent(position).normalize();

	// change tangent to 3D
	angle = - Math.atan( tangent.x / tangent.y);

	return angle;
}

/*
function onDocumentMouseDown( event ) {

	event.preventDefault();

	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'mouseup', onDocumentMouseUp, false );
	document.addEventListener( 'mouseout', onDocumentMouseOut, false );

	mouseXOnMouseDown = event.clientX - windowHalfX;
	targetRotationOnMouseDown = targetRotation;

}

function onDocumentMouseMove( event ) {

	mouseX = event.clientX - windowHalfX;

	targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.02;

}

function onDocumentMouseUp( event ) {

	document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
	document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
	document.removeEventListener( 'mouseout', onDocumentMouseOut, false );

}

function onDocumentMouseOut( event ) {

	document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
	document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
	document.removeEventListener( 'mouseout', onDocumentMouseOut, false );

}

function onDocumentTouchStart( event ) {

	if ( event.touches.length === 1 ) {

		event.preventDefault();

		mouseXOnMouseDown = event.touches[ 0 ].pageX - windowHalfX;
		targetRotationOnMouseDown = targetRotation;

	}

}

function onDocumentTouchMove( event ) {

	if ( event.touches.length === 1 ) {

		event.preventDefault();

		mouseX = event.touches[ 0 ].pageX - windowHalfX;
		targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.05;

	}

}
*/
//radians
function degra(degree){ 
	return degree*(Math.PI/180); 
}
//})();
