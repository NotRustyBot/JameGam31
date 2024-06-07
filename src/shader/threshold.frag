#version 150 core
#ifdef ARB_explicit_attrib_location
#define useLayout layout(location = 2)
#else
#define useLayout  //thats an empty space
#endif
//header ends here
in vec2 vTextureCoord;

out vec4 finalColor;

uniform sampler2D uTexture;
uniform float uTime;

void main() {
    finalColor = normalize(texture(uTexture, vTextureCoord + vec2((sin(uTime * 5. + vTextureCoord.y * 10.)) * 0.5 * (vTextureCoord.y), 0.)));
}