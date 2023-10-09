import { ElementHead } from "./ElementHead";
import { ElementTail } from "./ElementTail";
import { ElementArea } from "./ElementArea";
import { Renderer } from "./Renderer";

/**
 * WebGL test.
 *
 * @author Patrik Harag
 * @version 2023-10-09
 */
export class RendererWebGL extends Renderer {

    /** @type WebGL2RenderingContext */
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

        // ---------------------------- build program
        const program = gl.createProgram();

        const vertexShader = `
            attribute vec4 a_position;
            varying vec2 v_texcoord;
            void main() {
              gl_Position = a_position;

              // assuming a unit quad for position we
              // can just use that for texcoords. Flip Y though so we get the top at 0
              v_texcoord = a_position.xy * vec2(0.5, -0.5) + 0.5;
            }
        `;
        gl.attachShader(program, this.#loadShader(gl, vertexShader, gl.VERTEX_SHADER));
        gl.bindAttribLocation(program, 0, "a_position");

        const fragmentShader = `
            precision mediump float;
            varying vec2 v_texcoord;
            uniform sampler2D u_image;

            void main() {
                // element tail
                vec4 color = texture2D(u_image, v_texcoord);
                
                // map element tail to WebGL color
                float r = color[2];
                float g = color[1];
                float b = color[0];
                gl_FragColor = vec4(r, g, b, 255);
            }
        `;
        gl.attachShader(program, this.#loadShader(gl, fragmentShader, gl.FRAGMENT_SHADER));
        gl.bindAttribLocation(program, 1, "a_textureIndex");

        gl.linkProgram(program);
        this.#checkLinkStatus(gl, program);
        // ----------------------------

        gl.useProgram(program);
        gl.uniform1i(gl.getUniformLocation(program, "u_image"), 0);

        // Setup a unit quad
        var positions = [
            1,  1,
            -1,  1,
            -1, -1,
            1,  1,
            -1, -1,
            1, -1,
        ];
        var vertBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

        const image = new Uint8Array(this.#width * this.#height * 4);
        const dataView = new DataView(image.buffer);
        this.#doRendering = () => {
            // TODO: without copying
            for (let cy = 0; cy < this.#height; cy++) {
                for (let cx = 0; cx < this.#width; cx++) {
                    const elementTail = this.#elementArea.getElementTail(cx, cy);
                    const byteOffset = (this.#width * cy + cx) * 4;
                    dataView.setUint32(byteOffset, elementTail, ElementArea.LITTLE_ENDIAN);
                }
            }

            // make image textures and upload image
            gl.activeTexture(gl.TEXTURE0);
            var imageTex = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, imageTex);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.#width, this.#height, 0, gl.RGBA, gl.UNSIGNED_BYTE, image);

            gl.drawArrays(gl.TRIANGLES, 0, positions.length / 2);
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
     * @param gl {WebGL2RenderingContext} The WebGLRenderingContext to use.
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