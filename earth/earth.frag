#ifdef GL_ES
precision mediump float;
#endif
uniform sampler2D u_Sampler;
uniform vec3 u_AmbientColor;
uniform vec3 u_DirColor;
uniform vec3 u_DirDir;
varying vec3 v_Normal;
varying vec2 v_TexCoord;
void main() {
  vec4 tex = texture2D(u_Sampler, v_TexCoord);
  float nDotL = dot(v_Normal, u_DirDir); 
  vec3 color = u_AmbientColor * tex.rgb + u_DirColor * tex.rgb * nDotL;
  gl_FragColor = vec4(color, tex.a);
}
