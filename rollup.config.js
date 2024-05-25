import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import image from '@rollup/plugin-image';
import json from '@rollup/plugin-json';
import { string } from "rollup-plugin-string";
import terser from '@rollup/plugin-terser';
import postcss from 'rollup-plugin-postcss';
import header from "postcss-header";
import cssnano from "cssnano";
import copy from 'rollup-plugin-copy';
import pkg from './package.json';

const PLUGINS_COMMON = [
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
            "**/assets/tools/*.svg",
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


let SGJS_OUTPUTS = [
    {
        // browser-friendly UMD build
        name: 'SandGameJS',
        file: 'dist/sand-game-js.umd.js',
        banner: pkg.copyright,
        format: 'umd',
        sourcemap: true,
    }
]

let SGJS_DEV_MODULE_OUTPUTS = [
    {
        // browser-friendly UMD build
        name: 'SandGameJS_ModuleDev',
        file: 'dist/sand-game-js_module-dev.umd.js',
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

    PLUGINS_COMMON.push(copy({
        targets: [
            {
                src: 'tools/palette-designer/tool-palette-designer.umd.js',
                dest: 'dist'
            },
            {
                src: 'tools/palette-designer/tool-palette-designer.css',
                dest: 'dist'
            },
            {
                src: 'tools/texture-designer/tool-texture-designer.umd.js',
                dest: 'dist'
            },
            {
                src: 'tools/texture-designer/tool-texture-designer.css',
                dest: 'dist'
            },
            {
                src: 'tools/scenario-ide/tool-scenario-ide.umd.js',
                dest: 'dist'
            },
            {
                src: 'tools/scenario-ide/tool-scenario-ide.css',
                dest: 'dist'
            }
        ]
    }));

    const PLUGINS_MIN = [
        terser({
            sourceMap: true,
            format: {
                preamble: pkg.copyright,
                comments: false
            }
        })
    ];

    SGJS_OUTPUTS.push({
            // browser-friendly UMD build, MINIMIZED
            name: 'SandGameJS',
            file: 'dist/sand-game-js.umd.min.js',
            format: 'umd',
            sourcemap: true,
            plugins: PLUGINS_MIN
    });

    SGJS_DEV_MODULE_OUTPUTS.push({
        // browser-friendly UMD build, MINIMIZED
        name: 'SandGameJS_ModuleDev',
        file: 'dist/sand-game-js_module-dev.umd.min.js',
        format: 'umd',
        sourcemap: true,
        plugins: PLUGINS_MIN
    });
}
export default [
    {
        input: 'src/main.js',
        plugins: PLUGINS_COMMON,
        output: SGJS_OUTPUTS
    },
    {
        input: 'src/style.css',
        plugins: [
            postcss({
                extract: true,
                modules: false,
                sourceMap: true,
                plugins: [
                    cssnano({
                        preset: 'default',
                    }),
                    header({
                        header: pkg.copyright,
                    })
                ],
            }),
        ],
        output: {
            file: 'dist/sand-game-js.css',
        },
        onwarn(warning, warn) {
            if (warning.code === 'FILE_NAME_CONFLICT') return;
            warn(warning);
        }
    },
    {
        input: 'src/module-dev.js',
        plugins: PLUGINS_COMMON,
        output: SGJS_DEV_MODULE_OUTPUTS
    },
];
