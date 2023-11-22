import VSHADER_SOURCE from "./earth.vert";
import FSHADER_SOURCE from "./earth.frag";
import earthImg from "./earth.jpg";

function calcSphereVertexAttribs(hAngle, vAngle, point) {
  const attribs = [];
  attribs.push(...point.elements); // vertex
  point.normalize();
  attribs.push(...point.elements); // normal
  attribs.push(hAngle / 360, 1 - vAngle / 180); // tex coords
  return attribs;
}

function generateSphereGeometry(precision, radius) {
  const angleStep = 180 / precision;
  const attribs = [];
  const transform = new Matrix4();
  const topVertex = new Vector3([0, radius, 0]);
  const bottomVertex = new Vector3([0, -radius, 0]);
  let down = true;
  for (let hAngle = 0; hAngle < 360; hAngle += angleStep) {
    for (
      let vAngle = down ? 0 : 180;
      down ? vAngle < 180 : vAngle > 0;
      vAngle += (down ? 1 : -1) * angleStep
    ) {
      if (vAngle <= 0) {
        attribs.push(...calcSphereVertexAttribs(hAngle, 0, topVertex));
      } else if (vAngle >= 180) {
        attribs.push(...calcSphereVertexAttribs(hAngle, 180, bottomVertex));
      } else {
        transform.setRotate(hAngle, 0, -1, 0);
        transform.rotate(vAngle, -1, 0, 0);
        const point1 = transform.multiplyVector3(topVertex);
        attribs.push(...calcSphereVertexAttribs(hAngle, vAngle, point1));
        transform.setRotate(hAngle + angleStep, 0, -1, 0);
        transform.rotate(vAngle, -1, 0, 0);
        const point2 = transform.multiplyVector3(topVertex);
        attribs.push(
          ...calcSphereVertexAttribs(hAngle + angleStep, vAngle, point2)
        );
      }
    }
    down = !down;
  }
  return new Float32Array(attribs);
}

let rotationAngle = 0;
const degreeXSecond = 10;
let time = Date.now();
const modelMatrix = new Matrix4();
const normalMatrix = new Matrix4();
let u_ModelMatrix;
let u_NormalMatrix;
let u_AmbientColor;
let u_DirColor;
let u_DirDir;
let gl;
let n;
const ambientLightColor = new Vector3([0.5, 0.5, 0.5]);
const dirLightColor = new Vector3([1.0, 1.0, 1.0]);
const dirLightDir = new Vector3([1, 1, -0.5]).normalize();

export function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById("webgl");

  // Get the rendering context for WebGL
  gl = getWebGLContext(canvas);
  if (!gl) {
    console.log("Failed to get the rendering context for WebGL");
    return;
  }

  gl.enable(gl.DEPTH_TEST);

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("Failed to intialize shaders.");
    return;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
  if (!u_ModelMatrix) {
    console.log("Failed to get the storage location of u_ModelMatrix");
    return;
  }

  u_NormalMatrix = gl.getUniformLocation(gl.program, "u_NormalMatrix");
  if (!u_NormalMatrix) {
    console.log("Failed to get the storage location of u_NormalMatrix");
    return;
  }

  u_AmbientColor = gl.getUniformLocation(gl.program, "u_AmbientColor");
  if (!u_AmbientColor) {
    console.log("Failed to get the storage location of u_AmbientColor");
    return;
  }

  u_DirColor = gl.getUniformLocation(gl.program, "u_DirColor");
  if (!u_DirColor) {
    console.log("Failed to get the storage location of u_DirColor");
    return;
  }

  u_DirDir = gl.getUniformLocation(gl.program, "u_DirDir");
  if (!u_DirDir) {
    console.log("Failed to get the storage location of u_DirDir");
    return;
  }

  gl.uniform3fv(u_AmbientColor, ambientLightColor.elements);
  gl.uniform3fv(u_DirColor, dirLightColor.elements);
  gl.uniform3fv(u_DirDir, dirLightDir.elements);

  // Set the vertex information
  n = initVertexBuffers();
  if (n < 0) {
    console.log("Failed to set the vertex information");
    return;
  }

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Set texture
  if (!initTextures()) {
    console.log("Failed to intialize the texture.");
    return;
  }
}

function initVertexBuffers() {
  var vertexData = generateSphereGeometry(30, 1);
  n = Math.round(vertexData.length / 8); // The number of vertices

  // Create the buffer object
  var vertexDataBuffer = gl.createBuffer();
  if (!vertexDataBuffer) {
    console.log("Failed to create the buffer object");
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexDataBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);

  var FSIZE = vertexData.BYTES_PER_ELEMENT;
  //Get the storage location of a_Position, assign and enable buffer
  var a_Position = gl.getAttribLocation(gl.program, "a_Position");
  if (a_Position < 0) {
    console.log("Failed to get the storage location of a_Position");
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 8, 0);
  gl.enableVertexAttribArray(a_Position); // Enable the assignment of the buffer object

  //Get the storage location of a_Normal, assign and enable buffer
  var a_Normal = gl.getAttribLocation(gl.program, "a_Normal");
  if (a_Normal < 0) {
    console.log("Failed to get the storage location of a_Normal");
    return -1;
  }
  gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, FSIZE * 8, FSIZE * 3);
  gl.enableVertexAttribArray(a_Normal); // Enable the assignment of the buffer object

  // Get the storage location of a_TexCoord
  var a_TexCoord = gl.getAttribLocation(gl.program, "a_TexCoord");
  if (a_TexCoord < 0) {
    console.log("Failed to get the storage location of a_TexCoord");
    return -1;
  }
  // Assign the buffer object to a_TexCoord variable
  gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 8, FSIZE * 6);
  gl.enableVertexAttribArray(a_TexCoord); // Enable the assignment of the buffer object

  return n;
}

function initTextures() {
  var texture = gl.createTexture(); // Create a texture object
  if (!texture) {
    console.log("Failed to create the texture object");
    return false;
  }

  // Get the storage location of u_Sampler
  var u_Sampler = gl.getUniformLocation(gl.program, "u_Sampler");
  if (!u_Sampler) {
    console.log("Failed to get the storage location of u_Sampler");
    return false;
  }
  var image = new Image(); // Create the image object
  if (!image) {
    console.log("Failed to create the image object");
    return false;
  }
  // Register the event handler to be called on loading an image
  image.onload = function () {
    loadTexture(texture, u_Sampler, image);
  };
  // Tell the browser to load an image
  image.src = earthImg;

  return true;
}

function loadTexture(texture, u_Sampler, image) {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler, 0);
  tick();
}

function tick() {
  const elapsedSeconds = (Date.now() - time) / 1000;
  rotationAngle = (degreeXSecond * elapsedSeconds) % 360;
  modelMatrix.setRotate(rotationAngle, 0, 1, 0);
  normalMatrix.setInverseOf(modelMatrix).transpose();
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // Clear <canvas>

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
  requestAnimationFrame(tick);
}
