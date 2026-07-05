#version 300 es
///fShader2D///
/*
* v1.0 Froggess
*/

#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

in vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform vec4 uTint;

out vec4 outColor;

void main(void) {
    vec4 texel = texture(uSampler, vTextureCoord);

    outColor = texel * uTint;
}