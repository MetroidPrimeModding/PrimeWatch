'use strict';

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const udp = require('./udplistener');
const {ipcMain} = require('electron');

var mainWindow = null;
var mapWindow = null;

app.on('window-all-closed', () => {
  app.quit();
});

app.on('ready', () => {
  mainWindow = new BrowserWindow({width: 600, height: 700, frame: false, title: "Metroid Prime Randomizer"});
  mainWindow.loadURL('file://' + __dirname + '/../web/html/index.html');
  //mainWindow.webContents.openDevTools({mode: "undocked"});
  mainWindow.on('closed', () => {mainWindow = null;});

  // mapWindow = new BrowserWindow({width: 600, height: 700, frame: false, title: "Metroid Prime Randomizer"});
  // mapWindow.loadURL('file://' + __dirname + '/../web/html/map.html');
  // mapWindow.webContents.openDevTools({mode: "undocked"});
  // mapWindow.on('closed', () => {
  //   mapWindow = null;
  // });
});

const offsets = require("./offsets.js");

let server = udp.server();
udp.messages.on('data', data => {
  mapWindow.webContents.send('primeDump', data);
});

udp.messages.on('read', data => {
  let readFile = offsets.binarySearchForOffset(offsets.fstOffsets, data.offsetLow);

  if (readFile == undefined) {
    console.log("Unable to find file");
  } else if (readFile.name.toLowerCase().endsWith(".pak")) {
    let pak = offsets.pakOffsets[readFile.rawName];
    let pakRead = offsets.binarySearchForOffset(pak, data.offsetLow - readFile.offset);
    if (pakRead == null || pakRead == undefined) {
      console.log("Unable to read PAK", readFile.name, data.offsetLow - readFile.offset);
    } else {
      // console.log("Read PAK", readFile.name, pakRead.humanName);
      mapWindow.webContents.send('pakRead', {
        pak: readFile.rawName,
        file: pakRead
      });
    }
  } else {
    // console.log("Read non-pak file", readFile.name);
  }
});
