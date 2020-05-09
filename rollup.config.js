import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import livereload from 'rollup-plugin-livereload';
import typescript from 'rollup-plugin-typescript2';
import sass from 'rollup-plugin-sass';
import json from 'rollup-plugin-json';
import { terser } from 'rollup-plugin-terser';
import tailwind from 'rollup-plugin-tailwindcss';
import postcss from 'rollup-plugin-postcss';
import purgecss from '@fullhuman/postcss-purgecss';
import rimraf from "rimraf";
import copy from "rollup-plugin-copy";
import nodeResolve from "@rollup/plugin-node-resolve";
import cleanup from "rollup-plugin-cleanup";
import nodePolyfills from 'rollup-plugin-node-polyfills';
import { getBabelOutputPlugin } from '@rollup/plugin-babel';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';


const production = !process.env.ROLLUP_WATCH;
const outputDir = 'lib';
const entryDir = 'src';
const entry = `${entryDir}/main.ts`;
const namespace = 'mongox';

export const lib = () => {
	return {
		input: `${entry}`,
		inlineDynamicImports: true,
		output: [
			{ format: 'esm', file: `${outputDir}/main.esm.js`, name: `${namespace}`, sourcemap: !production, },
			{ format: 'cjs', file: `${outputDir}/main.cjs.js`, name: `${namespace}`, sourcemap: !production },
			{ format: 'umd', file: `${outputDir}/main.umd.js`, name: `${namespace}`, sourcemap: !production }
		],
		plugins: [
			postcss({
				plugins: [
					require('tailwindcss'),
					require('autoprefixer'),
					purgecss({
						content: ['./src/**/*.html', './src/**/*.svelte', './src/**/*.ts']
					})
				]
			}),
			json(),
			sass({
				all: true,
				output: `${outputDir}/${namespace}.css`,
				map: !production,
				minify: production,
			}),
			typescript({
				tsconfig: 'tsconfig.json'
			}),
			svelte({
				dev: !production,
				css: (css) => {
					// detach css from svelte
					css.write(`${outputDir}/${namespace}-modules.css`);
				}
			}),
			// peerDepsExternal(),
			// nodePolyfills(),
			resolve({
				browser: false,
				dedupe: ['svelte']
			}),
			commonjs({
				include: /node_modules/
			}),
			production && terser()
		],
		watch: {
			clearScreen: false
		}
	};
}

export default [
	lib(),
];
