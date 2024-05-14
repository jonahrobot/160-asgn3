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
    'uniform sampler2D u_Sampler2;\n' +
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
    '  } else if (u_whichTexture == 2) { \n' +
    '    gl_FragColor = texture2D(u_Sampler2,v_UV);\n' + // Use Texture1
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
let u_Sampler2;
let u_whichTexture;
let u_ProjectionMatrix;
let u_ViewMatrix;
let global_camera;

const map = [
// First row with all 4s
    [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    

    // Remaining rows with border 4s and inner 0s
    ...Array(13).fill().map(() => [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4]),

    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 5, 4, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],

     // Remaining rows with border 4s and inner 0s
     ...Array(13).fill().map(() => [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4]),

    // Last row with all 4s
    [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4]

  ];

function drawMap(){

    // Draw out 4 chunks!
        for(x=0;x<32;x++){
            for(y=0;y<32;y++){
                if(map[x][y]>= 1){
                    for(z=0;z<map[x][y];z++){
                        var body = new Cube();
                        body.color = [1,1,1,1];
                        body.textureNum = 2;
                        body.matrix.translate(x-16,-0.75 + z,y-16);
                        body.render();
                    }
                }
            }
        }
    
}

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

     
     u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
     if (!u_Sampler2) {
         console.log('Failed to get the storage location of u_Sampler2');
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

   // document.getElementById('main_rotation_x').addEventListener('mousemove', function () { g_main_rotation_x = this.value; renderAllShapes(); });
    //document.getElementById('main_rotation_y').addEventListener('mousemove', function () { g_main_rotation_y = this.value; renderAllShapes(); });
}

function main() {

    setupWebGl();
    setupGLSL();

    // Setup actions for HTML elements
    setupHTMLUIActions();

    global_camera = new Camera();
    document.onkeydown = keydown;

    document.addEventListener("mousemove", function(event) {
        global_camera.panHorizontal(-1 * event.movementX);
        global_camera.panVertical(-1 *event.movementY )
    });


    // onmousemove = function(e){
    //     console.log(`mouse location = X: ${e.x}, Y: ${e.y}`)

    //     global_camera.panLeft();
    //     global_camera.update();

    //     renderAllShapes();
    // }

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
    let ice = new Image();

    // Pass image to GPU once image loaded
    image.onload = function () { sendTextureToGLSL(image); };
    image.src = './img/sky.jpg';

    scary_image.onload = function () { sendTextureToGLSL2(scary_image); };
    scary_image.src = './img/enemy.png';

    ice.onload = function () { sendTextureToGLSL3(ice); };
    ice.src = './img/ice.jpg';

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


// Would need to make new version for each texture or make edits to some things!
function sendTextureToGLSL3(imageC) {

    var textureC = gl.createTexture(); // Create a texture object

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis

    // Enable the texture unit 1
    gl.activeTexture(gl.TEXTURE2);

    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, textureC);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, imageC);

    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler2, 2);
}

function addBlock(x,y,z){
    var g_x = Math.floor(x + 16);
    var g_y = Math.floor(y + 16); 
    map[g_x][g_y] += 1;
    drawMap();
}

function deleteBlock(x,y,z){
    var g_x = Math.floor(x + 16);
    var g_y = Math.floor(y + 16); 
    if(map[g_x][g_y] >= 1){
        map[g_x][g_y] -= 1;
    }
    drawMap();
}

function keydown(ev){

    switch(ev.keyCode){
        case 87: global_camera.moveForward(); break;
        case 65: global_camera.moveLeft(); break;
        case 68: global_camera.moveRight(); break;
        case 83: global_camera.moveBackwards(); break;
        case 81: global_camera.panHorizontal(1); break;
        case 69: global_camera.panHorizontal(-1); break;

        case 67:
            addBlock(global_camera.eye.elements[0],global_camera.eye.elements[2]);
            console.log(global_camera.eye.elements);
            break;
        
        case 86:
            deleteBlock(global_camera.eye.elements[0],global_camera.eye.elements[2]);
            break;

    }

    if(ev.keyCode == 39){ // Right arrow
        global_camera.panHorizontal(-1);
    }else if(ev.keyCode == 37){ // Left arrow
        global_camera.panHorizontal(1);
    }

    renderAllShapes();
}

function renderAllShapes() {

    var startTime = performance.now();

    var viewMatrix = new Matrix4();
    viewMatrix.setLookAt(global_camera.eye.elements[0],global_camera.eye.elements[1],global_camera.eye.elements[2], 
        global_camera.at.elements[0],global_camera.at.elements[1],global_camera.at.elements[2], 
        global_camera.up.elements[0],global_camera.up.elements[1],global_camera.up.elements[2]);

    var projectionMatrix = new Matrix4();
    projectionMatrix.setPerspective(global_camera.fov,canvas.width/canvas.height,0.1,100);

    gl.uniformMatrix4fv(u_ProjectionMatrix,false,projectionMatrix.elements);

    gl.uniformMatrix4fv(u_ViewMatrix,false,viewMatrix.elements);

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

    var scary_cube = new Cube();
    scary_cube.color = [1, 1, 1, 1];
    scary_cube.textureNum = 1;
    scary_cube.matrix.scale(0.5, 0.4, 0.5);
    scary_cube.matrix.translate(14, -0.5, -0.5);
    scary_cube.render();

    var ground = new Cube();
    ground.color = [1, 1, 0, 1];
    ground.textureNum = -2;
    ground.matrix.scale(16,1, 16);
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

    drawMap();
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