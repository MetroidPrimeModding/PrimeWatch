uniform float hotness;
uniform vec3 lightDirection;
uniform vec3 ambientColor;
uniform vec3 directionalColor;
varying vec3 fragNormal;

void main() {
    if (!gl_FrontFacing) {
        discard;
    }

    float directionalLight = clamp(dot(fragNormal, lightDirection), 0.0, 1.0);
    vec3 actualDirColor = directionalColor * directionalLight * 0.4;

    float actualHotness = clamp(hotness, 0.0, 1.0);
    vec3 hotnessColor = actualHotness * vec3(0.4, 0.4, 0.4) + actualHotness * directionalLight * vec3(0.4, 0.4, 0.4);


    gl_FragColor = vec4(ambientColor + actualDirColor + hotnessColor, 1);
}