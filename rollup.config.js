import copy from 'rollup-plugin-copy'
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import image from '@rollup/plugin-image';
import json from '@rollup/plugin-json';
import { string } from "rollup-plugin-string";
import terser from '@rollup/plugin-terser';
import pkg from './package.json';

const PLUGINS_COMMON = [
    copy({
        targets: [
            { src: 'src/style.css', dest: 'dist', rename: 'sand-game-js.css' }
        ]
    }),

    resolve(), // so Rollup can find libraries
    commonjs(), // so Rollup can convert libraries to an ES modules

    image({
        include: [
            "**/assets/**.png",
            "**/assets/brushes/**.png",
            "**/assets/templates/**.png"
        ],
        exclude: []
    }),
    string({
        include: [
            "**/assets/*.svg",
            "**/assets/*.csv",
            "**/assets/brushes/*.csv",
        ],
        exclude: []
    }),
    json({
        compact: true,
        include: [
            "**/assets/structures/*.json",
        ],
        exclude: []
    })
];


let OUTPUTS = [
    {
        // browser-friendly UMD build
        name: 'SandGameJS',
        file: 'dist/sand-game-js.umd.js',
        banner: pkg.copyright,
        format: 'umd',
        sourcemap: true,
    }
]

const devBuild = process.env.npm_lifecycle_script.endsWith('-w');
if (devBuild) {
    console.log('DEV build');
} else {
    console.log('PROD build');

    const PLUGINS_MIN = [
        terser({
            sourceMap: true,
            format: {
                preamble: pkg.copyright,
                comments: false
            }
        })
    ];

    OUTPUTS.push({
            // browser-friendly UMD build, MINIMIZED
            name: 'SandGameJS',
            file: 'dist/sand-game-js.umd.min.js',
            format: 'umd',
            sourcemap: true,
            plugins: PLUGINS_MIN
    });
}

export default [
    {
        input: 'src/main.js',
        plugins: PLUGINS_COMMON,
        output: OUTPUTS
    },
];
