'use strict';

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

var mainWindow = null;

app.on('window-all-closed', () => {app.quit();});

app.on('ready', () =>
{
  mainWindow = new BrowserWindow({width: 600, height: 700, frame: false, title: "Metroid Prime Randomizer"});
  mainWindow.loadURL('file://' + __dirname + '/../web/html/index.html');
  mainWindow.webContents.openDevTools({mode: "undocked"});
  mainWindow.on('closed', () => {mainWindow = null;});
});
