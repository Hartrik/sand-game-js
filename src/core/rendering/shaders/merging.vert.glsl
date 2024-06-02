#version 300 es

in vec4 a_position;
out vec2 v_texcoord;

void main() {
    gl_Position = a_position;

    // Flip Y though so we get the top at 0
    v_texcoord = a_position.xy * vec2(0.5, -0.5) + 0.5;
}
