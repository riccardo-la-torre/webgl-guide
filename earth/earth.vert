uniform mat4 u_ModelMatrix;
uniform mat4 u_NormalMatrix;
attribute vec4 a_Position;
attribute vec4 a_Normal;
attribute vec2 a_TexCoord;
varying vec2 v_TexCoord;
varying vec3 v_Normal;
void main() {
  gl_Position = u_ModelMatrix * a_Position;
  v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));
  v_TexCoord = a_TexCoord;
}
