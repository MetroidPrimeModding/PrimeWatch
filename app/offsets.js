'use strict';

const fs = require('fs');
const utils = require('./utils');

let files = fs.readdirSync('./app/offsets/').filter(f => f.toLowerCase().endsWith('pak.json'));

let pakOffsets = {};

files.forEach(file => {
  let src = fs.readFileSync(`./app/offsets/${file}`, {encoding: 'UTF-8'});
  pakOffsets[file.replace('.json', '')] = JSON.parse(src)
      .map(item => {
        item.offset = parseInt(item.offset);
        item.size = parseInt(item.size);
        item.humanName = utils.getNameOfFile(item);
        return item;
      })
      .sort((a, b) => a.offset - b.offset);
});

let fstOffsets = (() => {
  let src = fs.readFileSync('./app/offsets/fst.json');
  let json = JSON.parse(src);

  function recursiveDirectoryFlatten(dir, namePrefix) {
    let children = dir.fileChildren.map(child => {
      child.rawName = child.name;
      child.name = namePrefix + child.name;
      child.offset = parseInt(child.offset);
      child.length = parseInt(child.length);
      return child;
    });

    let dirChildren = dir.directoryChildren.map(child => recursiveDirectoryFlatten(child, namePrefix + child.name + '/'));

    return dirChildren.reduce((a, b) => a.concat(b), children);
  }

  return recursiveDirectoryFlatten(json, '/').sort((a, b) => a.offset - b.offset);
})();

function binarySearchForOffset(array, offset) {
  function bSearch() {
    let start = 0;
    let end = array.length - 1;
    while (start <= end) {
      let i = (start + end) >> 1;
      if (end - start === 1) {
        return i
      } else if (array[i].offset === offset) {
        return i
      } else if (array[i].offset < offset) {
        start = i + 1;
      } else {
        end = i - 1;
      }
    }
    return start;
  }
  let i = bSearch(0, array.length);
  if (i > array.length || i < 0) {
    return undefined;
  } else if (array[i].offset > offset) {
    return array[i - 1];
  } else if (i + 1 < array.length && array[i + 1].offset < offset) {
    return array[i + 1];
  } else {
    return array[i];
  }
}

module.exports = {
  pakOffsets: pakOffsets,
  fstOffsets: fstOffsets,
  binarySearchForOffset: binarySearchForOffset
};
