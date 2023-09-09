function main()
{
  // INITIALIZATION
  // WebGL context creation
  var canvas = document.querySelector("canvas");
  var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

  if(!gl)
  {
      console.log("No WebGL !");
  }

  // setup GLSL program
  var program = webglUtils.createProgramFromScripts(gl, ["vertex-shader-2d", "fragment-shader-2d"]);

  // look up where the vertex data needs to go.
  var positionAttributeLocation = gl.getAttribLocation(program, "a_position");

  // lookup uniforms
  var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
  var colorLocation = gl.getUniformLocation(program, "u_color");
  // var translationLocation = gl.getUniformLocation(program, "u_translation");
  // var rotationLocation = gl.getUniformLocation(program, "u_rotation");
  var transformLocation = gl.getUniformLocation(program, "u_transform");

  // Create a buffer to put positions in
  var positionBuffer = gl.createBuffer();
  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  
  var translation = {x: canvas.clientWidth / 2, y: canvas.clientHeight / 2};
  // var translation = {x: 0, y: 0}
  var angle = 0;
  var recSize = {width: 50, height: 50};
  var color = [Math.random(), Math.random(), Math.random(), 1];
  var speed = 10;
  var scale = [1, 1];

  console.log(translation);

  document.addEventListener("keydown", updatePosition());
  document.addEventListener("wheel", updateRotation());

  function updatePosition() {
    return function(event) {
      switch(event.code)
      {
        case "ArrowUp":
          translation.y -= speed;
          break;
        case "ArrowDown":
          translation.y += speed;
          break;
        case "ArrowLeft":
          translation.x -= speed;
          break;
        case "ArrowRight":
          translation.x += speed;
          break;
      }
      drawScene();
    };
  }

  function updateRotation() {
    return function(event) {
      event.preventDefault();

      angle = (angle + event.deltaY * -0.1) % 360;

      drawScene();
    }
  }

  // RENDERING
  function drawScene() {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    gl.enableVertexAttribArray(positionAttributeLocation);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    drawRectangle(gl, {x:0, y:0}, recSize.width, recSize.height);
        
    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

    // set the resolution
    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

    // set the color
    gl.uniform4fv(colorLocation, color);

    // Compute the matrices
    var translationMatrix = m3.translation(translation.x, translation.y);
    var rotationMatrix = m3.rotation(angle * (Math.PI/180));
    var scaleMatrix = m3.scaling(scale[0], scale[1]);
  
    // Multiply the matrices.
    var matrix = m3.multiply(translationMatrix, rotationMatrix);
    matrix = m3.multiply(matrix, scaleMatrix);

    gl.uniformMatrix3fv(transformLocation, false, matrix);

    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 6;
    gl.drawArrays(primitiveType, offset, count);
  }

  drawScene();

}

function createShader(gl, type, source) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
      return shader;
  }

  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }
  
  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

function drawRectangle(gl, pos, width, height)
{
  let p1 = {x: pos.x, y: pos.y};
  let p2 = {x: pos.x + width, y: pos.y + height};

  var positions = [
    p1.x, p1.y,
    p2.x, p1.y,
    p1.x, p2.y,
    p1.x, p2.y,
    p2.x, p1.y,
    p2.x, p2.y,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
}

var m3 = {
  translation: function(tx, ty) {
    return [
      1, 0, 0,
      0, 1, 0,
      tx, ty, 1,
    ];
  },
 
  rotation: function(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);
    return [
      c,-s, 0,
      s, c, 0,
      0, 0, 1,
    ];
  },
 
  scaling: function(sx, sy) {
    return [
      sx, 0, 0,
      0, sy, 0,
      0, 0, 1,
    ];
  },

  multiply: function(a, b) {
    var a00 = a[0 * 3 + 0];
    var a01 = a[0 * 3 + 1];
    var a02 = a[0 * 3 + 2];
    var a10 = a[1 * 3 + 0];
    var a11 = a[1 * 3 + 1];
    var a12 = a[1 * 3 + 2];
    var a20 = a[2 * 3 + 0];
    var a21 = a[2 * 3 + 1];
    var a22 = a[2 * 3 + 2];
    var b00 = b[0 * 3 + 0];
    var b01 = b[0 * 3 + 1];
    var b02 = b[0 * 3 + 2];
    var b10 = b[1 * 3 + 0];
    var b11 = b[1 * 3 + 1];
    var b12 = b[1 * 3 + 2];
    var b20 = b[2 * 3 + 0];
    var b21 = b[2 * 3 + 1];
    var b22 = b[2 * 3 + 2];
    return [
      b00 * a00 + b01 * a10 + b02 * a20,
      b00 * a01 + b01 * a11 + b02 * a21,
      b00 * a02 + b01 * a12 + b02 * a22,
      b10 * a00 + b11 * a10 + b12 * a20,
      b10 * a01 + b11 * a11 + b12 * a21,
      b10 * a02 + b11 * a12 + b12 * a22,
      b20 * a00 + b21 * a10 + b22 * a20,
      b20 * a01 + b21 * a11 + b22 * a21,
      b20 * a02 + b21 * a12 + b22 * a22,
    ];
  },
};

main();