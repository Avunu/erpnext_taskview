#!/usr/bin/env node
/**
 * Post-build script to update Frappe's assets.json with Vite build outputs.
 * Mimics Frappe's esbuild cache-busting scheme.
 *
 * Reads Vite manifests (one per bundle) from the dist folder and maps
 * each entry's hashed filename to a key that Frappe's `app_include_js` /
 * `app_include_css` hooks can resolve via assets.json.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APP_NAME = 'erpnext_taskview';
const SITES_PATH = path.resolve(__dirname, '..', '..', 'sites');
const DIST_PATH = path.resolve(__dirname, APP_NAME, 'public', 'dist');
const ASSETS_JSON_PATH = path.resolve(SITES_PATH, 'assets', 'assets.json');
const ASSETS_DEST_PATH = path.resolve(SITES_PATH, 'assets', APP_NAME, 'dist');

/**
 * Bundle definitions — each entry corresponds to one vite build.
 * `manifestFile` is the manifest filename set in vite.config.ts.
 * `jsKey` / `cssKey` are the lookup keys used in hooks.py's
 * `app_include_js` / `app_include_css`.
 */
const BUNDLES = [
	{
		manifestFile: 'manifest-taskview.json',
		jsKey: 'taskview.bundle.js',
		cssKey: 'taskview.bundle.css',
	},
	{
		manifestFile: 'manifest-timerdock.json',
		jsKey: 'timerdock.bundle.js',
		cssKey: 'timerdock.bundle.css',
	},
];

/**
 * Copy a CSS file to the assets destination and update assets.json.
 */
function copyCss(cssFile, cssKey, assetsJson) {
	const cssSource = path.join(DIST_PATH, cssFile);
	const cssDest = path.join(ASSETS_DEST_PATH, cssFile);

	if (!fs.existsSync(cssSource)) {
		console.warn(`  Warning: CSS file not found: ${cssSource}`);
		return;
	}

	fs.mkdirSync(path.dirname(cssDest), { recursive: true });
	fs.copyFileSync(cssSource, cssDest);

	const cssAssetPath = `/assets/${APP_NAME}/dist/${cssFile}`;
	assetsJson[cssKey] = cssAssetPath;
	console.log(`  ${cssKey} -> ${cssAssetPath}`);
}

function main() {
	// Read existing assets.json
	let assetsJson = {};
	if (fs.existsSync(ASSETS_JSON_PATH)) {
		assetsJson = JSON.parse(fs.readFileSync(ASSETS_JSON_PATH, 'utf-8'));
	}

	// Ensure destination directories exist
	fs.mkdirSync(path.join(ASSETS_DEST_PATH, 'js'), { recursive: true });
	fs.mkdirSync(path.join(ASSETS_DEST_PATH, 'css'), { recursive: true });

	for (const bundle of BUNDLES) {
		const manifestPath = path.resolve(DIST_PATH, bundle.manifestFile);
		if (!fs.existsSync(manifestPath)) {
			console.warn(`Manifest not found: ${manifestPath} — skipping ${bundle.jsKey}`);
			continue;
		}

		const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

		for (const entry of Object.values(manifest)) {
			if (entry.isEntry) {
				// Handle JS entry
				const jsFile = entry.file;
				const jsSource = path.join(DIST_PATH, jsFile);
				const jsDest = path.join(ASSETS_DEST_PATH, jsFile);

				fs.mkdirSync(path.dirname(jsDest), { recursive: true });
				fs.copyFileSync(jsSource, jsDest);

				// Copy sourcemap if it exists
				if (fs.existsSync(jsSource + '.map')) {
					fs.copyFileSync(jsSource + '.map', jsDest + '.map');
				}

				const jsAssetPath = `/assets/${APP_NAME}/dist/${jsFile}`;
				assetsJson[bundle.jsKey] = jsAssetPath;
				console.log(`  ${bundle.jsKey} -> ${jsAssetPath}`);

				// Handle CSS referenced in the entry's css array
				if (entry.css && entry.css.length > 0) {
					for (const cssFile of entry.css) {
						copyCss(cssFile, bundle.cssKey, assetsJson);
					}
				}
			} else if (entry.file.endsWith('.css')) {
				// Standalone CSS entry (Vite extracts CSS separately for IIFE)
				copyCss(entry.file, bundle.cssKey, assetsJson);
			}
		}
	}

	// Write updated assets.json
	fs.writeFileSync(ASSETS_JSON_PATH, JSON.stringify(assetsJson, null, 4));
	console.log(`\nUpdated ${ASSETS_JSON_PATH}`);
}

main();
