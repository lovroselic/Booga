#version 300 es
///vShader2D///
/*
* v1.0 Froggess
*/

#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

in vec2 aVertexPosition;
in vec2 aTextureCoord;

uniform mat4 uViewProjectionMatrix;
uniform mat4 uModelMatrix;

// x = uv offset x
// y = uv offset y
// z = uv scale x
// w = uv scale y
uniform vec4 uUVRect;

out vec2 vTextureCoord;

void main(void) {
    vec4 worldPos = uModelMatrix * vec4(aVertexPosition, 0.0, 1.0);

    gl_Position = uViewProjectionMatrix * worldPos;

    vTextureCoord = uUVRect.xy + aTextureCoord * uUVRect.zw;
}