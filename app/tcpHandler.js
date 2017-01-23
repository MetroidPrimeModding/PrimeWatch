'use strict';

const PACKET_TYPE = {
  PACKET_TYPE_GAME_DATA: 1,
  PACKET_TYPE_RAW_DISC_READ: 2
};


const EventEmitter = require('events');
const messages = new EventEmitter();
const {dialog} = require('electron');

module.exports = {
  'PACKET_TYPE': PACKET_TYPE,
  'messages': messages,
  'connect': function(ip, port) {
    const net = require('net');
    const socket = new net.Socket();
    socket.pause();
    const binary = require('binary-parser');

    const fmtSize = new binary.Parser()
      .uint32be('size');

    let midPacketSize = undefined;
    socket.on('readable', () => {
      readPacket();
    });

    // setInterval(() => {
    //   readPacket(); //Dumb hack to fix stuff
    // }, 100);

    let firstError = true;
    function readPacket() {
      if (midPacketSize == undefined) {
        const sizeBuff = socket.read(4);
        if (sizeBuff != null) {
          if (sizeBuff.length != 4) {
            console.error("FAILED");
          }
          midPacketSize = fmtSize.parse(sizeBuff).size;
          setTimeout(readPacket);
        }
      } else {
        let buff = socket.read(midPacketSize);
        if (buff != null) {
          if (buff.length != midPacketSize) {
            console.log(`Unexpected size: ${buff.length}`);
          }
          midPacketSize = undefined;
          const str = buff.toString("ascii");
          try {
            let json = JSON.parse(str);
            json["packet_size"] = buff.length;
            messages.emit('data', json);
            setTimeout(readPacket);
          } catch (e) {
            if (firstError) {
              console.error(`${midPacketSize} Error parsing data`, e, str, buff);
              firstError = false;
            }
          }
        }
      }
    }

    socket.on('error', (error) => {
      dialog.showMessageBox({
        type: 'error',
        title: 'Failed to connect',
        message: `${error}`,
        buttons: ['OK'],
      }, () => {
      });
    });

    socket.connect(port, ip, () => {
      var address = socket.address();
      console.log(`Connected to ${address.address}:${address.port}`);
    });


    return socket;
  }
};
