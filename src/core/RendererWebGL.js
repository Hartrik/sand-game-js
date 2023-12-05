import { ElementHead } from "./ElementHead";
import { ElementTail } from "./ElementTail";
import { ElementArea } from "./ElementArea";
import { Renderer } from "./Renderer";

import _ASSET_PALETTE_TEMPERATURE_COLORS from './assets/temperature.palette.csv';

// TODO: Currently element tail bytes are stored as floats (0..1) in texture and then transformed back to integers

/**
 * WebGL renderer.
 *
 * @author Patrik Harag
 * @version 2023-12-05
 */
export class RendererWebGL extends Renderer {

    /** @type WebGLRenderingContext */
    #context;

    /** @type ElementArea */
    #elementArea;

    /** @type number */
    #width;
    /** @type number */
    #height;

    #doRendering;

    constructor(elementArea, chunkSize, context) {
        super();
        this.#context = context;
        this.#elementArea = elementArea;
        this.#width = elementArea.getWidth();
        this.#height = elementArea.getHeight();

        const gl = this.#context;

        // --- build programs

        const function_applyTemperature = `
            int countTemperaturePaletteIndex(float c) {
                float k = c + 273.0;  // 0 C = 273 K
                if (k < 1000.0) {
                    return 0;
                } else {
                    return int(floor(k / 100.0 - 10.0)) * 3;
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
                int i = countTemperaturePaletteIndex(sTemp);
                float cr = u_temperature_palette[i];
                float cg = u_temperature_palette[i+1];
                float cb = u_temperature_palette[i+2];
                
                float alpha = 1.0 - sTemp * aFactor;
                
                // alpha blending
                r = (r * alpha) + (cr * (1.0 - alpha));
                g = (g * alpha) + (cg * (1.0 - alpha));
                b = (b * alpha) + (cb * (1.0 - alpha));
            }
        `;

        const vertexShaderBlur = `#version 300 es
            in vec4 a_position;
            
            out vec2 v_texcoord;
            
            void main() {
              gl_Position = a_position;
              v_texcoord = a_position.xy * vec2(0.5, 0.5) + 0.5;
            }
        `;

        const fragmentShaderBlur = `#version 300 es
            precision mediump float;
            
            in vec2 v_texcoord;
            out vec4 v_color;
            
            uniform sampler2D u_element_heads;
            uniform sampler2D u_element_tails;
            uniform sampler2D u_blur;
            uniform float u_temperature_palette[91*3];
            
            ${function_applyTemperature}

            float rand(vec2 co) {
                return fract(sin(dot(co.xy, vec2(12.9898,78.233))) * 43758.5453);
            }

            void main() {
                vec4 elementTail = texture(u_element_tails, v_texcoord);
                int flags = int(floor(elementTail[3] * 255.0 + 0.5));
                int blurType = (flags & 0x3);
            
                if (blurType == 0x0) {  // == BLUR_TYPE_NONE
                    // do not render non-blurrable elements
                    v_color = vec4(1.0, 1.0, 1.0, 1.0);
                    
                } else if (blurType == 0x1) {  // == BLUR_TYPE_BACKGROUND
                    // fade out... using alpha blending with white background
                    
                    vec4 oldPixel = texture(u_blur, v_texcoord);
                    float r = oldPixel[0];  // 0..1
                    float g = oldPixel[1];
                    float b = oldPixel[2];
                    
                    float alpha;  // dynamic alpha
                    float m = max(r, max(g, b));
                    if (m > 0.9) {
                        alpha = 0.875 + (rand(v_texcoord.xy) * 0.1 - 0.05);
                    } else {
                        alpha = 0.775 + (rand(v_texcoord.xy) * 0.04 - 0.02);
                    }
                    float whiteBackground = 1.0 - alpha;
                    
                    float nr = (r * alpha) + whiteBackground;
                    float ng = (g * alpha) + whiteBackground;
                    float nb = (b * alpha) + whiteBackground;
                    
                    if (int(nr * 255.0) == int(r * 255.0)
                            && int(ng * 255.0) == int(g * 255.0)
                            && int(nb * 255.0) == int(b * 255.0)) {
                            
                        // no change - delete blur (otherwise there could be visible remains)
                        v_color = vec4(1.0, 1.0, 1.0, 1.0);
                        
                    } else {
                        v_color = vec4(nr, ng, nb, 1.0);
                    }
                    
                } else {  // == BLUR_TYPE_1
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
                }
            }
        `;

        const blurProgram = this.#loadProgram(gl, vertexShaderBlur, fragmentShaderBlur);
        const blurProgramLocationElementHeads = gl.getUniformLocation(blurProgram, "u_element_heads");
        const blurProgramLocationElementTails = gl.getUniformLocation(blurProgram, "u_element_tails");
        const blurProgramLocationBlur = gl.getUniformLocation(blurProgram, "u_blur");
        const blurProgramLocationTemperaturePalette = gl.getUniformLocation(blurProgram, "u_temperature_palette");

        const vertexShaderMerging = `#version 300 es
            in vec4 a_position;
            
            out vec2 v_texcoord;
            
            void main() {
              gl_Position = a_position;

              // Flip Y though so we get the top at 0
              v_texcoord = a_position.xy * vec2(0.5, -0.5) + 0.5;
            }
        `;

        const fragmentShaderMerging = `#version 300 es
            precision mediump float;
            
            in vec2 v_texcoord;
            out vec4 v_color;
            
            uniform sampler2D u_element_heads;
            uniform sampler2D u_element_tails;
            uniform sampler2D u_blur;
            uniform float u_temperature_palette[91*3];
            
            ${function_applyTemperature}
            
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
        `;

        const mergeProgram = this.#loadProgram(gl, vertexShaderMerging, fragmentShaderMerging);
        const mergeProgramLocationElementHeads = gl.getUniformLocation(mergeProgram, "u_element_heads");
        const mergeProgramLocationElementTails = gl.getUniformLocation(mergeProgram, "u_element_tails");
        const mergeProgramLocationBlur = gl.getUniformLocation(mergeProgram, "u_blur");
        const mergeProgramLocationTemperaturePalette = gl.getUniformLocation(mergeProgram, "u_temperature_palette");

        // --- setup a unit quad

        const positions = [
            1,  1,
            -1,  1,
            -1, -1,
            1,  1,
            -1, -1,
            1, -1,
        ];
        const vertBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

        // --- prepare texture and associated frame buffer for motion blur
        // it is not possible to sample a texture and render to that same texture at the same time
        // two textures needs to be used - "ping-pong" approach

        const createTextureAndFrameBuffer = (textureId) => {
            const motionBlurData = new Uint8Array(this.#elementArea.getDataTails().byteLength).fill(0xFF);
            const motionBlurTexture = gl.createTexture();
            gl.activeTexture(textureId);
            gl.bindTexture(gl.TEXTURE_2D, motionBlurTexture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.#width, this.#height, 0, gl.RGBA, gl.UNSIGNED_BYTE, motionBlurData);

            const motionBlurFrameBuffer = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, motionBlurFrameBuffer);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, motionBlurTexture, 0);

            return motionBlurFrameBuffer;
        }

        const motionBlurFrameBuffer1 = createTextureAndFrameBuffer(gl.TEXTURE2);
        const motionBlurFrameBuffer2 = createTextureAndFrameBuffer(gl.TEXTURE3);

        // --- prepare element heads texture - TEXTURE0
        // move the texture definition into rendering loop to create a memory leak - to test WebGL failure recovery

        const elementHeadsTexture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, elementHeadsTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        // --- prepare element tails texture - TEXTURE1
        const elementTailsTexture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, elementTailsTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        // --- prepare temperature colors

        const temperaturePaletteData = this.#parsePalette(_ASSET_PALETTE_TEMPERATURE_COLORS);

        // ---

        let blurTextureIndex = 2;  // "ping-pong" approach - see above
        this.#doRendering = () => {

            // update element heads texture
            const elementHeads = new Uint8Array(this.#elementArea.getDataHeads());
            gl.bindTexture(gl.TEXTURE_2D, elementHeadsTexture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.#width, this.#height, 0, gl.RGBA, gl.UNSIGNED_BYTE, elementHeads);

            // update element tails texture
            const elementTails = new Uint8Array(this.#elementArea.getDataTails());
            gl.bindTexture(gl.TEXTURE_2D, elementTailsTexture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.#width, this.#height, 0, gl.RGBA, gl.UNSIGNED_BYTE, elementTails);

            // render blurrable elements and blur into a texture
            // - reduce blur from previous iterations (fading out) and render blurrable elements over
            gl.bindFramebuffer(gl.FRAMEBUFFER, blurTextureIndex === 2 ? motionBlurFrameBuffer1 : motionBlurFrameBuffer2);

            gl.useProgram(blurProgram);
            gl.uniform1i(blurProgramLocationElementHeads, 0);  // texture 0
            gl.uniform1i(blurProgramLocationElementTails, 1);  // texture 1
            gl.uniform1i(blurProgramLocationBlur, (blurTextureIndex === 2) ? 3 : 2);  // texture 3 or 2
            gl.uniform1fv(blurProgramLocationTemperaturePalette, temperaturePaletteData);

            gl.drawArrays(gl.TRIANGLES, 0, positions.length / 2);

            // render to canvas
            // - blurrable elements and blur will be merged with elements that cannot be blurred
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);

            gl.useProgram(mergeProgram);
            gl.uniform1i(mergeProgramLocationElementHeads, 0);  // texture 0
            gl.uniform1i(mergeProgramLocationElementTails, 1);  // texture 1
            gl.uniform1i(mergeProgramLocationBlur, blurTextureIndex);  // texture 2 or 3
            gl.uniform1fv(mergeProgramLocationTemperaturePalette, temperaturePaletteData);

            gl.drawArrays(gl.TRIANGLES, 0, positions.length / 2);

            blurTextureIndex = (blurTextureIndex === 2) ? 3 : 2;  // swap textures 2 and 3
        };
    }

    trigger(x, y) {
        // ignore
    }

    /**
     *
     * @param changedChunks {boolean[]}
     * @return {void}
     */
    render(changedChunks) {
        this.#doRendering();
    }

    /**
     *
     * @param gl {WebGLRenderingContext} The WebGLRenderingContext to use.
     * @param vertexShader {string} vertex shader code
     * @param fragmentShader {string} fragment shader code
     * @return {WebGLProgram}
     */
    #loadProgram(gl, vertexShader, fragmentShader) {
        const program = gl.createProgram();

        gl.attachShader(program, this.#loadShader(gl, vertexShader, gl.VERTEX_SHADER));
        gl.bindAttribLocation(program, 0, "a_position");

        gl.attachShader(program, this.#loadShader(gl, fragmentShader, gl.FRAGMENT_SHADER));

        gl.linkProgram(program);
        this.#checkLinkStatus(gl, program);

        return program;
    }

    /**
     *
     * @param gl {WebGLRenderingContext} The WebGLRenderingContext to use.
     * @param shaderSource {string} The shader source.
     * @param shaderType {number} The type of shader.
     * @return {WebGLShader}
     */
    #loadShader(gl, shaderSource, shaderType) {
        // Create the shader object
        const shader = gl.createShader(shaderType);

        // Load the shader source
        gl.shaderSource(shader, shaderSource);

        // Compile the shader
        gl.compileShader(shader);

        // Check the compile status
        const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!compiled) {
            // Something went wrong during compilation; get the error
            const lastError = gl.getShaderInfoLog(shader);
            throw `Error compiling shader: ${lastError}`;
        }

        return shader;
    }

    #checkLinkStatus(gl, program) {
        const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (!linked) {
            // something went wrong with the link
            const lastError = gl.getProgramInfoLog(program);
            throw `Error in program linking: ${lastError}`;
        }
    }

    #parsePalette(palette) {
        return palette.split(/[,\n]/).map(t => Number(t) / 255.0);
    }
}