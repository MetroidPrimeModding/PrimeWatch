uniform float hotness;
uniform vec3 lightDirection;
uniform vec3 ambientColor;
uniform vec3 directionalColor;
varying vec3 fragNormal;
varying vec3 fragColor;

void main() {
    if (!gl_FrontFacing) {
        discard;
    }

    float diffuseIntensity = clamp(dot(fragNormal, lightDirection), 0.0, 1.0);
    vec3 diffuseLight = fragColor * directionalColor * diffuseIntensity;

    vec3 ambientLight = fragColor * ambientColor;

    gl_FragColor = vec4(ambientLight + diffuseLight, 1);
}