'use strict';

module.exports = function (callback) {
    const dgram = require('dgram');
    const server = dgram.createSocket('udp4');
    const binary = require('binary-parser');

    const fmt = new binary.Parser()
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

    server.on('message', (msg, rinfo) => {
        try {
            const dump = fmt.parse(msg);
            callback(dump);
        } catch (e) {
        }
    });

    server.on('listening', () => {
        var address = server.address();
        console.log(`server listening ${address.address}:${address.port}`);
    });

    server.bind(43673);
}