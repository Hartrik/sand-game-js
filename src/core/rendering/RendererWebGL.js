// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import ElementArea from "../ElementArea";
import Renderer from "./Renderer";

import _ASSET_PALETTE_TEMPERATURE_COLORS from './assets/temperature.palette.csv';

import _SHADER_BLUR_VERT from './shaders/blur.vert.glsl';
import _SHADER_BLUR_FRAG from './shaders/blur.frag.glsl';
import _SHADER_MERGING_VERT from './shaders/merging.vert.glsl';
import _SHADER_MERGING_FRAG from './shaders/merging.frag.glsl';


// TODO: Currently element tail bytes are stored as floats (0..1) in texture and then transformed back to integers
// TODO: https://www.khronos.org/webgl/wiki/HandlingContextLost

/**
 * WebGL renderer.
 *
 * @author Patrik Harag
 * @version 2024-06-02
 */
export default class RendererWebGL extends Renderer {

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

        const temperaturePaletteData = this.#parsePalette(_ASSET_PALETTE_TEMPERATURE_COLORS);
        const temperaturePaletteSize = temperaturePaletteData.byteLength / 4;

        const blurProgram = this.#loadProgram(gl, _SHADER_BLUR_VERT, _SHADER_BLUR_FRAG);
        const blurProgramLocationElementHeads = gl.getUniformLocation(blurProgram, "u_element_heads");
        const blurProgramLocationElementTails = gl.getUniformLocation(blurProgram, "u_element_tails");
        const blurProgramLocationBlur = gl.getUniformLocation(blurProgram, "u_blur");
        const blurProgramLocationTemperaturePalette = gl.getUniformLocation(blurProgram, "u_temperature_palette");

        const mergeProgram = this.#loadProgram(gl, _SHADER_MERGING_VERT, _SHADER_MERGING_FRAG);
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

        const temperaturePaletteTexture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE4);
        gl.bindTexture(gl.TEXTURE_2D, temperaturePaletteTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

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

            // update color palette texture
            gl.bindTexture(gl.TEXTURE_2D, temperaturePaletteTexture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, temperaturePaletteSize, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, temperaturePaletteData);

            // render blurrable elements and blur into a texture
            // - reduce blur from previous iterations (fading out) and render blurrable elements over
            gl.bindFramebuffer(gl.FRAMEBUFFER, blurTextureIndex === 2 ? motionBlurFrameBuffer1 : motionBlurFrameBuffer2);

            gl.useProgram(blurProgram);
            gl.uniform1i(blurProgramLocationElementHeads, 0);  // texture 0
            gl.uniform1i(blurProgramLocationElementTails, 1);  // texture 1
            gl.uniform1i(blurProgramLocationBlur, (blurTextureIndex === 2) ? 3 : 2);  // texture 3 or 2
            gl.uniform1i(blurProgramLocationTemperaturePalette, 4);  // texture 4

            gl.drawArrays(gl.TRIANGLES, 0, positions.length / 2);

            // render to canvas
            // - blurrable elements and blur will be merged with elements that cannot be blurred
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);

            gl.useProgram(mergeProgram);
            gl.uniform1i(mergeProgramLocationElementHeads, 0);  // texture 0
            gl.uniform1i(mergeProgramLocationElementTails, 1);  // texture 1
            gl.uniform1i(mergeProgramLocationBlur, blurTextureIndex);  // texture 2 or 3
            gl.uniform1i(mergeProgramLocationTemperaturePalette, 4);  // texture 4

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

        // Check the link status
        if (!gl.getProgramParameter(program, gl.LINK_STATUS) && !gl.isContextLost()) {
            // Something went wrong with the link
            const lastError = gl.getProgramInfoLog(program);
            throw `Error in program linking: ${lastError}`;
        }

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
        if (shader === null) {
            throw 'Error compiling shader: cannot create shader';
        }

        // Load the shader source
        gl.shaderSource(shader, shaderSource);

        // Compile the shader
        gl.compileShader(shader);

        // Check the compile status
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS) && !gl.isContextLost()) {
            // Something went wrong during compilation; get the error
            const lastError = gl.getShaderInfoLog(shader);
            throw `Error compiling shader: ${lastError}`;
        }

        return shader;
    }

    #parsePalette(palette) {
        const colors = palette.split('\n').map(line => line.split(',').map(Number));
        const array = new Uint8Array(colors.length * 4);
        for (let i = 0; i < colors.length; i++) {
            const color = colors[i];
            array[i * 4] = color[0];  // r
            array[i * 4 + 1] = color[1];  // g
            array[i * 4 + 2] = color[2];  // b
        }
        return array;
    }
}