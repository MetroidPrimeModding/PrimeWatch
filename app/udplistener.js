'use strict';

const PACKET_TYPE = {
  PACKET_TYPE_GAME_DATA: 1,
  PACKET_TYPE_RAW_DISC_READ: 2
};


const EventEmitter = require('events');
const messages = new EventEmitter();

module.exports = {
  'PACKET_TYPE': PACKET_TYPE,
  'messages': messages,
  'server': function () {
    const dgram = require('dgram');
    const server = dgram.createSocket('udp4');
    const binary = require('binary-parser');

    const fmtPacketType = new binary.Parser()
        .uint8('packetType');

    const fmtData = new binary.Parser()
        .uint8('packetType')
        .uint32be('gameID')
        .uint16be('makerCode')
        .array('speed', {
          type: 'floatle',
          length: 3
        })
        .array('pos', {
          type: 'floatle',
          length: 3
        })
        .uint32be('room')
        .uint32be('ptr')
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


    server.on('message', (msg, rinfo) => {
      try {
        const type = fmtPacketType.parse(msg).packetType;
        let dump;
        if (type === PACKET_TYPE.PACKET_TYPE_GAME_DATA) {
          dump = fmtData.parse(msg);
          messages.emit('data', dump)
        } else if (type === PACKET_TYPE.PACKET_TYPE_RAW_DISC_READ) {
          dump = fmtRead.parse(msg);
          messages.emit('read', dump)
        }
      } catch (e) {
      }
    });

    server.on('listening', () => {
      var address = server.address();
      console.log(`server listening ${address.address}:${address.port}`);
    });

    server.bind(43673);

    return server;
  }
};