const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.querySelector('.score');
const buttonEl = document.querySelector('.startGame');
const modalEl = document.querySelector('.modal');
const modalScoreEl = document.querySelector('#modalScore');

canvas.width = innerWidth;
canvas.height = innerHeight;

class Player {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

class Projectile {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update() {
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
    this.draw();
  }
}
// create Enemy class using Projectile class
class Enemy {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update() {
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
    this.draw();
  }
}
// to slow down the explosion effect
const friction = 0.99;

// create Particle class using Enemy class
class Particle {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    // the alpha value initially will be completely opeque
    this.alpha = 1;
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ///////////
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ///////////
    ctx.restore();
  }

  update() {
    this.draw();
    // incorporate the friction value to determine the speed for explosion's x & y values
    this.velocity.x *= friction;
    this.velocity.y *= friction;
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
    this.alpha -= 0.01;
  }
}

const x = canvas.width / 2;
const y = canvas.height / 2;

const player = new Player(x, y, 15, 'white');

const projectiles = [];
const enemies = [];
const particles = [];

// create release enemies function
function spawnEnemies() {
  setInterval(() => {
    // randomize the size of the enemy
    const radius = Math.random() * (30 - 4) + 4;

    // randomize the x and y coordinates of the enemy source location
    let x;
    let y;
    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    }
    // randomize the enemy colors
    const color = `hsl(${Math.random() * 360}, 50%,50%)`;
    // reverse the projectile angle to ensure enemies are moving towards the center
    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };

    enemies.push(new Enemy(x, y, radius, color, velocity));
  }, 1000);
}
// to add the end game logic declare an animationId that wil be assigned to requestAnimationFrame
let animationId;

// initial score
let score = 0;

function animate() {
  animationId = requestAnimationFrame(animate);
  // set the opacity to 0.1 to give the fadeaway effect on the drawings on the animation
  ctx.fillStyle = 'rgba(0,0,0,0.1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // to ensure the player is not being cleared by clearRect
  player.draw();

  particles.forEach((particle, particleIndex) => {
    // ensure particles do not reappear when the alpha values goes below zero
    if (particle.alpha <= 0) {
      particles.splice(particleIndex, 1);
    } else {
      particle.update();
    }
  });

  projectiles.forEach((projectile, projectileIndex) => {
    projectile.update();
    // remove the projectile from the game one they go past outside the edge of the screen
    if (
      projectile.x + projectile.radius < 0 ||
      projectile.x - projectile.radius > canvas.width ||
      projectile.y + projectile.radius < 0 ||
      projectile.y - projectile.radius > canvas.height
    ) {
      setTimeout(() => {
        projectiles.splice(projectileIndex, 1);
      }, 0);
    }
  });
  enemies.forEach((enemy, enemyIndex) => {
    enemy.update();
    // calculate the distance between player and enemy
    const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    // end the game
    if (distance - enemy.radius - player.radius < 1) {
      // display the last animation frame
      cancelAnimationFrame(animationId);
      // display back the modal with final score & update the modal score to the final score
      modalEl.style.display = 'flex';
      modalScoreEl.innerHTML = score;
    }

    // calculate the distance between projectile and enemy
    projectiles.forEach((projectile, projectileIndex) => {
      const distance = Math.hypot(
        projectile.x - enemy.x,
        projectile.y - enemy.y
      );

      // calculate the collision distance
      if (distance - enemy.radius - projectile.radius < 1) {
        // create particles/ explosions
        // randomize the radius between 0-2 to create the fireworks effect
        for (let i = 0; i < enemy.radius * 2; i++) {
          particles.push(
            new Particle(
              projectile.x,
              projectile.y,
              Math.random() * 2,
              enemy.color,
              {
                x: (Math.random() - 0.5) * (Math.random() * 6),
                y: (Math.random() - 0.5) * (Math.random() * 6),
              }
            )
          );
        }

        // check first if the enemy size is small enough to remove
        if (enemy.radius - 10 > 5) {
          // INCREASE THE SCORE
          score += 10;
          scoreEl.innerHTML = score;

          // enemy.radius -= 10;
          // ADD THE GSAP ANIMATION
          gsap.to(enemy, {
            radius: enemy.radius - 10,
          });
          setTimeout(() => {
            projectiles.splice(projectileIndex, 1);
          }, 0);
        } else {
          // INCREASE THE SCORE BY 25 FOR COMPLETELY REMOVING A LARGE ENEMY
          score += 25;
          scoreEl.innerHTML = score;
          // wrap the removal inside a setTimeout to eliminate the flashing effect that takes place when animate function is fired
          setTimeout(() => {
            // remove the enemy from the enemies array
            enemies.splice(enemyIndex, 1);
            // remove the projectile from the projectiles array
            projectiles.splice(projectileIndex, 1);
          }, 0);
        }
      }
    });
  });
}

window.addEventListener('click', (event) => {
  const angle = Math.atan2(
    event.clientY - canvas.height / 2,
    event.clientX - canvas.width / 2
  );
  const velocity = {
    // multiply to increase the projectile speed
    x: Math.cos(angle) * 5,
    y: Math.sin(angle) * 5,
  };
  // create projectiles dynamically
  projectiles.push(
    new Projectile(canvas.width / 2, canvas.height / 2, 5, 'white', velocity)
  );
});

// start the game on button click
buttonEl.addEventListener('click', () => {
  animate();
  spawnEnemies();
  // remove the modal from the screen
  modalEl.style.display = 'none';
});
