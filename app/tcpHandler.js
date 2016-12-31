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
  'connect': function (ip, port) {
    const net = require('net');
    const socket = new net.Socket();
    socket.pause();
    const binary = require('binary-parser');

    const fmtPacketType = new binary.Parser()
      .uint8('packetType');

    const fmtData = new binary.Parser()
      .uint8('packetType')
      .uint32be('gameID')
      .uint16be('makerCode')
      .array('speed', {
        type: 'floatbe',
        length: 3
      })
      .array('pos', {
        type: 'floatbe',
        length: 3
      })
      .array('aabb', {
        type: 'floatbe',
        length: 6
      })
      .uint32be('current_mlvl')
      .uint32be('current_world_state')
      .uint32be('room')
      // .uint32be('area_count')
      // .uint32be('area_count_max')
      // .uint32be('area_ptr')
      .uint32be('health')
      .array('inventory', {
        type: 'int32be',
        length: 0x29 * 2
      })
      .doublebe('timer');

    const fmtRead = new binary.Parser()
      .uint8('packetType')
      .uint32be('offsetHigh')
      .uint32be('offsetLow')
      .uint32be('lenHigh')
      .uint32be('lenLow');

    let closed = false;

    socket.on('readable', () => {
      readPacket();
    });

    function readPacket() {
      const size = fmtData.sizeOf();
      let buff;
      while ((buff = socket.read(size)) != null) {
        if (buff.length != size) {
          console.log(`Unexpected size: ${buff.length}`);
        }
        try {
          const type = fmtPacketType.parse(buff).packetType;
          let dump;
          if (type === PACKET_TYPE.PACKET_TYPE_GAME_DATA) {
            dump = fmtData.parse(buff);
            messages.emit('data', dump)
          } else if (type === PACKET_TYPE.PACKET_TYPE_RAW_DISC_READ) {
            dump = fmtRead.parse(buff);
            messages.emit('read', dump)
          }
        } catch (e) {
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
