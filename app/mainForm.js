'use strict';

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const {ipcMain, Menu, MenuItem, dialog} = require('electron');
const fs = require('fs');
const processHandler = require('./processHandler');

var mainWindow = null;
var mapWindow = null;
var currentClient = null;
var testRamDump = null;
testRamDump = fs.readFileSync( __dirname + '/../testram.raw');

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
          label: "Wireframe",
          type: 'checkbox',
          click(item, focusedwindow) {
            mapWindow.webContents.send('setWireframe', item.checked);
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
  mapWindow = new BrowserWindow({
    width: 600,
    height: 700,
    title: "Prime Watch",
    webPreferences: {
      nodeIntegration: true
    }
  });

  // TODO: maybe lock this better?
  if (process.env.PW_DEV_MODE === 'true') {
    mapWindow.loadURL('http://localhost:4200/index.html');
  } else {
    mapWindow.loadURL('file://' + __dirname + '/../web-dist/index.html');
  }
  mapWindow.webContents.openDevTools({mode: "undocked"});
  mapWindow.on('closed', () => {
    mapWindow = null;
  });

  setupMenu();
});

ipcMain.on('loadTestData', (event) => {
  mapWindow.webContents.send('loadData', testRamDump);
});

ipcMain.handle('readMemory', async (event, offset, length) => {
  // console.log(`Requesting ${offset.toString(16)}:${length}`);
  const res = await processHandler.requestMemory(offset, length);
  // console.log(`Got ${offset.toString(16)}:${length}`);
  return res;
})
