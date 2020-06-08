const fs = require('fs');
const path = require('path');
const yargs = require('yargs');
const glob = require('glob');
const yaml = require('js-yaml');

const args = yargs
  .option('i', {
    demandOption: true,
    type: 'string',
    describe: 'Input file globs',
    array: true
  })
  .option('o', {
    alias: 'out-file',
    demandOption: true,
    type: 'string',
    describe: 'Output file'
  })
  .argv;
const infiles = args.i.flatMap(v => glob.sync(v));
const ofile = args.o;

const res = {};

for (const file of infiles) {
  const split = file.split(path.sep).reverse();
  const layerID = Number.parseInt(split[1].split(' ')[0], 10)
  const areaID = Number.parseInt(split[2].split(' ')[0], 10)
  const levelID = Number.parseInt(split[3].split('_').reverse()[0], 16)

  const level = res[levelID] = res[levelID] || {};

  const contents = yaml.safeLoad(fs.readFileSync(file, 'utf8'));
  for (const obj of contents.objects) {
    const id = obj.id;
    const name = obj.name;
    if (level.hasOwnProperty(id)) {
      throw new Error(`NON UNIQUE ID OH NO ${id} ${obj} ${res.get(id)}`);
    }
    level[id] = name;
  }
  console.log(`Parsed ${file}`);
}

let total = 0;
for (const id in res) {
  if (res.hasOwnProperty(id)) {
    const world = res[id];
    total += Object.getOwnPropertyNames(world).length;
  }
}
console.log(`Found ${total} names across ${Object.getOwnPropertyNames(res).length} worlds`);

fs.writeFileSync(ofile, JSON.stringify(res));
