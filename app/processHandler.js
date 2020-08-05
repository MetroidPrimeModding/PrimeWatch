const child_process = require('child_process')
const os = require('os');

let subProcess = null;
let EXECUTABLE;

switch (os.platform()) {
  case 'darwin':
    EXECUTABLE = __dirname + '/binaries/prime_watch_external_macos';
    break;
  case 'unix':
    if (os.type().indexOf('Darwin') > 0) {
      EXECUTABLE = __dirname + '/binaries/prime_watch_external_macos'
    } else {
      throw new Error(`Platform ${os.platform()}/${os.type()} not supported`)
    }
    break;
  case 'win32':
  // TODO
  default:
    throw new Error(`Platform ${os.platform()}/${os.type()} not supported`)
}

const STATES = {
  WAITING_FOR_MESSAGE: 'WAITING_FOR_MESSAGE',
  WAITING_FOR_DATA: 'WAITING_FOR_DATA',
  DYING: 'DYING'
}

function writeMessage(messageID, data) {
  startIfNeeded();
  // console.log(`Sending message ${messageID} len ${data.length}`);
  const msgBuffer = Buffer.alloc(8);
  msgBuffer.writeUInt32LE(data.length, 0);
  msgBuffer.writeUInt32LE(messageID, 4);
  subProcess.stdin.write(msgBuffer);
  subProcess.stdin.write(data);
}

let state = STATES.WAITING_FOR_MESSAGE;
let message_id = null;
let message_offset = null;
let message_len = null;
let message_start = 0;
let message_read = 0;
let message_buffer = null;

let outstanding_promise_resolves = [];

function handleData(stream) {
  while (stream.readableLength > 0) {
    if (state === STATES.WAITING_FOR_MESSAGE) {
      let message = stream.read(4);
      if (!message) {
        console.log(`Got message, but not enough?`);
        return;
      }
      message_id = message.readUInt32LE(0);
      message_start = new Date();
      // console.log(`Received message ${message_id}`);
      if (message_id !== 0x1) {
        state = STATES.DYING;
        writeMessage(0x2, Buffer.alloc(0))
      } else {
        state = STATES.WAITING_FOR_DATA;
        message_read = 0;
        message = stream.read(8)
        message_offset = message.readUInt32LE(0);
        message_len = message.readUInt32LE(4);
        message_buffer = Buffer.alloc(message_len);
      }
    } else if (state === STATES.WAITING_FOR_DATA) {
      let toRead = message_len - message_read;
      if (toRead > stream.readableLength) {
        toRead = stream.readableLength;
      }
      let message = stream.read(toRead);
      if (!message) {
        console.log(`Failed to read ${toRead}...`)
        return
      }
      message.copy(message_buffer, message_read);
      message_read += message.length;
      if (message_read >= message_len) {
        const message_end = new Date();
        const message_duration = message_end - message_start;
        // console.log(`Got all the data after ${message_duration}ms`);
        outstanding_promise_resolves[0].resolve({
          offset: message_offset,
          size: message_len,
          data: message_buffer
        });
        outstanding_promise_resolves.splice(0, 1);
        message_buffer = null;
        state = STATES.WAITING_FOR_MESSAGE;
      }
    } else if (state === STATES.DYING) {
      // just consume and ignore
      stream.read();
      for (const promise of outstanding_promise_resolves) {
        promise.reject("Subprocess died");
      }
      outstanding_promise_resolves = [];
    }
  }
}

function startIfNeeded() {
  if (subProcess) {
    return;
  }

  subProcess = child_process.spawn(
    EXECUTABLE, [], {
      stdio: ['pipe', 'pipe', 'inherit'],
      shell: false
    }
  )

  subProcess.stdout.on('readable', () => {
    handleData(subProcess.stdout);
  });

  subProcess.on('exit', () => {
    console.log('Process died.');
    for (const promise of outstanding_promise_resolves) {
      promise.reject("Subprocess died");
    }
    outstanding_promise_resolves = [];
    subProcess = null;
    state = STATES.WAITING_FOR_MESSAGE;
  });
}

function requestMemory(start, size) {
  const data = Buffer.alloc(8);
  data.writeUInt32LE(start, 0);
  data.writeUInt32LE(size, 4);
  writeMessage(0, data);
  return new Promise((resolve, reject) => {
    outstanding_promise_resolves.push({resolve, reject});
  });
}

module.exports = {
  requestMemory: requestMemory
};
