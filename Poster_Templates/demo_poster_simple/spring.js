class Spring {
    constructor(x, y, blocks1, blocks2) {
      this.startX = x;
      this.startY = y;
      this.x = x;
      this.y = y;
      this.endX = x;
      this.endY = y;
      this.anchor = createVector(this.x, this.y);
      this.pos = createVector(this.x, this.y);
  
      // Spring simulation constants
      this.mass = 0.5; // Mass
      this.k = 0.1; // Spring constant
      this.damp = 0.1; // Damping
  
      // spring variables
      this.velocity = createVector(0, 0);
      this.accel = 0.5; // Acceleration
      this.force = 0; // Force
  
      this.block = blocks1;
      this.block2 = blocks2;

      this.transitionX = this.x;
    }

	update() { 
		let attractor = createVector(mouseX, mouseY);
		let distanceX = abs(this.anchor.x - attractor.x);
		let distanceY = abs(this.anchor.y - attractor.y);
		distanceY += 1;
		distanceY = distanceY/1000

		if (distanceX < 500) {
			// make the point stick to the attractor 
			this.velocity = attractor.copy();
			this.velocity.sub(this.pos);
			this.velocity.mult(0.02);
			this.pos.x += this.velocity.x / distanceY;

      // Reset transitionX when not transitioning
      this.transitionX = this.x;

		} else {

      // spring back X
			this.force = -this.k * ( this.pos.x  - this.anchor.x); // f=-ky
			this.accel = this.force / this.mass;                  // Set the acceleration, f=ma == a=f/m
			this.velocity.x = this.damp * (this.velocity.x + this.accel);     // Set the velocity
			this.pos.x += this.velocity.x;                  // Updated position
 
     // Smooth transition when switching to this.block2
     if (this.block !== this.block2) {
      let targetX = width / 2; // Change width/2 to your desired target position
      this.transitionX = lerp(this.transitionX, targetX, 0.1); // Adjust the third parameter for the speed of the transition
      }
    }

  this.x = this.transitionX; // Assign the smoothed value to this.x
	this.x = this.pos.x;
	this.y = this.pos.y;

	}
	
	display() {
		this.update();

              let x = this.x 
              let y = this.y 

              let currentLetter = this.block

              if (mouseX >= 900) {
                currentLetter = this.block2;
              }
        
              if (currentLetter == '0') {
                //black (empty) rectangle
                fill(0, 0,0);
                rect(x,  y, poster.vw*2.5, poster.vh*5);

              } else if (currentLetter == '1') {
                //white rectangle
                fill(255);
                rect(x, y, poster.vw*2.5, poster.vh*5);

              } else if (currentLetter =='2') {
                //rectangle with black stripe on the right
                fill(255);
                rect(x, y, poster.vw*2.5, poster.vh*5);
                fill(0, 0, 0);
                rect(x+poster.vw*1.25, y, poster.vw*1.25, poster.vh*5);

              } else if (currentLetter =='3') {
                //rectangle with black stripe on the left
                fill(255);
                rect(x, y, poster.vw*2.5, poster.vh*5);
                fill(0);
                rect(x , y , poster.vw*1.25, poster.vh*5);
              }
        
	}
}