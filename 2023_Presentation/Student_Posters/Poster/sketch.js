function setup() {
   /*important!*/ createCanvas(poster.getWindowWidth(), poster.getWindowHeight()); // Don't remove this line. 
  /*important!*/ poster.setup(this,  "/Poster_Templates/libraries/assets/models/movenet/model.json");  // Don't remove this line. 
  textAlign(CENTER, CENTER);
  textSize(10 * poster.vw);
}

function draw() {
  background(0, 0, 0, 50);
  fill(255);
  wordEffect("FUTURE", poster.screens[0].cntX, poster.screens[0].cntY);
  wordEffect("NOW", poster.screens[1].cntX, poster.screens[1].cntY);
/*important!*/ poster.posterTasks(); // do not remove this last line!  
}

function windowScaled() { // this is a custom event called whenever the poster is scaled
  textSize(10 * poster.vw);
}

function wordEffect(word, x, y) {
  push()
  translate(x, y);
  rotate(poster.posNormal.x * 3 * PI);
  text(word, 0, -(.5 * poster.vw))
  pop();
}






