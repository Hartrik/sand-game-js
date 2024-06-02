#version 300 es

precision mediump float;

in vec2 v_texcoord;
out vec4 v_color;

uniform sampler2D u_element_heads;
uniform sampler2D u_element_tails;
uniform sampler2D u_blur;
uniform sampler2D u_temperature_palette;

// --- common

#define TEMP_PALETTE_SIZE 91.0

float countTemperaturePaletteIndex(float c) {
    float k = c + 273.0;  // 0 C = 273 K
    if (k < 1000.0) {
        return 0.0;
    } else {
        return floor(k / 100.0 - 10.0);
    }
}

void applyTemperature(float temperature, int heatType, inout float r, inout float g, inout float b) {
    float tFactor;
    float aFactor = 0.001;
    if (heatType == 0x01) {
        tFactor = 0.5;
    } else if (heatType == 0x02) {
        tFactor = 1.0;
    } else {  // heatType == 0x03
        tFactor = 1.45;
    }

    float sTemp = (temperature * 255.0 * 10.0) * tFactor;
    float i = countTemperaturePaletteIndex(sTemp);
    vec4 color = texture(u_temperature_palette, vec2((i + 0.5) / TEMP_PALETTE_SIZE, 0.5));
    float cr = color[0];
    float cg = color[1];
    float cb = color[2];

    float alpha = 1.0 - sTemp * aFactor;

    // alpha blending
    r = (r * alpha) + (cr * (1.0 - alpha));
    g = (g * alpha) + (cg * (1.0 - alpha));
    b = (b * alpha) + (cb * (1.0 - alpha));
}

// ---

void main() {
    vec4 elementTail = texture(u_element_tails, v_texcoord);
    int flags = int(floor(elementTail[3] * 255.0 + 0.5));
    int blurType = (flags & 0x3);

    if (blurType == 0x00) {  // == BLUR_TYPE_NONE
        // render element
        float r = elementTail[2];  // 0..1
        float g = elementTail[1];
        float b = elementTail[0];

        // apply temperature
        int heatType = (flags >> 4) & 0x3;
        if (heatType > 0) {
            vec4 elementHead = texture(u_element_heads, v_texcoord);
            float temperature = elementHead[3];  // 0..1

            if (temperature >= 0.001) {
                applyTemperature(temperature, heatType, r, g, b);
            }
        }

        v_color = vec4(r, g, b, 1.0);

    } else {
        v_color = texture(u_blur, v_texcoord);
    }
}