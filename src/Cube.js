class Cube {
    constructor() {
        this.type = 'cube';

        this.color = [1.0, 1.0, 1.0, 1.0];

        this.matrix = new Matrix4();
        this.textureNum = 0;
    }
    render() {

        var rgba = this.color;

        gl.uniform1i(u_whichTexture,this.textureNum);

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Front face
        drawTriangle3DUV([0,0,0,  1,1,0,   1,0,0], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([0,0,0,  0,1,0,   1,1,0], [0,0, 0,1, 1,1]);

        gl.uniform4f(u_FragColor, rgba[0] * 0.9, rgba[1] * 0.9, rgba[2] * 0.9, rgba[3]);

        // Top face
        drawTriangle3DUV([0,1,0,  0,1,1,   1,1,1], [0,0, 0,1, 1,1]);
        drawTriangle3DUV([0,1,0,  1,1,1,   1,1,0], [0,0, 1,1, 1,0]);

        gl.uniform4f(u_FragColor, rgba[0] * 0.7, rgba[1] * 0.7, rgba[2] * 0.7, rgba[3]);

        // Right face
        drawTriangle3DUV([1,0,0,  1,1,1,   1,0,1], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([1,0,0,  1,1,0,   1,1,1], [0,0, 0,1, 1,1]);

        // Left face
        drawTriangle3DUV([0,1,1,  0,1,0,   0,0,1], [0,1, 1,1, 0,0]);
        drawTriangle3DUV([0,1,0,  0,0,0,   0,0,1], [1,1, 1,0, 0,0]);

        // Back face
        drawTriangle3DUV([0,0,1,  1,0,1,   1,1,1], [1,0, 0,0, 0,1]);
        drawTriangle3DUV([0,0,1,  1,1,1,   0,1,1], [1,0, 0,1, 1,1]);

        // Bottom Face
        drawTriangle3DUV([0,0,1,  1,0,0,   1,0,1], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([0,0,1,  0,0,0,   1,0,0], [0,0, 0,1, 1,1]);
        
    }
}
