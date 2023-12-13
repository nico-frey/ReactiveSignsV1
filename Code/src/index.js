import P5 from 'p5';
import { Camera } from './webcam.js'
import { setupMoveNet, stopMoveNet, POSE_CONFIG, poses, AdjacentPairs } from './MoveNetTensorFlow.js'
import { webCamSketch } from './debugDisplay.js'
import { setUpGui, dragElement } from './GUI.js'
import { setUpOSC, realsensePos, lastOSC, OSCdepthData, OSCdepthW, OSCdepthH } from './OSC_Control.js'

// debug gui
let Settings = {
  poseDetection: false,
}


let webCamWrapper;
const pageWidth = 1080 * 2; // resolution 
const pageHeight = 1920; //

export let camera, poseDetection;
export let position;// blob center 
export let posNormal// blob center normalised
export let mainP5Sketch;
export let skeletons = poses;
export let depthData;
export let depthW; // width of data array
export let depthH; // width of height array

// helper variables for scalable positioning
export const screens = [{ x: 0, y: 0, w: 100, h: 100, cntX: 50, cntY: 50 }, { x: 0, y: 0, w: 100, h: 100, cntX: 50, cntY: 50 }]
export let vw = 1; // 1 percent of viewport width;
export let vh = 1; // 1 percent of viewport height;

let gui;
let oscSignal = false;// osc signal
let fullscreenMode = false;
let fpsAverage = 0;
let enableDepth = false;


export function setup(p5Instance, modelURL, _enableDepth) {

  if (_enableDepth != undefined) {
    enableDepth = _enableDepth
    setUpOSC(enableDepth) // depthEnabled, rgbEnabled
  } else {
    setUpOSC(false)
  }
  POSE_CONFIG.modelUrl = modelURL;
  console.log(POSE_CONFIG.modelUrl);
  position = createVector(0, 0, 0);
  posNormal = createVector(0, 0, 0); // normalised
  correctAspectRatio();
  mainP5Sketch = p5Instance;
  mainP5Sketch.mousePressed = function () {
    if (mainP5Sketch.mouseX > 0 && mainP5Sketch.mouseY > 0 && mainP5Sketch.mouseX < width && mainP5Sketch.mouseY < height)
      openFullscreen();
  }

  document.addEventListener('fullscreenchange', (event) => {
    // document.fullscreenElement will point to the element that
    // is in fullscreen mode if there is one. If there isn't one,
    // the value of the property is null.
    if (document.fullscreenElement) {
      console.log(`Element: ${document.fullscreenElement.id} entered full-screen mode.`);
      fullscreenMode = true;
      resized();
    } else {
      console.log('Leaving full-screen mode.');
      fullscreenMode = false;
      resized();
    }
  });
  window.onresize = resized;


  document.addEventListener('keypress', (event) => {
    // this is for passing keyboard events to parent when in presentation mode
    try {
      window.parent.trackingCallback(event.code);
    } catch (e) {
    }
  });


}


document.addEventListener("DOMContentLoaded", DOMContentLoadedEvent, false)
async function DOMContentLoadedEvent() {
  // let webCamStream = setupWebCamPreview();
  gui = setUpGui(Settings, datGuiCallback);
}

async function setupWebCamPreview() {
  try {
    webCamWrapper = document.createElement('div');
    document.body.appendChild(webCamWrapper);
    webCamWrapper.id = "canvas-wrapper";
    let webCamStream = document.createElement('video');
    webCamStream.id = "webCam";
    webCamStream.width = "1";
    webCamStream.height = "1";
    let p5Container = document.createElement('div');
    p5Container.id = "output";
    webCamWrapper.appendChild(p5Container);
    webCamWrapper.appendChild(webCamStream);
    camera = await Camera.setup(webCamStream);
    poseDetection = await setupMoveNet(webCamStream);
    p5Container.width = camera.video.width;
    p5Container.height = camera.video.height;
    new P5(webCamSketch, p5Container);
    dragElement(document.getElementById(webCamWrapper.id));
  } catch (e) {
    console.log(e);
  }
}
function showWebCamPreview(enabled) {
  if (webCamWrapper !== undefined) {
    let element = document.getElementById(webCamWrapper.id)
    if (element !== null) {
      if (enabled && Settings.poseDetection == true) {
        element.style.visibility = "visible";
      } else {
        element.style.visibility = "hidden";
      }
      // Do something with the element
    }
    //
  }
}

async function disableWebCamPreview() {
  stopMoveNet()
  try {
    const element = document.getElementById(webCamWrapper.id);
    element.remove(); // Removes the div with the 'div-02' id
  } catch (e) {
    console.log(e)
  }
}

function datGuiCallback() {
  // callback
  /*
    let webcam = document.getElementById("canvas-wrapper");
    if (Settings.showWebcam) {
        webcam.style.display = "block";
    } else {
        webcam.style.display = "none";
    }
  */
  console.log(Settings.poseDetection);
  if (!Settings.poseDetection) {
    disableWebCamPreview();
  } else {
    setupWebCamPreview();
  }
}



function resized() {
  cameraSave(); // work around for play.js
  mainP5Sketch.resizeCanvas(getWindowWidth(), getWindowHeight());
  cameraRestore(); // work around for play.js
  correctAspectRatio();
  try {
    mainP5Sketch.windowScaled();
  } catch (e) {
  }
}

function cameraSave() {
  try {
    percentX = mainP5Sketch.camera.position.x / width;
    percentY = mainP5Sketch.camera.position.y / height;
  } catch (e) {
  }
}

function cameraRestore() {
  try {
    mainP5Sketch.camera.position.x = percentX * width;
    mainP5Sketch.camera.position.y = percentY * height;
  } catch (e) {
  }
}

export function posterTasks() {
  if (poses != undefined && Settings.poseDetection == true) {
    // Get center point from all posses 
    let averageCenterPoint = { x: 0, y: 0 };
    for (const pose of poses) {
      // let nosePosition = pose.keypoints[0]; // based off nose position 
      let boxCenterX = pose.box.xMin + (pose.box.width / 2);
      let boxCenterY = pose.box.yMin + (pose.box.height / 2);
      averageCenterPoint.x += boxCenterX;
      averageCenterPoint.y += boxCenterY;
    }
    averageCenterPoint.x = averageCenterPoint.x / poses.length;
    averageCenterPoint.y = averageCenterPoint.y / poses.length;
    if (!isNaN(averageCenterPoint.x) && !isNaN(averageCenterPoint.y)) {
      updatePosition(1 - averageCenterPoint.x, averageCenterPoint.y, 1.0)
    } else {
      updatePosition(0.5, 0.5, 1.0)
    }
  } else if (window.performance.now() - lastOSC < 1000 && realsensePos != undefined) {
    oscSignal = true;
    // realsense data available over osc
    updatePosition(realsensePos.x, realsensePos.y, realsensePos.z)
    if (enableDepth) {
      depthData = OSCdepthData;
      depthW = OSCdepthW; // width of data array
      depthH = OSCdepthH; // width of height array
    }
  } else {
    oscSignal = false;
    // or just use mouse
    let mouseX = mainP5Sketch.mouseX / mainP5Sketch.width;
    mouseX = mainP5Sketch.constrain(mouseX, 0, 1)
    let mouseY = mainP5Sketch.mouseY / mainP5Sketch.height;
    mouseY = mainP5Sketch.constrain(mouseY, 0, 1)
    updatePosition(mouseX, mouseY, 1.0)
  }

  // show helplines when outside of fullscreen mode
  let debug = true;
  console.log(fullscreenMode);
  if (!fullscreenMode && debug) {
    gui.show();
    showWebCamPreview(true);
    mainP5Sketch.push();
    if (mainP5Sketch._renderer.drawingContext instanceof WebGL2RenderingContext) {
      mainP5Sketch.translate(-mainP5Sketch.width / 2, -mainP5Sketch.height / 2, 0);
    }
    mainP5Sketch.fill(0, 180, 180);
    mainP5Sketch.noStroke();
    fpsAverage = fpsAverage * 0.9;
    fpsAverage += mainP5Sketch.frameRate() * 0.1;
    mainP5Sketch.textSize(1.2 * vw);
    mainP5Sketch.textAlign(mainP5Sketch.LEFT, mainP5Sketch.TOP);
    mainP5Sketch.text("fps: " + Math.floor(fpsAverage), screens[0].x + vw, screens[0].y + vh);
    mainP5Sketch.text("Streaming: " + oscSignal, screens[0].x + vw, screens[0].y + vh + vh + vh);
    mainP5Sketch.noFill();
    mainP5Sketch.stroke(0, 180, 180);
    mainP5Sketch.rectMode(CORNER);
    mainP5Sketch.rect(screens[0].x, screens[0].y, mainP5Sketch.width, mainP5Sketch.height);
    // line between screens
    for (let i = 1; i < screens.length; i++) {
      screens[i].w = mainP5Sketch.floor(width / screens.length);
      mainP5Sketch.line(screens[i].x, screens[i].y, screens[i].x, screens[i].y + screens[i].h); // line between 1st and 2nd screen
    }
    mainP5Sketch.fill(0, 180, 180);
    mainP5Sketch.noStroke();
    mainP5Sketch.circle(position.x, position.y, position.z * 10);
    mainP5Sketch.pop();
  } else {
    gui.hide();
    showWebCamPreview(false);
  }
}

function correctAspectRatio() {
  let offsetX = 0;
  let offsetY = 0;
  if (_renderer.drawingContext instanceof WebGLRenderingContext) {
    offsetX = - Math.floor(width / 2)
    offsetY = - Math.floor(height / 2)
  }
  for (let i = 0; i < screens.length; i++) {
    screens[i].w = floor(width / screens.length);
    screens[i].h = height;
    screens[i].x = screens[i].w * i;
    screens[i].y = 0;
    screens[i].cntX = screens[i].x + screens[i].w / 2;
    screens[i].cntY = screens[i].h / 2;
  }
  vw = width * 0.01; // 1 percent of viewport width;
  vh = height * 0.01;// 1 percent of viewport height;  
}

function updatePosition(x, y, z) {
  // position data and smoothing
  let factor = 0.95;
  posNormal.mult(factor)
  posNormal.x += x * (1 - factor);
  posNormal.y += y * (1 - factor);
  posNormal.z += z * (1 - factor);
  position.set(posNormal);
  position.x = position.x * width;
  position.y = position.y * height;
}

export function getWindowWidth() {
  let posterWidth;
  let displayWidth = window.innerWidth;
  let displayHeight = window.innerHeight;
  //const body = document.getElementsByTagName('body'); // 
  let body = select('body');

  if (body.style('transform') == 'matrix(0, 1, -1, 0, 0, 0)' || body.style('transform') == 'matrix(0, -1, 1, 0, 0, 0)') {
    // workaround for rotated display
    displayWidth = window.innerHeight;
    displayHeight = window.innerWidth;
  }

  let aspectRatioWH = pageWidth / pageHeight; // width to height
  let aspectRatioHW = pageHeight / pageWidth; // height to width

  let currentRatio = displayWidth / displayHeight;

  if (displayWidth < displayHeight * aspectRatioWH) {
    // for portrait mode
    posterWidth = displayWidth;
  } else {
    // for landscape mode
    posterWidth = Math.floor(displayHeight * aspectRatioWH);
  }
  return posterWidth;
}

export function getWindowHeight() {
  let posterHeight;
  let displayWidth = window.innerWidth;
  let displayHeight = window.innerHeight;
  let body = select('body');
  if (body.style('transform') == 'matrix(0, 1, -1, 0, 0, 0)' || body.style('transform') == 'matrix(0, -1, 1, 0, 0, 0)') {
    // workaround for rotated display
    displayWidth = window.innerHeight;
    displayHeight = window.innerWidth;
  }
  let aspectRatioWH = pageWidth / pageHeight; // width to height
  let aspectRatioHW = pageHeight / pageWidth; // height to width
  if (displayWidth < displayHeight * aspectRatioWH) {
    // for portrait mode
    posterHeight = Math.floor(displayWidth * aspectRatioHW);
  } else {
    // for landscape mode
    posterHeight = displayHeight;
  }
  console.log(displayHeight);
  console.log(displayWidth);
  
  if (displayHeight == screen.height || displayWidth == screen.height || displayWidth == screen.width || displayHeight == screen.width) {
    fullscreenMode = true;
  } else {
    fullscreenMode = false;
  }

  return posterHeight;
}

function openFullscreen() {
  let elem = document.documentElement
  if (elem.requestFullscreen) {
    elem.requestFullscreen()
  } else if (elem.mozRequestFullScreen) { /* Firefox */
    elem.mozRequestFullScreen()
  } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
    elem.webkitRequestFullscreen()
  } else if (elem.msRequestFullscreen) { /* IE/Edge */
    elem.msRequestFullscreen()
  }
  if (window.innerHeight == screen.height) {
    fullscreenMode = true;
  } else {
    fullscreenMode = false;
  }
}

