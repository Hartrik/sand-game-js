import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import image from '@rollup/plugin-image';
import { string } from "rollup-plugin-string";
import terser from '@rollup/plugin-terser';
import pkg from './package.json';

export default [
    // browser-friendly UMD build
    {
        input: 'src/main.js',
        output: {
            name: 'SandGameJS',
            file: pkg.browser,
            format: 'umd'
        },
        plugins: [
            resolve(), // so Rollup can find libraries
            commonjs(), // so Rollup can convert libraries to an ES modules
            image({
                include: "**/*.png",
                exclude: []
            }),
            string({
                include: "**/*.svg",
                exclude: []
            })
        ]
    },

    // browser-friendly UMD build, MINIMIZED
    {
        input: 'src/main.js',
        output: {
            name: 'SandGameJS',
            file: pkg.browser_min,
            format: 'umd'
        },
        plugins: [
            resolve(), // so Rollup can find libraries
            commonjs(), // so Rollup can convert libraries to an ES modules
            image({
                include: "**/*.png",
                exclude: []
            }),
            string({
                include: "**/*.svg",
                exclude: []
            }),

            terser()
        ]
    }
];
