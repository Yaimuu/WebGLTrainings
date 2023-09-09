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
  var program = webglUtils.createProgramFromScripts(gl, ["vertex-shader-3d", "fragment-shader-3d"]);

  // look up where the vertex data needs to go.
  var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  var colorLocation = gl.getAttribLocation(program, "a_color");
  // lookup uniforms
  var transformLocation = gl.getUniformLocation(program, "u_transform");
  
  var fudgeFactor = 1;
  var translation = {x: canvas.clientWidth / 2, y: canvas.clientHeight / 2, z: -500};
  var angle = 60;
  var speed = 10;
  var scale = {x: 1, y: 1, z: 1};
  var size = {width: 200, height: 200, depth: 200};
  var anchor = {x: size.width/2, y: size.height/2, z: size.depth/2};

  var cube = generateCube({x: 0, y: 0, z: 0}, {width: 200, height: 200, depth: 200});
  console.log(cube);
  
  // Create a buffer to put positions in
  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cube.positions), gl.STATIC_DRAW);
  
  // Create a buffer for colors.
  var colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(cube.colors), gl.STATIC_DRAW);
  
  console.log(translation);

  document.addEventListener("keydown", updatePosition());
  document.addEventListener("wheel", function(e) {
    fudgeFactor = Math.min(Math.max(0, fudgeFactor + e.deltaY * 0.0001), 2);
  });

  function updatePosition() {
    return function(event) {
      let redraw = false;
      switch(event.code)
      {
        case "ArrowUp":
          translation.z -= speed;
          redraw = true;
          break;
        case "ArrowDown":
          translation.z += speed;
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
      // if(redraw)
        // drawScene();
    };
  }

  function updateRotation() {
    return function(event) {
      // angle = (angle + event.deltaY * -0.1) % 360;
      angle = (angle + 1) % 360;
      // console.log(angle);
      drawScene();
    }
  }

  // RENDERING
  function drawScene() {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas
    gl.clearColor(0.2, 0.2, 0.2, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Turn on culling. By default backfacing triangles
    // will be culled.
    gl.disable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    gl.enableVertexAttribArray(positionAttributeLocation);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    
    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 3;          // 3 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
      positionAttributeLocation, size, type, normalize, stride, offset);
    
    // Turn on the color attribute
    gl.enableVertexAttribArray(colorLocation);
  
    // Bind the color buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
      
    // Tell the attribute how to get data out of colorBuffer (ARRAY_BUFFER)
    // size = 4;
    type = gl.UNSIGNED_BYTE;  // the data is 8bit unsigned values
    normalize = true;         // normalize the data (convert from 0-255 to 0-1)
    gl.vertexAttribPointer(colorLocation, size, type, normalize, stride, offset);
    
    var fieldOfViewRadians = 60 * Math.PI/180
    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var zNear = 1;
    var zFar = 2000;
    // Compute the matrices
    var matrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);
    matrix = m4.multiply(matrix, m4.projection(gl.canvas.clientWidth, gl.canvas.clientHeight, 400));
    matrix = m4.translate(matrix, translation.x, translation.y, translation.z);
    matrix = m4.translate(matrix, anchor.x, anchor.y, anchor.z);
    matrix = m4.xRotate(matrix, angle * (Math.PI/180));
    matrix = m4.yRotate(matrix, angle * (Math.PI/180));
    // matrix = m4.zRotate(matrix, angle * (Math.PI/180));
    matrix = m4.translate(matrix, -anchor.x, -anchor.y, -anchor.z);
    matrix = m4.scale(matrix, scale.x, scale.y, scale.z);
    
    gl.uniformMatrix4fv(transformLocation, false, matrix);

    gl.drawArrays(gl.TRIANGLES, 0, cube.positions.length/3);
  }

  drawScene();
  setInterval(updateRotation(), 50);
}

function drawPlane(p1, p2, color) {
  
  var positions = [
    // Triangle 1
    p1.x, p1.y, p1.z,
    p2.x, p2.y, p1.z,
    p2.x, p2.y, p2.z,
    // Triangle 2
    p2.x, p2.y, p2.z,
    p1.x, p1.y, p2.z,
    p1.x, p1.y, p1.z,
  ];

  if(p1.z == p2.z)
  {
    positions = [
      // Triangle 1
      p1.x, p1.y, p1.z,
      p1.x, p2.y, p1.z,
      p2.x, p2.y, p2.z,
      // Triangle 2
      p2.x, p2.y, p2.z,
      p2.x, p1.y, p2.z,
      p1.x, p1.y, p1.z,
    ];
  }

  var colorArray = [];
  for(let i = 0; i < positions.length/3; i++)
  {
    colorArray = colorArray.concat(color);
  }

  return {positions: positions, colors: colorArray};
}

function generateCube(pos, size) {
  let planes = [];
  let positions = [];
  let colors = [];

  // Front
  planes.push(drawPlane(
    {
      x: pos.x, 
      y: pos.y, 
      z: pos.z
    },
    {
      x: pos.x + size.width, 
      y: pos.y + size.height, 
      z: pos.z
    },
    [255, 0, 0]
  ));
  // Back
  planes.push(drawPlane(
    {
      x: pos.x, 
      y: pos.y + size.height, 
      z: pos.z + size.depth
    },
    {
      x: pos.x + size.width, 
      y: pos.y, 
      z: pos.z + size.depth
    },
    
    [0, 255, 0]
  ));
  
  // // Left
  planes.push(drawPlane(
    {
      x: pos.x,
      y: pos.y,
      z: pos.z + size.depth
    },
    {
      x: pos.x, 
      y: pos.y + size.height, 
      z: pos.z
    },
    [255, 255, 0]
  ));
  // Right
  planes.push(drawPlane(
    {
      x: pos.x + size.width,
      y: pos.y,
      z: pos.z
    },
    {
      x: pos.x + size.width, 
      y: pos.y + size.height, 
      z: pos.z + size.depth
    },
    [0, 255, 255]
  ));

  // Top
  planes.push(drawPlane(
    {
      x: pos.x,
      y: pos.y,
      z: pos.z
    },
    {
      x: pos.x + size.width,
      y: pos.y,
      z: pos.z + size.depth
    },
    [0, 0, 255]
  ));
  // Bottom
  planes.push(drawPlane(
    {
      x: pos.x,
      y: pos.y + size.height,
      z: pos.z
    },
    {
      x: pos.x + size.width, 
      y: pos.y + size.height, 
      z: pos.z + size.depth
    },
    [255, 0, 255]
  ));

  console.log(planes);

  planes.forEach(plane => {
    positions = positions.concat(plane.positions);
    colors = colors.concat(plane.colors);
  });
  
  console.log(positions);
  console.log(colors);

  return {positions: positions, colors: colors};
}

main();