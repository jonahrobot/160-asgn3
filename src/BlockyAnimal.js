// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
    'precision mediump float;\n' +
    'attribute vec4 a_Position;\n' +
    'attribute vec2 a_UV;\n' +
    'varying vec2 v_UV;\n' +
    'uniform mat4 u_ModelMatrix;\n' +
    'uniform mat4 u_GlobalRotateMatrix;\n' +
    'void main() {\n' +
    '  gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;\n' +
    '  v_UV = a_UV;\n' +
    '}\n';

// Fragment shader program
var FSHADER_SOURCE =
    'precision mediump float;\n' +
    'varying vec2 v_UV;\n' +
    'uniform vec4 u_FragColor;\n' +
    'uniform sampler2D u_Sampler0;\n' +
    'void main() {\n' +
    '  gl_FragColor = u_FragColor;\n' +
    '  gl_FragColor = vec4(v_UV,1.0,1.0);\n' +
    '  gl_FragColor = texture2D(u_Sampler0,v_UV);\n' + // find color from sampler at uv cords
    '}\n';

// Globals
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

function setupWebGl() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    //gl = getWebGLContext(canvas);
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true })
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    gl.enable(gl.DEPTH_TEST);
}

function setupGLSL() {
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
        console.log('Failed to get the storage location of a_UV');
        return;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    // Connect up u_Size variable
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }

    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Failed to get the storage location of u_GlobalRotateMatrix');
        return;
    }

    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

// Globals for HTML UI
let g_main_rotation_x = 0;
let g_main_rotation_y = 0;

function setupHTMLUIActions() {

    document.getElementById('main_rotation_x').addEventListener('mousemove', function () { g_main_rotation_x = this.value; renderAllShapes(); });
    document.getElementById('main_rotation_y').addEventListener('mousemove', function () { g_main_rotation_y = this.value; renderAllShapes(); });
}

function main() {

    setupWebGl();
    setupGLSL();

    // Setup actions for HTML elements
    setupHTMLUIActions();

    initTextures(gl,0);

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    renderAllShapes();

    requestAnimationFrame(tick);
}

var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;

function tick() {

    g_seconds = performance.now() / 1000.0 - g_startTime;
    //console.log(g_seconds);

    renderAllShapes();

    requestAnimationFrame(tick);
}

function initTextures(gl, n){
    var texture = gl.createTexture(); // Create a texture object

    // Get the storage location of the u_Sampler
    var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler0');

    var image = new Image(); // Create an image object

    // Register the event handler to be called on loading an image
    image.onload = function () { loadTexture(gl, n, texture, u_Sampler, image); };
    // Tell the browser to load an image
    image.src = './img/sky.jpg'; // texture must be power of 2!

    return true;
}

function loadTexture(gl, n, texture, u_Sampler, image) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    // Enable the texture unit 0
    gl.activeTexture(gl.TEXTURE0);
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler, 0);
}

function renderAllShapes() {

    var startTime = performance.now();

    var globalRotMat = new Matrix4().rotate(g_main_rotation_x, 0, 1, 0);
    globalRotMat.rotate(g_main_rotation_y,1,0,0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Chicken
    var body = new Cube();
    body.color = [1, 1, 1, 1];
    body.matrix.scale(0.5, 0.4, 0.5);
    body.matrix.translate(-0.5, -0.5, -0.5);
    body.render();

    var duration = performance.now() - startTime;
    sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000 / duration) / 10, "numdot");
}

function sendTextToHTML(text, htmlID) {
    var htmlElm = document.getElementById(htmlID);
    if (!htmlElm) {
        console.log("Failed to get " + htmlID + " from HTML");
        return;
    }
    htmlElm.innerHTML = text;
}

function convertCordEventToGL(ev) {
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

    return ([x, y]);
}