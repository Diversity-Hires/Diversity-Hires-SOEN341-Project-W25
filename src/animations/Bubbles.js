import React, { useRef, useEffect } from 'react';
import p5 from 'p5';

// Particles Component
const Particles = () => {
  const particleRef = useRef();

  useEffect(() => {
    const sketch = (p) => {
      let particles = [];
      let maxParticles = 50;
      // Distance around the mouse in which bubbles repel
      let repelDistance = 350;

      class Particle {
        constructor(x, y) {
          this.x = x;
          this.y = y;
          this.size = p.random(40, 100);
          this.speedX = p.random(-1, 1);
          this.speedY = p.random(-1, 1);
        }

        update() {
          // Move the bubble by its speed
          this.x += this.speedX;
          this.y += this.speedY;

          // Repel from mouse
          let dx = p.mouseX - this.x;
          let dy = p.mouseY - this.y;
          let distance = p.dist(p.mouseX, p.mouseY, this.x, this.y);
          if (distance < repelDistance) {
            let angle = p.atan2(dy, dx);
            // Force grows as the bubble is closer to the mouse
            let force = (repelDistance - distance) / repelDistance * 0.2;
            // Push the bubble away from the mouse
            this.speedX -= force * p.cos(angle);
            this.speedY -= force * p.sin(angle);
          }

          // Apply a friction-like drag
          let drag = 0.995;
          this.speedX *= drag;
          this.speedY *= drag;

          // Ensure a minimum speed so the particles don't come to a stop
          let minSpeed = 0.9;
          let currentSpeed = p.sqrt(this.speedX * this.speedX + this.speedY * this.speedY);
          if (currentSpeed < minSpeed) {
            // Keep direction but set to minSpeed
            let angle = p.atan2(this.speedY, this.speedX);
            this.speedX = minSpeed * p.cos(angle);
            this.speedY = minSpeed * p.sin(angle);
          }

          // Keep particles inside the canvas boundaries
          if (this.x > p.width || this.x < 0) this.speedX *= -1;
          if (this.y > p.height || this.y < 0) this.speedY *= -1;
        }

        draw() {
          // Give it a “bubble” style
          p.stroke(252, 15, 192, 40);
          p.strokeWeight(2);
          p.fill(249, 132, 239, 20);
          p.ellipse(this.x, this.y, this.size);
        }
      }

      p.setup = () => {
        p.createCanvas(window.innerWidth, window.innerHeight).parent(particleRef.current);
        // Initially create bubbles floating in random positions
        for (let i = 0; i < maxParticles; i++) {
          particles.push(new Particle(p.random(p.width), p.random(p.height)));
        }
      };

      p.draw = () => {
        p.clear();
        for (let particle of particles) {
          particle.update();
          particle.draw();
        }
      };

      // Keep the canvas responsive
      p.windowResized = () => {
        p.resizeCanvas(window.innerWidth, window.innerHeight);
      };
    };

    const myP5 = new p5(sketch, particleRef.current);

    return () => {
      myP5.remove();
    };
  }, []);

  return (
    <div
      ref={particleRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
    ></div>
  );
};

export default Particles;

