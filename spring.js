class Spring {
    constructor(x, y, blocks1, blocks2) {
      this.startX = x;
      this.startY = y;
      this.x = x;
      this.y = y;
      this.anchor = createVector(this.x, this.y);
      this.pos = createVector(this.x, this.y);
  
      // Spring simulation constants
      this.mass = 80; // Mass
      this.k = 0.2; // Spring constant
      this.damp = 1; // Damping
  
      // spring variables
      this.velocity = createVector(0, 0);
      this.accel = 0.5; // Acceleration
      this.force = 0; // Force
  
      this.block = blocks1;
      this.block2 = blocks2;
    }

	update() { 
		let attractor = createVector(mouseX, mouseY);
		let distanceX = abs(this.anchor.x - attractor.x);
		let distanceY = abs(this.anchor.y - attractor.y);
		distanceY += 1;
		distanceY = distanceY/1000
		if (distanceX < 80) {
			// make the point stick to the attractor 
			this.velocity = attractor.copy();
			this.velocity.sub(this.pos);
			this.velocity.mult(0.005);
			this.pos.x += this.velocity.x / distanceY;

		} else {
			// spring back Y
/* 			this.force = -this.k * ( this.pos.y  - this.anchor.y); // f=-ky
			this.accel = this.force / this.mass;                  // Set the acceleration, f=ma == a=f/m
			this.velocity.y = this.damp * (this.velocity.y + this.accel);     // Set the velocity
			this.pos.y += this.velocity.y;                  // Updated position */

            // spring back X
			this.force = -this.k * ( this.pos.x  - this.anchor.x); // f=-ky
			this.accel = this.force / this.mass;                  // Set the acceleration, f=ma == a=f/m
			this.velocity.x = this.damp * (this.velocity.x + this.accel);     // Set the velocity
			this.pos.x += this.velocity.x;                  // Updated position
 
		}
		this.x = this.pos.x;
		this.y = this.pos.y;
	}
	
	display() {
		this.update();

              let x = this.x 
              let y = this.y 

              let currentLetter = this.block

              if (mouseX >= 400) {
                currentLetter = this.block2;
              }
        
              if (currentLetter == '0') {
                //black (empty) rectangle
                fill(0, 0,0);
                rect(x,  y, 40, 40);

              } else if (currentLetter == '1') {
                //white rectangle
                fill(255);
                rect(x, y, 40, 40);

              } else if (currentLetter =='2') {
                //rectangle with black stripe on the right
                fill(255);
                rect(x, y, 40, 40);
                fill(0);
                rect(x + 36, y , 4, 40);

              } else if (currentLetter =='3') {
                //rectangle with black stripe on the right
                fill(255);
                rect(x, y, 40, 40);
                fill(0);
                rect(x , y , 4, 40);
              }
        
	}
}