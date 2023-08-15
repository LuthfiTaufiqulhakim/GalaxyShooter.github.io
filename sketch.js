let bullets = [];
let enemies = [];
let enemyBullets = [];
let score = 0;
let circleY;
let height = 600;
let boss;
let bossHealth = 100;
let playerHealth = 100;
let player;
let enemyModel;
let bossModel;
let font;
let gameOver = false;
let gameWon = false;
let duckHitSound;
let bulletHitSound;
let gmsound;
let stars = [];

function preload() {
  player = loadModel('Duck.obj');
  enemyModel = loadModel('Robot.obj');
  bossModel = loadModel('Robot.obj');
  font = loadFont('stocky.ttf');
  duckHitSound = loadSound('uhh.mp3');
  gmsound = loadSound('gameover.mp3');
  bulletHitSound = loadSound('shoot.mp3');
}

function setup() {
  createCanvas(400, 600, WEBGL);
  circleY = height - 50;
  textFont(font);
  spawnEnemies(5);
  spawnBoss();

  for (let i = 0; i < 200; i++) {
    stars.push(new Star());
  }
}

function draw() {
  background(0);
  rectMode(CENTER);
  translate(-width / 2, -height / 2);

  drawStars();

  drawPlayer();
  updateBullets();
  updateEnemyBullets();
  updateEnemies();
  updateBoss();

  handleCollisions();

  drawHealthBars();
  drawScore();

  if (gameOver) {
    showGameOver();
  } 

  if (gameOver) {
    noLoop();
  }
}

function drawStars() {
  for (let i = 0; i < stars.length; i++) {
    stars[i].update();
    stars[i].show();
  }
}

class Star {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.size = random(1, 3);
    this.speed = random(1, 3);
  }

  update() {
    this.y += this.speed;
    if (this.y > height) {
      this.y = 0;
      this.x = random(width);
      this.size = random(1, 3);
      this.speed = random(1, 3);
    }
  }

  show() {
    noStroke();
    fill(255);
    ellipse(this.x, this.y, this.size, this.size);
  }
}

function spawnEnemies(numEnemies) {
  for (let i = 0; i < numEnemies; i++) {
    let enemy = {
      x: random(0, width),
      y: random(-600, -50),
    };
    enemies.push(enemy);
  }
}

function spawnBoss() {
  boss = {
    x: width / 2,
    y: -100,
    size: 50,
    speed: 2,
    direction: 1,
    cooldown: 0,
  };
}

function drawPlayer() {
  push();
  translate(mouseX, circleY);
  rotateY(PI / -2);
  scale(-20, -50, 13);
  normalMaterial();
  model(player);
  pop();
}

function updateBullets() {
  for (let bullet of bullets) {
    bullet.y -= 10;
    push();
    translate(bullet.x, bullet.y);
    fill(255, 255, 0); // Warna kuning
    sphere(5);
    pop();

    if (bullet.y < 0) {
      bullets.splice(bullets.indexOf(bullet), 1);
    }
  }
}

function updateEnemyBullets() {
  for (let bullet of enemyBullets) {
    bullet.y += 3;
    push();
    translate(bullet.x, bullet.y);
    fill(255, 0, 0); // Warna merah
    sphere(5);
    pop();
    if (dist(bullet.x, bullet.y, mouseX, circleY) < 25) {
      playerHealth -= 10;
      enemyBullets.splice(enemyBullets.indexOf(bullet), 1);
      if (playerHealth <= 0) {
        gameOver = true;
      }
    }
  }
}

function updateEnemies() {
  for (let enemy of enemies) {
    enemy.y += 2;
    push();
    translate(enemy.x, enemy.y);
    scale(10);
    normalMaterial();
    model(enemyModel);
    pop();
    if (enemy.y > height) {
      gameOver = true;
    }
    if (random() < 0.01) {
      let enemyBullet = {
        x: enemy.x,
        y: enemy.y,
      };
      enemyBullets.push(enemyBullet);
    }
  }
}

function updateBoss() {
  if (score >= 10 && bossHealth > 0) {
    boss.x += boss.speed * boss.direction;
    if (boss.x > width - boss.size / 2 || boss.x < boss.size / 2) {
      boss.direction *= -1;
    }
    if (boss.cooldown <= 0) {
      let dx = mouseX - boss.x;
      let dy = circleY - boss.y;
      let angle = atan2(dy, dx);
      let bossBullet = {
        x: boss.x,
        y: boss.y,
        dx: cos(angle),
        dy: sin(angle),
      };
      enemyBullets.push(bossBullet);
      boss.cooldown = 80; // Set waktu jeda tembakan
    } else {
      boss.cooldown--;
    }
    boss.y += 1;
    push();
    translate(boss.x, boss.y);
    scale(50);
    normalMaterial();
    model(bossModel);
    pop();
    fill(255, 0, 0);
    rect(boss.x, boss.y - boss.size - 60, bossHealth, 5);
    if (bossHealth <= 0) {
      boss.y = -100;
      bossHealth = 100;
      score += 10;
      spawnEnemies(20);
      if (score === 20) {
        enemies.splice(0);
        gameWon = true;
      }
    }
  }
}

function handleCollisions() {
  for (let bullet of bullets) {
    for (let enemy of enemies) {
      if (dist(enemy.x, enemy.y, bullet.x, bullet.y) < 10) {
        enemies.splice(enemies.indexOf(enemy), 1);
        bullets.splice(bullets.indexOf(bullet), 1);
        let newEnemy = {
          x: random(0, width),
          y: random(-600, -50),
        };
        enemies.push(newEnemy);
        score += 1;
        if (score === 20) {
          enemies.splice(0);
        }
        duckHitSound.play(); // Efek suara saat duck.obj terkena bullet
      }
    }
    if (dist(boss.x, boss.y, bullet.x, bullet.y) < boss.size / 2) {
      bossHealth -= 10;
      bullets.splice(bullets.indexOf(bullet), 1);
      if (bossHealth <= 0) {
        boss.y = -100;
        bossHealth = 100;
        score += 10;
        spawnEnemies(20);
        if (score === 20) {
          enemies.splice(0);
          gameWon = true;
        }
      }
    }
  }
  for (let bullet of enemyBullets) {
    if (dist(bullet.x, bullet.y, mouseX, circleY) < 25) {
      playerHealth -= 10;
      enemyBullets.splice(enemyBullets.indexOf(bullet), 1);
      if (playerHealth <= 0) {
        gameOver = true;
      }
    }
  }
}

function drawHealthBars() {
  fill(0, 255, 0); // Warna hijau
  rect(mouseX, circleY + 105, playerHealth, 5);
  fill(255, 0, 0);
  rect(boss.x, boss.y - boss.size - 60, bossHealth, 5);
}

function drawScore() {
  textSize(24);
  textAlign(LEFT, TOP);
  text("Score: " + score, 15, 15);
}



function showGameOver() {
  textSize(32);
  textAlign(CENTER, CENTER);
  text("Game Over!", width / 2, height / 2);
  gmsound.play(); // Efek suara saat bullet terkena enemies
}

function mousePressed() {
  let bullet = {
    x: mouseX,
    y: circleY,
  };
  bullets.push(bullet);
  bulletHitSound.play(); // Efek suara saat bullet terkena enemies
}

function mouseMoved() {
  circleY = mouseY;
}