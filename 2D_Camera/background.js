/**
 * https://stackoverflow.com/questions/50266930/fragment-shader-generated-interactive-grid
 * @param {*} gl 
 * @param {*} zoom 
 * @param {*} position 
 */
function background(gl, zoom, position = {x: 0, y:0}) {
    var gridProgram = webglUtils.createProgramFromScripts(gl, ["vertex-shader-2d-grid", "fragment-shader-2d-grid"]);

    // look up where the vertex data needs to go.
    var positionAttributeLocation = gl.getAttribLocation(gridProgram, "a_position");

    // lookup uniforms
    var colorLocation = gl.getUniformLocation(gridProgram, "u_color");;
    var transformLocation = gl.getUniformLocation(gridProgram, "u_gridtransform");

    // Create a buffer to put positions in
    var gridBuffer = gl.createBuffer();

    var positions = [];
    
    

    var offset = {x: 0, y: 0};

    var gridLevel = Math.log10(zoom);
    const gridFract = euclideanModulo(gridLevel, 1);
    var gridZoom = Math.pow(10, Math.floor(gridLevel));

    var interval = 10 * gridZoom;

    var rotation = {x: 0, y: 1};
    var n = 0;

    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(gridProgram);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.enableVertexAttribArray(positionAttributeLocation);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, gridBuffer);

    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = true; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

    // set the color
    gl.uniform4fv(colorLocation, [1, 0, 0, 1]);

    // Multiply the matrices.
    var matrix = m3.projection(gl.canvas.clientWidth, gl.canvas.clientHeight);
    // matrix = m3.translate(matrix, 0, 0);
    matrix = m3.translate(matrix, position.x, position.y);
    matrix = m3.rotate(matrix, (0) * (Math.PI/180));
    matrix = m3.scale(matrix, gridZoom, gridZoom);

    gl.uniformMatrix3fv(transformLocation, false, matrix);

    drawGrid();

    function drawGrid() {
        for (let i = 0; i <= gl.canvas.width; i += interval) {
            for (let j = 0; j <= gl.canvas.height; j += interval) {
                positions.push(i, j-interval, i, i*j);
                positions.push(i-interval, j, j*i, j);
            }
        }

        // Set the vertex data for all lines
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        
        // Draw all lines at once
        gl.drawArrays(gl.LINES, 0, positions.length / 2);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }
}