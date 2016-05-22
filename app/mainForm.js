'use strict';

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const udp = require('./udplistener');
const {ipcMain} = require('electron');

var mainWindow = null;
var mapWindow = null;

app.on('window-all-closed', () => {app.quit();});

app.on('ready', () => {
  mainWindow = new BrowserWindow({width: 600, height: 700, frame: false, title: "Metroid Prime Randomizer"});
  mainWindow.loadURL('file://' + __dirname + '/../web/html/index.html');
  //mainWindow.webContents.openDevTools({mode: "undocked"});
  mainWindow.on('closed', () => {mainWindow = null;});

  // mapWindow = new BrowserWindow({width: 600, height: 700, frame: false, title: "Metroid Prime Randomizer"});
  // mapWindow.loadURL('file://' + __dirname + '/../web/html/map.html');
  // mapWindow.webContents.openDevTools({mode: "undocked"});
  // mapWindow.on('closed', () => {mapWindow = null;});
});

udp(data => {
  mapWindow.webContents.send('primeDump', data);
});
