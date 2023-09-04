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
  var translationLocation = gl.getUniformLocation(program, "u_translation");
  var rotationLocation = gl.getUniformLocation(program, "u_rotation");

  // Create a buffer to put positions in
  var positionBuffer = gl.createBuffer();
  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  var translation = {x: canvas.clientWidth/4, y: canvas.clientHeight / 4};
  // var translation = {x: 0, y: 0}
  var angle = 0;
  var rotation = [0, 1]
  var recWidth = 50;
  var recHeight = 50;
  var color = [Math.random(), Math.random(), Math.random(), 1];
  var speed = 10;

  console.log(translation);

  document.addEventListener("keydown", updatePosition());
  document.addEventListener("wheel", updateRotation());

  function updatePosition() {
    return function(event) {
      // console.log("Avant");
      // console.log(translation);
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
      // console.log("Après");
      // console.log(translation);
      drawScene();
    };
  }

  function updateRotation() {
    return function(event) {
      event.preventDefault();
  
      angle += (event.deltaY * -0.005) % 360;
    
      // Restrict angle
      // angle = Math.min(Math.max(0, angle), 360);

      rotation = [
        Math.cos(angle), 
        Math.sin(angle)
      ];
      console.log(angle);
      console.log(rotation);
      drawScene();
    }
    
  }

  // RENDERING
  function drawScene() {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas
    // gl.clearColor(0, 0, 0, 0);
    
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    gl.enableVertexAttribArray(positionAttributeLocation);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    drawRectangle(gl, {x:translation.x, y:translation.y}, recWidth, recHeight);
        
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

    gl.uniform2fv(translationLocation, [translation.x, translation.y]);

    gl.uniform2fv(rotationLocation, rotation);

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

main();