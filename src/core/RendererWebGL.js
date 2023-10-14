import { ElementHead } from "./ElementHead";
import { ElementTail } from "./ElementTail";
import { ElementArea } from "./ElementArea";
import { Renderer } from "./Renderer";

// TODO: Currently element tail bytes are stored as floats (0..1) in texture and then transformed back to integers
//       My attempts to use integer texture with texelFetch has failed
//       But at least current solution does not require WebGL 2

/**
 * WebGL renderer.
 *
 * @author Patrik Harag
 * @version 2023-10-14
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

        const vertexShaderBlur = `
            attribute vec4 a_position;
            
            varying vec2 v_texcoord;
            
            void main() {
              gl_Position = a_position;
              v_texcoord = a_position.xy * vec2(0.5, 0.5) + 0.5;
            }
        `;

        const fragmentShaderBlur = `
            precision mediump float;
            
            varying vec2 v_texcoord;
            
            uniform sampler2D u_element_tails;
            uniform sampler2D u_blur;

            float rand(vec2 co) {
                return fract(sin(dot(co.xy, vec2(12.9898,78.233))) * 43758.5453);
            }

            void main() {
                vec4 elementTail = texture2D(u_element_tails, v_texcoord);
                int flags = int(floor(elementTail[3] * 255.0 + 0.5));
            
                if (flags == 0x00) {  // == BLUR_TYPE_NONE
                    // do not render non-blurrable elements
                    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
                    
                } else if (flags == 0x01) {  // == BLUR_TYPE_BACKGROUND
                    // fade out...
                    
                    vec4 blurElementTail = texture2D(u_blur, v_texcoord);
                    float r = blurElementTail[0];  // 0..1
                    float g = blurElementTail[1];
                    float b = blurElementTail[2];
                    
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
                        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
                        
                    } else {
                        gl_FragColor = vec4(nr, ng, nb, 1.0);
                    }
                    
                } else {  // == BLUR_TYPE_1
                    // render element
                    float r = elementTail[2];  // 0..1
                    float g = elementTail[1];
                    float b = elementTail[0];
                    gl_FragColor = vec4(r, g, b, 1.0);
                }
            }
        `;

        const blurProgram = this.#loadProgram(gl, vertexShaderBlur, fragmentShaderBlur);
        const blurProgramLocationElementTails = gl.getUniformLocation(blurProgram, "u_element_tails");
        const blurProgramLocationBlur = gl.getUniformLocation(blurProgram, "u_blur");

        const vertexShaderMerging = `
            attribute vec4 a_position;
            
            varying vec2 v_texcoord;
            
            void main() {
              gl_Position = a_position;

              // Flip Y though so we get the top at 0
              v_texcoord = a_position.xy * vec2(0.5, -0.5) + 0.5;
            }
        `;

        const fragmentShaderMerging = `
            precision mediump float;
            
            varying vec2 v_texcoord;
            
            uniform sampler2D u_element_tails;
            uniform sampler2D u_blur;

            void main() {
                vec4 elementTail = texture2D(u_element_tails, v_texcoord);
                int flags = int(floor(elementTail[3] * 255.0 + 0.5));
                
                if (flags == 0x00) {  // == BLUR_TYPE_NONE
                    // render element
                    float r = elementTail[2];  // 0..1
                    float g = elementTail[1];
                    float b = elementTail[0];
                    gl_FragColor = vec4(r, g, b, 1.0);
                
                } else {
                    gl_FragColor = texture2D(u_blur, v_texcoord);
                }
            }
        `;

        const mergeProgram = this.#loadProgram(gl, vertexShaderMerging, fragmentShaderMerging);
        const mergeProgramLocationElementTails = gl.getUniformLocation(mergeProgram, "u_element_tails");
        const mergeProgramLocationBlur = gl.getUniformLocation(mergeProgram, "u_blur");

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

        const motionBlurFrameBuffer1 = createTextureAndFrameBuffer(gl.TEXTURE1);
        const motionBlurFrameBuffer2 = createTextureAndFrameBuffer(gl.TEXTURE2);

        // ---

        let blurTexture = 1;  // "ping-pong" approach - see above
        this.#doRendering = () => {

            // init element tails texture - TEXTURE0
            const image = new Uint8Array(this.#elementArea.getDataTails());
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.#width, this.#height, 0, gl.RGBA, gl.UNSIGNED_BYTE, image);

            // render blurrable elements and blur into a texture
            // - reduce blur from previous iterations (fading out) and render blurrable elements over
            gl.bindFramebuffer(gl.FRAMEBUFFER, blurTexture === 1 ? motionBlurFrameBuffer1 : motionBlurFrameBuffer2);

            gl.useProgram(blurProgram);
            gl.uniform1i(blurProgramLocationElementTails, 0);  // texture 0
            gl.uniform1i(blurProgramLocationBlur, (blurTexture === 1) ? 2 : 1);  // texture 2 or 1

            gl.drawArrays(gl.TRIANGLES, 0, positions.length / 2);

            // render to canvas
            // - blurrable elements and blur will be merged with elements that cannot be blurred
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);

            gl.useProgram(mergeProgram);
            gl.uniform1i(mergeProgramLocationElementTails, 0);  // texture 0
            gl.uniform1i(mergeProgramLocationBlur, blurTexture);  // texture 1 or 2

            gl.drawArrays(gl.TRIANGLES, 0, positions.length / 2);

            blurTexture = (blurTexture === 1) ? 2 : 1;
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
}