const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

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

const x = canvas.width / 2;
const y = canvas.height / 2;

const player = new Player(x, y, 30, 'blue');

const projectiles = [];
const enemies = [];

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
    let colors = ['green', 'orange', 'purple', 'pink'];
    const color = colors[Math.floor(Math.random() * (colors.length - 0) + 0)];
    // reverse the projectile angle to ensure enemies are moving towards the center
    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };

    enemies.push(new Enemy(x, y, radius, color, velocity));
  }, 5000);
}

function animate() {
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // to ensure the player is not being cleared by clearRect
  player.draw();
  projectiles.forEach((projectile) => {
    projectile.update();
  });
  enemies.forEach((enemy, enemyIndex) => {
    enemy.update();
    // calculate the distance between projectile and enemy
    projectiles.forEach((projectile, projectileIndex) => {
      const distance = Math.hypot(
        projectile.x - enemy.x,
        projectile.y - enemy.y
      );

      // calculate the collision distance
      if (distance - enemy.radius - projectile.radius < 1) {
        // wrap the removal inside a setTimeout to eliminate the flashing effect
        setTimeout(() => {
          // remove the enemy from the enemies array
          enemies.splice(enemyIndex, 1);
          // remove the projectile from the projectiles array
          projectiles.splice(projectileIndex, 1);
        }, 0);
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
    x: Math.cos(angle),
    y: Math.sin(angle),
  };
  // create projectiles dynamically
  projectiles.push(
    new Projectile(canvas.width / 2, canvas.height / 2, 5, 'red', velocity)
  );
});

animate();
spawnEnemies();
