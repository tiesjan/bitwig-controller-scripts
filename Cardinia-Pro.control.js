// Controller Script for the Cardinia Pro
//
// When the MIDI Clock Sync is enabled in Bitwig, the Play and Stop buttons can only be controlled
// by the device used for the clock source. This limitation can be circumvented by sending raw MIDI
// start/stop messages from a controller script. Since the Cardinia Pro passes through all MIDI
// messages from the mixer connected to it, specific MIDI notes from that mixer can be translated to
// the playback control of Bitwig.

const EXTENSION_AUTHOR = "Ties Jan Hefting";
const EXTENSION_VERSION = "0.1"
const HARDWARE_DRIVER_ID = "275678c3-1227-46fc-a67f-bc1bc027bbf0";
const HARDWARE_VENDOR = "Cardinia Electronics";
const HARDWARE_MODEL = "Cardinia Pro";


loadAPI(24);
host.setShouldFailOnDeprecatedUse(true);

host.defineController(HARDWARE_VENDOR, HARDWARE_MODEL, EXTENSION_VERSION, HARDWARE_DRIVER_ID, EXTENSION_AUTHOR);
host.defineMidiPorts(1, 0);
host.addDeviceNameBasedDiscoveryPair(["Cardinia Pro (Rev.A) MIDI 1"], []);


const NOTE_PLAY = 0x1E;
const NOTE_STOP = 0x1D;

const MIDI_CHANNEL_16 = 0xF;

const MIDI_START = 0xFA;
const MIDI_STOP = 0xFC;


let midiEventQueue = Array();


function init() {
    midiIn = host.getMidiInPort(0);
    midiIn.setMidiCallback(onMidi);

    host.showPopupNotification(`${HARDWARE_MODEL} initialized.`);
}


function onMidi(status, data1, data2) {
    if (MIDIChannel(status) === MIDI_CHANNEL_16) {
        if (isNoteOn(status)) {
            switch (data1) {
                case NOTE_PLAY:
                    midiEventQueue.push(MIDI_START);
                    break;

                case NOTE_STOP:
                    midiEventQueue.push(MIDI_STOP)
                    break;
             }
        }
    }
}


function flush() {
    while ((midiEvent = midiEventQueue.shift()) !== undefined) {
        midiIn.sendRawMidiEvent(midiEvent, 0x00, 0x00);
    }
}


function exit() {
    host.showPopupNotification(`${HARDWARE_MODEL} exited.`);
}
