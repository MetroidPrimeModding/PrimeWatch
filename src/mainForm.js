'use strict'

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

var mainWindow = null;

app.on('window-all-closed', function()
{
  if(process.platform != 'darwin')
  {
    app.quit();
  }
});

app.on('ready', function()
{
  mainWindow = new BrowserWindow({width: 600, height: 800, frame: false, minWidth: 600, minHeight: 800, title: "Metroid Prime Randomizer"});
  mainWindow.loadURL('file://' + __dirname + '/index.html');
  mainWindow.webContents.openDevTools();
  mainWindow.on('closed', function()
  {
    mainWindow = null;
  });
});
