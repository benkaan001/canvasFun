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

const x = canvas.width / 2;
const y = canvas.height / 2;

const player = new Player(x, y, 30, 'blue');
player.draw();

// const projectile1 = new Projectile(
//   canvas.width / 2,
//   canvas.height / 2,
//   5,
//   'red',
//   {
//     x: 1,
//     y: 1,
//   }
// );
// const projectile2 = new Projectile(
//   canvas.width / 2,
//   canvas.height / 2,
//   5,
//   'green',
//   {
//     x: -1,
//     y: -1,
//   }
// );
const projectiles = [];

function animate() {
  requestAnimationFrame(animate);
  projectiles.forEach((projectile) => {
    projectile.update();
  });
}
window.addEventListener('click', (event) => {
  const angle = Math.atan2(
    event.clientY - canvas.height / 2,
    event.clientX - canvas.width / 2
  );
  console.log(angle);
  projectiles.push(
    new Projectile(canvas.width / 2, canvas.height / 2, 5, 'red', {
      x: 1,
      y: 1,
    })
  );
});

animate();
