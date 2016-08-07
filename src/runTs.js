'use strict';

const path = require('path');
const child_process = require('child_process');
const spawn = child_process.spawn;
const spawnSync = child_process.spawnSync;
const fs = require('fs');
const file = process.argv.pop();
const DIR = path.dirname(file);
const BT = '`';

let killMsg = (msg) => {
  console.log(`TS BUILD ERROR: ${ msg} `)
  process.exit(1);
}

let requireJSON = (file) => {
  try {
    return require(file);
  } catch (e) {
    killMsg(`malformed json\n\n${ e.message }\n`)
  }
}

let searchFile = (lookup, dir = DIR) => {
  let filepath = path.resolve(dir, lookup);
  let parent = path.dirname(dir);
  if (fs.existsSync(filepath)) {
    return filepath;
  } else if (dir !== parent) {
    return searchFile(lookup, parent)
  } else {
    killMsg(`${BT}${ lookup }${BT} not found`);
  }
}

let tsFile = searchFile('tsconfig.json');
let tsJSON = requireJSON(tsFile);
let tsDir = path.dirname(tsFile);

let pkFile = searchFile('package.json');
let pkDir = path.dirname(pkFile);
let tsc = path.join(pkDir, 'node_modules/.bin/tsc')

if (!fs.existsSync(tsc))
  killMsg(`${BT}${ tsc }${BT} not found.\n\nplease run ${BT}npm install typescipt${BT} [--save/--save-dev]\n`)

let params = [];

for (let key in tsJSON.compilerOptions) {
  const flag = `--${ key }`;
  const value = tsJSON.compilerOptions[key];
  if (typeof value === 'boolean') {
    if (value) { params.push(flag) }
  } else {
    params.push(flag)
    params.push(value);
  }
}

params.push(file)

if (spawnSync(tsc, params, { stdio: 'inherit' }).status !== 0)
  killMsg('tsc compile failed')

let outDir = (tsJSON && tsJSON.compilerOptions && tsJSON.compilerOptions.outDir) ? path.resolve(tsDir, tsJSON.compilerOptions.outDir) : null;
let outFile = outDir == null ? file : file.replace(tsDir, outDir).replace(/\.ts$/, '.js');

if (!fs.existsSync(outFile))
  killMsg(`built file not found : ${ outFile }`)

spawn('node', [ outFile ], { stdio: 'inherit' })
