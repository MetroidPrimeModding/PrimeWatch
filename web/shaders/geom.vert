varying vec3 fragNormal;

void main() {
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( position, 1.0 );
    fragNormal = normal;
}