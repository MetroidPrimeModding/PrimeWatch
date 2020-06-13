const child_process = require('child_process')
const os = require('os');
const EventEmitter = require('events');

const events = new EventEmitter();

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
  console.log(`Sending message ${messageID} len ${data.length}`);
  const msgBuffer = Buffer.alloc(8);
  msgBuffer.writeUInt32LE(data.length, 0);
  msgBuffer.writeUInt32LE(messageID, 4);
  subProcess.stdin.write(msgBuffer);
  subProcess.stdin.write(data);
}

let state = STATES.WAITING_FOR_MESSAGE;
let message_id = null;
let message_len = null;
let message_start = 0;
let message_read = 0;
let message_buffer = null;

function handleData(stream) {
  while (stream.readableLength > 0) {
    if (state === STATES.WAITING_FOR_MESSAGE) {
      const message = stream.read(8);
      if (!message) {
        console.log(`Got message, but not enough?`);
        return;
      }
      message_len = message.readUInt32LE(0);
      message_id = message.readUInt32LE(4);
      message_start = new Date();
      console.log(`Received message ${message_id} length ${message_len.toString(16)}`);
      if (message_len < 0 || message_len > 0x1800000 || message_id !== 0x1) {
        state = STATES.DYING;
        writeMessage(0x2, Buffer.alloc(0))
      } else {
        state = STATES.WAITING_FOR_DATA;
        message_read = 0;
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
        console.log(`Got all the data after ${message_duration}ms`);
        events.emit('data', message_buffer);
        message_buffer = null;
        state = STATES.WAITING_FOR_MESSAGE;
      }
      handleData(stream);
    } else if (state === STATES.DYING) {
      // just consume and ignore
      stream.read();
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
    subProcess = null;
    state = STATES.WAITING_FOR_MESSAGE;
  });
}

function requestMemory() {
  const data = Buffer.alloc(8);
  data.writeUInt32LE(0, 0);
  data.writeUInt32LE(0x1800000, 4);
  writeMessage(0, data);
}

module.exports = {
  requestMemory: requestMemory,
  events: events
};
