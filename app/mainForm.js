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
  const template = [
    {
      label: 'Edit',
      submenu: [
        {
          role: 'undo'
        },
        {
          role: 'redo'
        },
        {
          type: 'separator'
        },
        {
          role: 'cut'
        },
        {
          role: 'copy'
        },
        {
          role: 'paste'
        },
        {
          role: 'pasteandmatchstyle'
        },
        {
          role: 'delete'
        },
        {
          role: 'selectall'
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: "Front faces",
          type: 'radio',
          click(item, focusedwindow) {
            mapWindow.webContents.send('setCulling', 'back');
          }
        },
        {
          label: "Back faces",
          type: 'radio',
          click(item, focusedwindow) {
            mapWindow.webContents.send('setCulling', 'front');
          }
        },
        {
          label: "All faces",
          type: 'radio',
          click(item, focusedwindow) {
            mapWindow.webContents.send('setCulling', 'none');
          }
        },
        {
          type: 'separator'
        } ,
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click (item, focusedWindow) {
            if (focusedWindow) focusedWindow.reload()
          }
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
          click (item, focusedWindow) {
            if (focusedWindow) focusedWindow.webContents.toggleDevTools()
          }
        },
        {
          type: 'separator'
        },
        {
          role: 'resetzoom'
        },
        {
          role: 'zoomin'
        },
        {
          role: 'zoomout'
        },
        {
          type: 'separator'
        },
        {
          role: 'togglefullscreen'
        }
      ]
    },
    {
      role: 'window',
      submenu: [
        {
          role: 'minimize'
        },
        {
          role: 'close'
        }
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click () { require('electron').shell.openExternal('http://electron.atom.io') }
        }
      ]
    }
  ]

  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        {
          role: 'about'
        },
        {
          type: 'separator'
        },
        {
          role: 'services',
          submenu: []
        },
        {
          type: 'separator'
        },
        {
          role: 'hide'
        },
        {
          role: 'hideothers'
        },
        {
          role: 'unhide'
        },
        {
          type: 'separator'
        },
        {
          role: 'quit'
        }
      ]
    });
    // Edit menu.
    template[1].submenu.push(
      {
        type: 'separator'
      },
      {
        label: 'Speech',
        submenu: [
          {
            role: 'startspeaking'
          },
          {
            role: 'stopspeaking'
          }
        ]
      }
    );
    // Window menu.
    template[3].submenu = [
      {
        label: 'Close',
        accelerator: 'CmdOrCtrl+W',
        role: 'close'
      },
      {
        label: 'Minimize',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
      },
      {
        label: 'Zoom',
        role: 'zoom'
      },
      {
        type: 'separator'
      },
      {
        label: 'Bring All to Front',
        role: 'front'
      }
    ]
  }

  const menu = Menu.buildFromTemplate(template)
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
  // mainWindow = new BrowserWindow({width: 600, height: 700, frame: false, title: "Metroid Prime Randomizer"});
  // mainWindow.loadURL('file://' + __dirname + '/../web/html/index.html');
  // mainWindow.webContents.openDevTools({mode: "undocked"});
  // mainWindow.on('closed', () => {mainWindow = null;});

  mapWindow = new BrowserWindow({width: 600, height: 700, title: "Prime Watch"});
  mapWindow.loadURL('file://' + __dirname + '/../web/html/map.html');
  // mapWindow.webContents.openDevTools({mode: "undocked"});
  mapWindow.on('closed', () => {
    mapWindow = null;
  });

  setupMenu();
});

const areas = require("./areas");

ipcMain.on('connectToWii', (event, ip, port) => {
  if (currentClient != null) {
    console.log('Disconnecting from existing connection');
    currentClient.destroy();
  }
  console.log(`Connecting to ${ip}:${port}`);
  currentClient = tcp.connect(ip, port);
});

let count = 0;
tcp.messages.on('data', data => {
  count++;
  mapWindow.webContents.send('primeDump', data);
});
