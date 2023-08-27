import { ElementTail } from "./ElementTail";
import { ElementArea } from "./ElementArea";
import { Renderer } from "./Renderer";
import { ElementHead } from "./ElementHead";

/**
 * WebGL test.
 *
 * @author Patrik Harag
 * @version 2023-08-27
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
            uniform sampler2D u_palette;
                
            void main() {
                float index = texture2D(u_image, v_texcoord).a * 255.0;
                gl_FragColor = texture2D(u_palette, vec2((index + 0.5) / 256.0, 0.5));
            }
        `;
        gl.attachShader(program, this.#loadShader(gl, fragmentShader, gl.FRAGMENT_SHADER));
        gl.bindAttribLocation(program, 1, "a_textureIndex");

        gl.linkProgram(program);
        this.#checkLinkStatus(gl, program);
        // ----------------------------

        gl.useProgram(program);
        var imageLoc = gl.getUniformLocation(program, "u_image");
        var paletteLoc = gl.getUniformLocation(program, "u_palette");
        // tell it to use texture units 0 and 1 for the image and palette
        gl.uniform1i(imageLoc, 0);
        gl.uniform1i(paletteLoc, 1);

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

        // Setup a palette.
        const paletteSize = 256;
        const palette = new Uint8Array(paletteSize * 4);
        function setPalette(index, r, g, b, a) {
            palette[index * 4] = r;
            palette[index * 4 + 1] = g;
            palette[index * 4 + 2] = b;
            palette[index * 4 + 3] = a;
        }
        setPalette(0, 255, 255, 255, 255); // white
        setPalette(1, 0, 0, 0, 255); // black

        // make palette texture and upload palette
        gl.activeTexture(gl.TEXTURE1);
        var paletteTex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, paletteTex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, paletteSize, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, palette);

        const image = new Uint8Array(this.#width * this.#height);
        this.#doRendering = () => {
            for (let cy = 0; cy < this.#height; cy++) {
                for (let cx = 0; cx < this.#width; cx++) {
                    let elementHead = this.#elementArea.getElementHead(cx, cy);
                    image[cy * this.#width + cx] = ElementHead.getTypeClass(elementHead) === 0 ? 0 : 1;
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
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.ALPHA, this.#width, this.#height, 0, gl.ALPHA, gl.UNSIGNED_BYTE, image);

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