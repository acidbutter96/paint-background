// set up global javascript variables
'use strict';

var canvas, gl; // canvas and webgl context

var shaderScript;
var shaderSource;
var vertexShader; // Vertex shader.  Not much happens in that shader, it just creates the vertex's to be drawn on
var fragmentShader; // this shader is where the magic happens. Fragment = pixel.  Vertex = kind of like "faces" on a 3d model.
var buffer;
var program;

/* Variables holding the location of uniform variables in the WebGL. We use this to send info to the WebGL script. */
var locationOfTime;
var locationOfResolution;
var locationOfMouse;
var locationOfXpos;
var locationOfYpos;

var startTime = new Date().getTime(); // Get start time for animating
var currentTime = 0;

var mouse = [0, 0];

function init() {
	// standard canvas setup here, except get webgl context
	canvas = document.getElementById('glscreen');
	gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
	if (!gl) {
		console.error('WebGL not supported');
		return;
	}

	// set initial size
	resizeCanvas();

	// kind of back-end stuff
	buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array([
			-1.0, -1.0,
			1.0, -1.0,
			-1.0, 1.0,
			-1.0, 1.0,
			1.0, -1.0,
			1.0, 1.0]),
		gl.STATIC_DRAW
	);

	shaderScript = document.getElementById('2d-vertex-shader');
	shaderSource = shaderScript.textContent || shaderScript.text;
	vertexShader = gl.createShader(gl.VERTEX_SHADER); //create the vertex shader from script
	gl.shaderSource(vertexShader, shaderSource);
	gl.compileShader(vertexShader);

	if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
		console.error('Vertex shader compile error:\n', gl.getShaderInfoLog(vertexShader));
		return;
	}

	shaderScript = document.getElementById('2d-fragment-shader');
	shaderSource = shaderScript.textContent || shaderScript.text;
	fragmentShader = gl.createShader(gl.FRAGMENT_SHADER); //create the fragment from script
	gl.shaderSource(fragmentShader, shaderSource);
	gl.compileShader(fragmentShader);

	if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
		console.error('Fragment shader compile error:\n', gl.getShaderInfoLog(fragmentShader));
		return;
	}

	program = gl.createProgram(); // create the WebGL program.  This variable will be used to inject our javascript variables into the program.
	gl.attachShader(program, vertexShader); // add the shaders to the program
	gl.attachShader(program, fragmentShader); // ^^
	gl.linkProgram(program); // Tell our WebGL application to use the program

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error('Program link error:\n', gl.getProgramInfoLog(program));
		return;
	}

	gl.useProgram(program);

	locationOfResolution = gl.getUniformLocation(program, 'u_resolution');
	locationOfTime = gl.getUniformLocation(program, 'u_time');
	// optional mouse uniforms
	locationOfMouse = gl.getUniformLocation(program, 'u_mouse');
	locationOfXpos = gl.getUniformLocation(program, 'u_xpos');
	locationOfYpos = gl.getUniformLocation(program, 'u_ypos');

	// initial uniforms
	if (locationOfResolution) gl.uniform2f(locationOfResolution, canvas.width, canvas.height);
	if (locationOfTime) gl.uniform1f(locationOfTime, currentTime);

	// mouse tracking
	window.addEventListener('mousemove', function (e) {
		mouse[0] = e.clientX;
		mouse[1] = e.clientY;
	});

	// set clear color
	gl.clearColor(0.0, 0.0, 0.0, 1.0);

	requestAnimationFrame(render);
}

function render() {
	var now = new Date().getTime();
	currentTime = (now - startTime) / 1000; // update the current time for animations

	if (locationOfTime) gl.uniform1f(locationOfTime, currentTime);
	if (locationOfMouse) gl.uniform2f(locationOfMouse, mouse[0], mouse[1]);
	if (locationOfXpos) gl.uniform1f(locationOfXpos, mouse[0]);
	if (locationOfYpos) gl.uniform1f(locationOfYpos, mouse[1]);

	// ensure viewport and resolution uniform are correct
	gl.viewport(0, 0, canvas.width, canvas.height);
	if (locationOfResolution) gl.uniform2f(locationOfResolution, canvas.width, canvas.height);

	// clear and draw
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	var positionLocation = gl.getAttribLocation(program, 'a_position');
	gl.enableVertexAttribArray(positionLocation);
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
	gl.drawArrays(gl.TRIANGLES, 0, 6);

	requestAnimationFrame(render);
}

window.addEventListener('load', function (event) {
	init();
});

function resizeCanvas() {
	canvas = document.getElementById('glscreen');
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}

window.addEventListener('resize', function (event) {
	resizeCanvas();
	if (gl && locationOfResolution) gl.uniform2f(locationOfResolution, canvas.width, canvas.height);
});

