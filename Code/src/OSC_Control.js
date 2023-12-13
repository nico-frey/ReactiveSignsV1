const OSC = require('osc-js')

const port = 8025;
const osc = new OSC();
let enableDepthStream = true;
let enableRGBStream = false;

let dataRaw; // array of depth data
let rData // array of red data
let gData // array of red data
let bData // array of red data
export let realsensePos;
export let lastOSC = 0;
export let OSCdepthData;
export let OSCdepthW; // width of data array
export let OSCdepthH; // width of height array
let tracking;

export function setUpOSC(depthEnabled) {

    enableDepthStream = depthEnabled;
    lastOSC = window.performance.now();
    // init buffer
    // setup OSC receiver
    osc.on('/depth', msg => {
      refreshData(msg);
    }
    );
  
    try {
      osc.open({
        port:
          port
      }
      );
    }
    catch (e) {
      console.log("Could not connect: " + e);
    }

    if (enableRGBStream) {
      let OSCdepthH = 140 ;
      let OSCdepthW = 160 ;
      let depthLength = OSCdepthH * OSCdepthW;
      rData = [];
      gData = [];
      bData = [];
      for (let i = 0; i < depthLength; i++) {
        rData[i] = 100;
        gData[i] = 100;
        bData[i] = 100;
      }
    }
  }
  /*
  function out() {
    if (oscSignal == false) {
      tracking = false;
    }
  }
  function over() {
    if (oscSignal == false) {
      tracking = true;
    }
  }
 */ 


function updateOSC() {
    // reconnect osc
    console.log("tryosc")
    if (osc.status() === OSC.STATUS.IS_CLOSED) {
      console.log("reconnecting...");
      osc.open({
        port:
          port
      }
      );
    }
  }
  
 
  function refreshData(msg) {
    lastOSC = millis();
  //  updatePosition(msg.args[3], msg.args[4], msg.args[5]);
  realsensePos = {x:msg.args[3], y:msg.args[4], z:msg.args[5]}
    // depth data
    tracking = boolean(msg.args[6]);
    if (enableDepthStream) {
      OSCdepthW = msg.args[0];
      OSCdepthH = msg.args[1];
      dataRaw = msg.args[2];
      // weighted moving average on every point
      try {
        let depthLength = OSCdepthW * OSCdepthH;
        for (let i = 0; i < depthLength; i++) {
          //let index = (i*w)+j;
          let datasplit = dataRaw[i];
          OSCdepthData[i] = int(OSCdepthData[i] * 0.9);
          OSCdepthData[i] += int(datasplit * 0.1);
        }
      } catch (e) {
        console.log("data not defined yet");
        OSCdepthData = Array.from(msg.args[2]);
      }
  
      try {
        if (enableRGBStream) {
          rData = msg.args[7];
          gData = msg.args[8];
          bData = msg.args[9];
        }
      } catch (e) {
        console.log("rgb data not defined yet");
   
      }
    }
 }
 