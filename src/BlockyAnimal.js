// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
    'precision mediump float;\n' +
    'attribute vec4 a_Position;\n' +
    'attribute vec2 a_UV;\n' +
    'varying vec2 v_UV;\n' +
    'uniform mat4 u_ModelMatrix;\n' +
    'uniform mat4 u_GlobalRotateMatrix;\n' +
    'uniform mat4 u_ViewMatrix;\n' +
    'uniform mat4 u_ProjectionMatrix;\n' +
    'void main() {\n' +
    '  gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;\n' +
    '  v_UV = a_UV;\n' +
    '}\n';

// Fragment shader program
var FSHADER_SOURCE =
    'precision mediump float;\n' +
    'varying vec2 v_UV;\n' +
    'uniform vec4 u_FragColor;\n' +
    'uniform sampler2D u_Sampler0;\n' +
    'uniform sampler2D u_Sampler1;\n' +
    'uniform int u_whichTexture;\n' +
    'void main() {\n' +
    '  if(u_whichTexture == -2) { \n' +
    '    gl_FragColor = u_FragColor;\n' + // Use color

    '  } else if (u_whichTexture == -1) { \n' +
    '    gl_FragColor = vec4(v_UV,1.0,1.0);\n' + // Use UV debug color
    '  } else if (u_whichTexture == 0) { \n' +
    '    gl_FragColor = texture2D(u_Sampler0,v_UV);\n' + // Use Texture0
    '  } else if (u_whichTexture == 1) { \n' +
    '    gl_FragColor = texture2D(u_Sampler1,v_UV);\n' + // Use Texture1
    '  } else { \n' +
    '    gl_FragColor = vec4(1,0.2,0.2,1); \n' + // Error, put redish
    '  } \n' +
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
let u_Sampler0;
let u_Sampler1;
let u_whichTexture;
let u_ProjectionMatrix;
let u_ViewMatrix;

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

    // Get the storage location of u_whichTexture
    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if (!u_whichTexture) {
        console.log('Failed to get the storage location of u_whichTexture');
        return;
    }

    // Connect up u_ModelMatrix variable
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }

    // Connect up u_Sampler0 variable
    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if (!u_Sampler0) {
        console.log('Failed to get the storage location of u_Sampler0');
        return;
    }

     // Connect up u_Sampler1 variable
     u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
     if (!u_Sampler1) {
         console.log('Failed to get the storage location of u_Sampler1');
         return;
     }
    
    // Connect up u_ProjectionMatrix variable
    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) {
        console.log('Failed to get the storage location of u_ProjectionMatrix');
        return;
    }

    // Connect up u_ViewMatrix variable
    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) {
        console.log('Failed to get the storage location of u_ViewMatrix');
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

function initTextures(){

    let image = new Image(); // Create an image object
    let scary_image = new Image();

    // Pass image to GPU once image loaded
    image.onload = function () { sendTextureToGLSL(image); };
    image.src = './img/sky.jpg';

    scary_image.onload = function () { sendTextureToGLSL2(scary_image); };
    scary_image.src = './img/enemy.png';

    // Add more textures here!

    return true;
}

// Would need to make new version for each texture or make edits to some things!
function sendTextureToGLSL(imageA) {

    var textureA = gl.createTexture(); // Create a texture object

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis

    // Enable the texture unit 0
    gl.activeTexture(gl.TEXTURE0);

    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, textureA);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, imageA);

    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler0, 0);
}

// Would need to make new version for each texture or make edits to some things!
function sendTextureToGLSL2(imageB) {

    var textureB = gl.createTexture(); // Create a texture object

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis

    // Enable the texture unit 1
    gl.activeTexture(gl.TEXTURE1);

    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, textureB);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, imageB);

    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler1, 1);
}

// Could use vector class too
var g_eye = [0,0,3];
var g_at = [0,0,-100];
var g_up = [0,1,0];

function renderAllShapes() {

    var startTime = performance.now();

    var projMat = new Matrix4();
    projMat.setPerspective(60,canvas.width/canvas.height,0.1,100); // w / h is aspect ratio // 1 is near plane // 100 is far plane
    gl.uniformMatrix4fv(u_ProjectionMatrix,false,projMat.elements);

    var viewMat = new Matrix4();
    viewMat.setLookAt(g_eye[0],g_eye[1],g_eye[2], g_at[0],g_at[1],g_at[2], g_up[0],g_up[1],g_up[2]); // Where, looking at,
    gl.uniformMatrix4fv(u_ViewMatrix,false,viewMat.elements);

    var globalRotMat = new Matrix4().rotate(g_main_rotation_x, 0, 1, 0);
    globalRotMat.rotate(g_main_rotation_y,1,0,0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);

    var body = new Cube();
    body.color = [1, 1, 1, 1];
    body.textureNum = 0;
    body.matrix.scale(0.5, 0.4, 0.5);
    body.matrix.translate(-0.5, -0.5, -0.5);
    body.render();

    var scary_cube = new Cube();
    scary_cube.color = [1, 1, 1, 1];
    scary_cube.textureNum = 1;
    scary_cube.matrix.scale(0.5, 0.4, 0.5);
    scary_cube.matrix.translate(1, -0.5, -0.5);
    scary_cube.render();

    var ground = new Cube();
    ground.color = [1, 1, 0, 1];
    ground.textureNum = -2;
    ground.matrix.scale(10,1, 10);
    ground.matrix.translate(-0.5, -1.25, -0.5);
    ground.render();

    var sky = new Cube();
    sky.color = [1, 1, 1, 1];
    sky.textureNum = 0;
    sky.matrix.scale(50, 50, 50);
    sky.matrix.translate(-0.5, -0.5, -0.5);
    sky.render();

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