'use strict';

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const tcp = require('./tcpHandler');
const {ipcMain, Menu, MenuItem, dialog} = require('electron');

var mainWindow = null;
var mapWindow = null;
var currentClient = null;

function setupMenu() {
  let menu = Menu.getApplicationMenu();
  let newMenu = new MenuItem({
    label: 'Wii Connection',
    submenu: [
      {
        label: 'Connect',
        click: (menuItem, browserWindow, event) => {
          mapWindow.webContents.send('showConnectPrompt');
        }
      },
      {
        label: 'Disconnect',
        click: (menuItem, browserWindow, event) => {
          if (currentClient == null) return;
          dialog.showMessageBox(mapWindow, {
            type: 'question',
            title: 'Disconnect?',
            message: 'Are you sure you wnat to disconnect?',
            buttons: ['Disconnect', 'Cancel'],
            cancelID: 1,
            defaultId: 0
          }, (btn) => {
            if (btn == 0) {
              currentClient.destroy();
              currentClient = null;
            }
          });
        }
      }
    ]
  });

  menu.insert(1, newMenu);
  Menu.setApplicationMenu(menu);
}

app.on('window-all-closed', () => {
  app.quit();
});

app.on('ready', () => {
  setupMenu();
  // mainWindow = new BrowserWindow({width: 600, height: 700, frame: false, title: "Metroid Prime Randomizer"});
  // mainWindow.loadURL('file://' + __dirname + '/../web/html/index.html');
  // mainWindow.webContents.openDevTools({mode: "undocked"});
  // mainWindow.on('closed', () => {mainWindow = null;});

  mapWindow = new BrowserWindow({width: 600, height: 700, frame: false, title: "Metroid Prime Randomizer"});
  mapWindow.loadURL('file://' + __dirname + '/../web/html/map.html');
  mapWindow.webContents.openDevTools({mode: "undocked"});
  mapWindow.on('closed', () => {
    mapWindow = null;
  });
});

const offsets = require("./offsets");
const areas = require("./areas");

ipcMain.on('connectToWii', (event, ip, port) => {
  if (currentClient != null) {
    console.log('Disconnecting from existing connection');
    currentClient.destroy();
  }
  console.log(`Connecting to ${ip}:${port}`);
  currentClient = tcp.connect(ip, port);
});

tcp.messages.on('data', data => {
  mapWindow.webContents.send('primeDump', data);
});

tcp.messages.on('read', data => {
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

      let depOf = areas.dgrpLookup.get(pakRead.humanName);
      if (depOf != null && depOf != undefined) {
        mapWindow.webContents.send('depRead', {
          owners: depOf
        })
      }
    }
  } else {
    // console.log("Read non-pak file", readFile.name);
  }
});
