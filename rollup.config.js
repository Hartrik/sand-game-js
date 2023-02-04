import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
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
			commonjs() // so Rollup can convert libraries to an ES modules
		]
	},

	// ES module (for bundlers) build.
	{
		input: 'src/SandGameComponent.js',
		external: [
		],
		output: {
			file: pkg.module,
			format: 'es'
		}
	}
];
