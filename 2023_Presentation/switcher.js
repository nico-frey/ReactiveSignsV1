

let parent = 'Student_Posters/'
let indexFile = '/index.html'
let posters = ['Group1', 'Group2']

// not used: 
let posterCount = 1
let intervalTime = 120000; //2 minutes 120000
let trackingActive = false;
let streaming = false;
let demoMode = false

function trackingCallback(keyCode) {
  console.log(keyCode)
  let posterNumber = 0;
  switch (keyCode) {
    case 'Digit1':
      posterNumber = 1;
      break;
    case 'Digit2':
      posterNumber = 2;
      break;
    case 'Digit3':
      posterNumber = 3;
      break;
    case 'Digit4':
      posterNumber = 4;
      break;
    case 'Digit5':
      posterNumber = 5;
      break;
    case 'Digit6':
      posterNumber = 6;
      break;
    case 'Digit7':
      posterNumber = 7;
      break;
    case 'Digit8':
      posterNumber = 8;
      break;
    default:
      posterNumber = 0;
  }
  pickPoster(posterNumber)
}

function changePoster() {
  console.log("changing posters")
  let newPosterURL = parent + '' + posters[posterCount] + '' + indexFile
  console.log(newPosterURL);
  let iframe = document.getElementById('posterFrame');
  iframe.src = newPosterURL;
  let fader = document.getElementById('fader');
  fader.style.opacity = 0;
  if (posterCount < posters.length - 1) {
    posterCount++
  } else {
    posterCount = 0;
  }
}

function pickPoster(number) {
  // for keyboard selection during testing
  if (number - 1 < posters.length && number - 1 >= 0) {
    console.log("poster no: " + number)
    posterCount = number - 1;
    transition()
    // 
    clearInterval(myInterval);
    myInterval = setInterval(intervalHandler, 500000); 

  }
}

function transition() {
  console.log("try transition animation")
  try {
    // let iframe = document.getElementById('posterFrame');
    //let iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
    let fader = document.getElementById('fader');
    console.log(fader);
    fader.style.opacity = 1;
  } catch (e) {
    console.log("transition failed " + e)
  }
 // setTimeout(changePoster, 2000);
}



function intervalHandler() {
 // console.log("streaming" + streaming + ", trackingActive" + trackingActive);
  //if (!trackingActive && streaming) {
    clearInterval(myInterval);
    myInterval = setInterval(intervalHandler, intervalTime)
    //changePoster()
    transition()
  /*  } else if (!streaming) {
    // not streaming! always show poster 1
    clearInterval(myInterval);
    myInterval = setInterval(intervalHandler, intervalTime)
    //posterCount = 1;
    transition()
  } else {
    // skip change if someone is in front of poster, try again after delay 
    clearInterval(myInterval);
    myInterval = setInterval(intervalHandler, 1000);
    //console.log("tracking: "+ trackingActive);
  }*/
}


//let myInterval = setInterval(intervalHandler, intervalTime); 


document.addEventListener('keypress', pickPoster, true);

document.addEventListener("resize", (event) => {
  console.log("resize")
  document.addEventListener('keypress', pickPoster, true);
});