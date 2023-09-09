function main()
{
  // INITIALIZATION
  // WebGL context creation
  var canvas = document.querySelector("canvas");
  var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

  if(!gl)
  {
      console.log("No WebGL !");
      return;
  }

  // setup GLSL program
  var program = webglUtils.createProgramFromScripts(gl, ["vertex-shader-2d", "fragment-shader-2d"]);

  // look up where the vertex data needs to go.
  var positionAttributeLocation = gl.getAttribLocation(program, "a_position");

  // lookup uniforms
  var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
  var colorLocation = gl.getUniformLocation(program, "u_color");;
  var transformLocation = gl.getUniformLocation(program, "u_transform");

  // Create a buffer to put positions in
  var positionBuffer = gl.createBuffer();
  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  
  var translation = {x: canvas.clientWidth / 2, y: canvas.clientHeight / 2};
  var zoom = 1;
  var angle = 0;
  var recSize = {width: 50, height: 50};
  var color = [Math.random(), Math.random(), Math.random(), 1];
  var speed = 10;
  var scale = [zoom, zoom];
  

  console.log(translation);

  document.addEventListener("keydown", updatePosition());
  document.addEventListener("wheel", updateRotation());

  function updatePosition() {
    return function(event) {
      var redraw = false;
      
      switch(event.code)
      {
        case "ArrowUp":
          translation.y -= speed;
          redraw = true;
          break;
        case "ArrowDown":
          translation.y += speed;
          redraw = true;
          break;
        case "ArrowLeft":
          translation.x -= speed;
          redraw = true;
          break;
        case "ArrowRight":
          translation.x += speed;
          redraw = true;
          break;
      }

      if(redraw)
        drawScene();
    };
  }

  function updateRotation() {
    return function(event) {
      // event.preventDefault();

      const amount = event.deltaY;
      if (event.deltaY < 0) {
        zoom *= 1 - clamp(event.deltaY / -500, 0, 1);
      } else {
        zoom *= 1 + clamp(event.deltaY / 500, 0, 1);
      }
      zoom = clamp(zoom, 0.0001, 10000);

      drawScene();
    }
  }

  webglUtils.resizeCanvasToDisplaySize(gl.canvas);

  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Clear the canvas
  gl.clearColor(0.2, 0.2, 0.2, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // RENDERING
  function drawScene() {

    // Clear the canvas
    gl.clearColor(0.2, 0.2, 0.2, 1);
    // gl.clear(gl.COLOR_BUFFER_BIT);

    background(gl, zoom, {x: gl.canvas.width/2 - translation.x, y: gl.canvas.height/2 - translation.y});

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    gl.enableVertexAttribArray(positionAttributeLocation);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        
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
  
    // Multiply the matrices.
    var matrix = m3.projection(gl.canvas.clientWidth, gl.canvas.clientHeight);
    matrix = m3.translate(matrix, gl.canvas.clientWidth/2, gl.canvas.clientHeight/2);
    // matrix = m3.translate(matrix, translation.x, translation.y);
    matrix = m3.translate(matrix, recSize.width/2, recSize.height/2);
    matrix = m3.rotate(matrix, (angle) * (Math.PI/180));
    matrix = m3.translate(matrix, -recSize.width/2, -recSize.height/2);
    matrix = m3.scale(matrix, zoom, zoom);

    gl.uniformMatrix3fv(transformLocation, false, matrix);

    drawRectangle(gl, {x:0, y:0}, recSize.width, recSize.height);
    
    // gl.bufferData(gl.ARRAY_BUFFER, null, gl.STATIC_DRAW);
    
  }

  
  drawScene();
  // console.log(gl.getBufferSubData);
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

  var primitiveType = gl.TRIANGLES;
  var offset = 0;
  gl.drawArrays(primitiveType, offset, 6);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

main();