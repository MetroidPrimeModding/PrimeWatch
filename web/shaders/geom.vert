varying vec3 fragNormal;
varying vec3 fragColor;

void main() {
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( position, 1.0 );
    fragNormal = normal;
    fragColor = color;
}