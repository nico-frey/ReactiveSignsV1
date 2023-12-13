function setup() {
   /*important!*/ createCanvas(poster.getWindowWidth(), poster.getWindowHeight()); // Don't remove this line. 
    /*important!*/ poster.setup(this, "models/movenet/model.json", true);  // Don't remove this line. 
  textAlign(CENTER, CENTER);
  textSize(10 * poster.vw);
}

function draw() {
  background(255, 255, 255);
  fill(0);

 if (poster.skeletons != undefined) {
  for (const pose of poster.skeletons) {
    let rightHand = pose.keypoints[9]; 
    let leftHand = pose.keypoints[10]; 
    //rotate(poster.posNormal.x * 3 * PI);
    text("👋", rightHand.x*width, rightHand.y*height)
    text("👈", leftHand.x*width, leftHand.y*height)
    /*
    "👆",
    "👇",
    "👈",
    "👉",
    "👊",
    "👋",
    "👌",
    "👍",
    "👎",
    "👏",
    "👐",
    */
  }
}
wordEffect("FUTURE", poster.screens[0].cntX, poster.screens[0].cntY);
wordEffect("NOW", poster.screens[1].cntX, poster.screens[1].cntY);
/*important!*/ poster.posterTasks(); // do not remove this last line!  
}

function windowScaled() { // this is a custom event called whenever the poster is scalled
  textSize(10 * poster.vw);
}

function wordEffect(word, x, y) {
  push()
  translate(x, y);
  rotate(poster.posNormal.x * 3 * PI);
  text(word, 0, -(.5 * poster.vw))
  pop();


}






