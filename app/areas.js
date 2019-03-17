'use strict';

const fs = require('fs');
const utils = require('./utils');

// let files = fs.readdirSync(__dirname + '/areas/')
//     .filter(n => n.endsWith(".json"));
let files = [
  "13d79165.MLVL.json",
  "39f2de28.MLVL.json",
  "83f6ff6f.MLVL.json",
  "b1ac4d65.MLVL.json",
  "158efe17.MLVL.json",
  "3ef8237c.MLVL.json",
  "a8be6291.MLVL.json",
  "c13b09d1.MLVL.json"
];
let dgrpLookup = new Map();
let areaHeaders = [];

files.forEach(file => {
  let src = fs.readFileSync(__dirname + `/areas/${file}`, {encoding: 'UTF-8'});
  let json = JSON.parse(src);

  json.forEach((area, i) => {
    areaHeaders.push(area.header);
    function handleDep(dep) {
      let humanName = utils.getNameOfFile(dep);
      let areas = dgrpLookup.get(humanName);
      if (areas == null || areas == undefined) {
        areas = [];
        dgrpLookup.set(humanName, areas);
      }
      areas.push({
        num: i,
        id: area.header.id,
        mrea: utils.padId(area.header.MREA.toLowerCase().substr(2))
      });
    }
    area.dependencies1.dependencies.forEach(handleDep);
    area.dependencies2.dependencies.forEach(handleDep);
  })
});

console.log(`Loaded reverse-deps for ${dgrpLookup.size} files`);

module.exports = {
  dgrpLookup: dgrpLookup
};
