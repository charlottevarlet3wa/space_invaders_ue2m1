// Define the Question class
class Question {
    constructor(question, answers, correctAnswer) {
        this.question = question;
        this.answers = answers;
        this.correctAnswer = correctAnswer;
        this.activeAnswers = new Array(answers.length).fill(true);
        this.answerPositions = [];
    }

    initActiveAnswers(canvas) {
        this.answerPositions = [];
        this.answers.forEach(() => {
            let position;
            do {
                position = {
                    x: Math.random() * (canvas.width - 150),
                    y: 100 + Math.random() * (canvas.height - 200)
                };
            } while (this.checkForOverlap(position));
            this.answerPositions.push(position);
        });
    }

    checkForOverlap(newPosition) {
        return this.answerPositions.some(pos => {
            return !(newPosition.x + 150 < pos.x || newPosition.x > pos.x + 150 ||
                     newPosition.y + 50 < pos.y || newPosition.y > pos.y + 50);
        });
    }

    drawQuestion(elementId) {
        document.getElementById(elementId).innerText = this.question;
    }

    drawAnswers(ctx) {
        this.answers.forEach((answer, index) => {
            if (this.activeAnswers[index]) {
                const pos = this.answerPositions[index];
                ctx.fillStyle = 'red';
                ctx.fillRect(pos.x, pos.y, 150, 50);
                ctx.fillStyle = 'white';
                ctx.font = '16px Arial';
                ctx.fillText(answer, pos.x + 5, pos.y + 30);
            }
        });
    }

    validateAnswer(index, spaceship, game) {
        if (index === this.correctAnswer) {
            game.currentQuestionIndex++;
            if (game.currentQuestionIndex >= game.questions.length) {
                game.currentQuestionIndex = 0; // Loop back to the first question
            }
            game.questions[game.currentQuestionIndex].initActiveAnswers(game.canvas);
        } else {
            this.activeAnswers[index] = false;
        }
    }
}

// Define the Spaceship class
class Spaceship {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        // this.speed = 5;
        this.speed = 3;
        this.health = 100;
        this.moveLeft = false;
        this.moveRight = false;
        this.moveUp = false;
        this.moveDown = false;
    }

    draw(ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    updatePosition(canvasWidth, canvasHeight) {
        if (this.moveLeft && this.x > 0) {
            this.x -= this.speed;
            if (this.x < 0) this.x = 0; // Empêcher de dépasser le bord gauche
        }
        if (this.moveRight && this.x + this.width < canvasWidth) {
            this.x += this.speed;
            if (this.x + this.width > canvasWidth) this.x = canvasWidth - this.width; // Empêcher de dépasser le bord droit
        }
        if (this.moveUp && this.y > 0) {
            this.y -= this.speed;
            if (this.y < 0) this.y = 0; // Empêcher de dépasser le bord haut
        }
        if (this.moveDown && this.y + this.height < canvasHeight) {
            this.y += this.speed;
            if (this.y + this.height > canvasHeight - 50) this.y = canvasHeight - this.height - 50; // Empêcher de dépasser le bord bas
        }
    }
    

    fireBullet(game) {
        let bullet = new Projectile(
            this.x + this.width / 2 - 2.5,  // Center the bullet
            this.y,
            0,
            -5,  // Upward motion
            'white'
        );
        game.playerBullets.push(bullet);
    }
}


// Define the base Enemy class
class Enemy {
    constructor(x, y, width, height, speed, fireBulletCallback, bulletColor = 'yellow') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.fireBulletCallback = fireBulletCallback;
        this.markedForDeletion = false;
        this.intervalId = null;
        this.bulletColor = bulletColor;
        this.startFiring();
    }

    update() {
        if (this.movingRight) {
            this.x += this.speed;
            if (this.x + this.width > canvas.width - 50) {
                this.movingRight = false;
                this.y += 100; // Move 100px down when changing direction
            }
        } else {
            this.x -= this.speed;
            if (this.x < 50) {
                this.movingRight = true;
                this.y += 100; // Move 100px down when changing direction
            }
        }
    
        // Marquer pour suppression si l'ennemi sort du canvas
        if (this.x < 0 || this.x + this.width > canvas.width || this.y < 0 || this.y + this.height > canvas.height) {
            this.markForDeletion();
        }
    }
    

    draw(ctx) {
        ctx.fillStyle = 'purple';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    startFiring() {
        // Default firing logic
    }

    stopFiring() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    markForDeletion() {
        this.markedForDeletion = true;
        this.stopFiring();
    }

    isOffScreen(canvas) {
        return this.markedForDeletion;
    }
}

// Define the HorizontalEnemy class
// Define the HorizontalEnemy class
class HorizontalEnemy extends Enemy {

    constructor(canvas, fireBulletCallback) {
        // super(x, y, 30, 30, speed, fireBulletCallback, 'blue');
        // super(canvas.width - 50, Math.random() * (canvas.height / 2 - 50), 30, 30, 2 + Math.random() * 3, fireBulletCallback, 'blue');
        // super(canvas.width - 50, Math.random() * (canvas.height / 2 - 50), 30, 30, 2 + Math.random() * 3, fireBulletCallback, 'blue');
        super(-100, Math.random() * (canvas.height / 2 - 50), 30, 30, 2 + Math.random() * 3, fireBulletCallback, 'blue');

    }

    update(canvas) {
        if (this.movingRight) {
            this.x += this.speed;
            if (this.x + this.width > canvas.width - 50) {
                this.movingRight = false;
                this.y += 100; // Move 100px down when changing direction
            }
        } else {
            this.x -= this.speed;
            if (this.x < 50) {
                this.movingRight = true;
                this.y += 100; // Move 100px down when changing direction
            }
        }
        
        // Check if the enemy is off-screen and mark for deletion if it is
        // if (this.y >= canvas.height || this.y > 500) {
        if (this.y >= canvas.height || this.y > 300) {
            this.markForDeletion();
        }
    }

    draw(ctx) {
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    startFiring() {
        const fireRate = 1000 + Math.random() * 2000; // Random fire rate between 1s and 3s
        this.intervalId = setInterval(() => {
            if (!this.markedForDeletion) {
                this.fireBulletCallback(this.x + this.width / 2, this.y + this.height, 0, 4, this.bulletColor); // Vertical downward motion
            }
        }, fireRate);
    }
    
    isOffScreen(canvas) {
        return this.markedForDeletion;
    }
}
    


class TopToBottomEnemy extends Enemy {
    constructor(canvas, fireBulletCallback) {
        super(canvas.width - 50, Math.random() * (canvas.height / 2 - 50), 30, 30, 2 + Math.random() * 3, fireBulletCallback, 'red');
    }

    update(canvas) {
        this.y += this.speed;
        // Supprimer l'ennemi s'il sort du canvas
        if (this.y + this.height > canvas.height) {
            this.markForDeletion();
        }
    }
    

    draw(ctx) {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    startFiring() {
        const fireRate = 500 + Math.random() * 1000; // Random fire rate between 1s and 3s
        this.intervalId = setInterval(() => {
            if (!this.markedForDeletion) {
                const speedX = (this.x <= 400) ? 4 : -4; // Si dans la moitié gauche, tirer à droite; sinon, tirer à gauche
                this.fireBulletCallback(this.x + this.width / 2, this.y + this.height / 2, speedX, 0, this.bulletColor); // Tir horizontal
            }
        }, fireRate);
    }
}

class DiagonalEnemy extends Enemy {
    constructor(canvas, fireBulletCallback) {
        super(600, -50, 30, 30, null, fireBulletCallback, 'yellow');
        this.startX = 600;
        this.startY = -50;
        this.targetX = 0;
        this.targetY = 200;
        this.speed = 0.2; // Speed factor for the movement
        this.progress = 0; // To track the progress along the curve
        this.fireInterval = 500; // Fire projectiles every 500 ms
        this.startFiring();
    }

    calculateSpeed() {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        this.speedX = (dx / distance) * 3; // Adjust speed factor as needed
        this.speedY = (dy / distance) * 3; // Adjust speed factor as needed
    }

    update(canvas) {
        this.progress += this.speed / 100; // Adjust the increment to control the speed along the curve

        // Using a simple quadratic Bezier curve formula
        this.x = (1 - this.progress) * (1 - this.progress) * this.startX +
                 2 * (1 - this.progress) * this.progress * ((this.startX + this.targetX) / 2) +
                 this.progress * this.progress * this.targetX;
        this.y = (1 - this.progress) * (1 - this.progress) * this.startY +
                 2 * (1 - this.progress) * this.progress * ((this.startY + this.targetY) / 2 + 100) + // +100 to lower the midpoint
                 this.progress * this.progress * this.targetY;

        if (this.progress >= 1) {
            this.markForDeletion();
        }
    }

    draw(ctx) {
        ctx.fillStyle = 'yellow';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    startFiring() {
        const burstFire = () => {
            if (!this.markedForDeletion) {
                for (let i = 0; i < 5; i++) {
                    setTimeout(() => {
                        if (!this.markedForDeletion) {
                            this.fireCircularProjectiles();
                        }
                    }, i * 200); // Fire three times rapidly, 200 ms apart
                }
            }
        };

        burstFire(); // Initial burst
        this.intervalId = setInterval(() => {
            burstFire();
        }, 2000 + 3 * 200); // 1-second pause after the burst
    }

    fireCircularProjectiles() {
        const numberOfProjectiles = 8;
        const angleStep = (2 * Math.PI) / numberOfProjectiles;

        for (let i = 0; i < numberOfProjectiles; i++) {
            const angle = i * angleStep;
            const speedX = Math.cos(angle) * 3;
            const speedY = Math.sin(angle) * 3;
            this.fireBulletCallback(this.x + this.width / 2, this.y + this.height / 2, speedX, speedY, this.bulletColor);
        }
    }
}

class DiagonalEnemyToRight extends Enemy {
    constructor(canvas, fireBulletCallback) {
        super(600, -50, 30, 30, null, fireBulletCallback, 'green');
        this.startX = 400;
        this.startY = -50;
        this.targetX = 400;
        this.targetY = 400;
        this.speed = 0.2; // Speed factor for the movement
        this.progress = 0; // To track the progress along the curve
        this.fireInterval = 600; // Fire projectiles every 500 ms
        this.startFiring();
    }

    calculateSpeed() {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        this.speedX = (dx / distance) * 3; // Adjust speed factor as needed
        this.speedY = (dy / distance) * 3; // Adjust speed factor as needed
    }

    update(canvas) {
        this.progress += this.speed / 100; // Adjust the increment to control the speed along the curve

        // Using a simple quadratic Bezier curve formula
        this.x = (1 - this.progress) * (1 - this.progress) * this.startX +
                 2 * (1 - this.progress) * this.progress * ((this.startX + this.targetX) / 2) +
                 this.progress * this.progress * this.targetX;
        this.y = (1 - this.progress) * (1 - this.progress) * this.startY +
                 2 * (1 - this.progress) * this.progress * ((this.startY + this.targetY) / 2 + 100) + // +100 to lower the midpoint
                 this.progress * this.progress * this.targetY;

        if (this.progress >= 1) {
            this.markForDeletion();
        }
    }

    draw(ctx) {
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    startFiring() {
        const burstFire = () => {
            if (!this.markedForDeletion) {
                for (let i = 0; i < 3; i++) {
                    setTimeout(() => {
                        if (!this.markedForDeletion) {
                            this.fireCircularProjectiles();
                        }
                    }, i * 300); // Fire three times rapidly, 200 ms apart
                }
            }
        };

        burstFire(); // Initial burst
        this.intervalId = setInterval(() => {
            burstFire();
        }, 2000 + 3 * 200); // 1-second pause after the burst
    }

    fireCircularProjectiles() {
        const numberOfProjectiles = 8;
        const angleStep = (2 * Math.PI) / numberOfProjectiles;

        for (let i = 0; i < numberOfProjectiles; i++) {
            const angle = i * angleStep;
            const speedX = Math.cos(angle) * 3;
            const speedY = Math.sin(angle) * 3;
            this.fireBulletCallback(this.x + this.width / 2, this.y + this.height / 2, speedX, speedY, this.bulletColor);
        }
    }
}




// Define the Projectile class
class Projectile {
    constructor(x, y, speedX, speedY, color = 'yellow') {
        this.x = x;
        this.y = y;
        this.width = 5;
        this.height = 10;
        this.speedX = speedX;
        this.speedY = speedY;
        this.color = color;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    isOffScreen(canvas) {
        return this.y < 0 || this.y > canvas.height || this.x < 0 || this.x > canvas.width;
    }
}

class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        // this.spaceship = new Spaceship(400, 550);
        this.spaceship = new Spaceship(400, 470);
        this.enemies = [];
        this.playerBullets = [];
        this.bullets = [];
        this.score = 0;
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.currentJSONIndex = 0;
        this.enemyGroups = this.defineEnemyGroups();
        this.init();
    }

    async init() {
        this.canvas.width = 800;
        this.canvas.height = 600;
        await this.loadQuestions();
        this.displayQuestion();
        this.attachEventListeners();
        this.spawnEnemyGroup(); // Initial spawn
        this.initEnemySpawn(); // Set interval for spawning
        this.gameLoop();
    }

    async loadQuestions() {
        const response = await fetch('questions.json');
        const data = await response.json();
        this.questions = data;
    }

    displayQuestion() {
        this.currentJSONIndex = Math.floor(Math.random() * this.questions.length); 
        const questionData = this.questions[this.currentJSONIndex];
        let valeur = questionData.valeur;
    
        // Ajoute des guillemets si le type est string
        if (questionData.type === 'string') {
            valeur = `"${valeur}"`;
        }
    
        const questionText = `${questionData.variable} <- ${valeur}`;
        document.getElementById('question-display').innerText = questionText;
    }

    initEnemySpawn() {
        setInterval(() => {
            this.spawnEnemyGroup();
        // }, 10000); // Spawn a group every 10 seconds
        }, 3000); // Spawn a group every 10 seconds
    }

    defineEnemyGroups() {
        return [
            {
                type: HorizontalEnemy,
                count: 3,
                interval: 600,
                speed: 1
            },
            {
                type: TopToBottomEnemy,
                count: 5,
                interval: 600,
                speed: 1
            },
            {
                type: DiagonalEnemy,
                count: 1,
                interval: 1000,
                speed: 0.2
            },
            {
                type: DiagonalEnemyToRight,
                count: 1,
                interval: 1000,
                speed: 0.2
            }
            // You can add more groups as needed
        ];
    }

    spawnEnemyGroup() {
        const randomGroup = this.enemyGroups[Math.floor(Math.random() * this.enemyGroups.length)];
        const { type, count, interval, speed } = randomGroup;
        const spawnPosition = {
            x: Math.random() * this.canvas.width,
            y: Math.random() * (this.canvas.height / 2)
        };
        // const groupSpeed = 0.66 + Math.random() * 2; // Génère une vitesse aléatoire pour le groupe
    
        const groupSpeed = speed;

        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const newEnemy = new type(this.canvas, this.fireEnemyBullet.bind(this));
                switch(type){
                    case DiagonalEnemy:
                    case DiagonalEnemyToRight:
                        break;
                    case HorizontalEnemy:
                        newEnemy.x = Math.random() > 0.5 ? 0 : this.canvas.width;
                        newEnemy.y = spawnPosition.y;
                        break;
                    case TopToBottomEnemy:
                        newEnemy.x = spawnPosition.x; // Set same x position for all enemies in group
                        newEnemy.y = 0; // Set same y position for all enemies in group
                        break;
                }
                // if(type != DiagonalEnemy && type != DiagonalEnemyToRight ){
                // }
                newEnemy.speed = groupSpeed; // Set the same speed for all enemies in this group
                this.enemies.push(newEnemy);
            }, i * interval);
        }
    }
    

    gameLoop() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.spaceship.draw(this.ctx);
        this.updateEntities();
        this.drawEntities();
        this.drawHealthBar();
        this.drawScore();
        requestAnimationFrame(() => this.gameLoop());
    }

    updateEntities() {
        this.spaceship.updatePosition(this.canvas.width, this.canvas.height);
        this.enemies = this.enemies.filter(enemy => {
            enemy.update(this.canvas);
            return !enemy.isOffScreen(this.canvas);
        });
        this.playerBullets = this.playerBullets.filter(bullet => !bullet.isOffScreen(this.canvas));
        this.playerBullets.forEach(bullet => bullet.update());
        this.bullets = this.bullets.filter(bullet => !bullet.isOffScreen(this.canvas));
        this.bullets.forEach(bullet => bullet.update());
        this.checkCollisions();
    }

    drawEntities() {
        this.playerBullets.forEach(bullet => bullet.draw(this.ctx)); // Draw player bullets first
        this.bullets.forEach(bullet => bullet.draw(this.ctx)); // Draw enemy bullets next
        this.enemies.forEach(enemy => enemy.draw(this.ctx)); // Draw enemies on top of bullets
    }

    drawHealthBar() {
        this.ctx.fillStyle = 'grey';
        this.ctx.fillRect(10, 10, 200, 20);
        this.ctx.fillStyle = 'green';
        this.ctx.fillRect(10, 10, 2 * this.spaceship.health, 20);
        this.ctx.strokeStyle = 'black';
        this.ctx.strokeRect(10, 10, 200, 20);
    }

    drawScore() {
        this.ctx.fillStyle = 'white';
        this.ctx.font = '18px Arial';
        this.ctx.fillText("Score: " + this.score, this.canvas.width - 100, 30);
    }

    checkCollisions() {
        const currentQuestion = this.questions[this.currentJSONIndex];
        
        let correctEnemyShot = false; // Variable pour vérifier si un ennemi de la bonne couleur est shooté
    
        this.playerBullets.forEach((bullet, bulletIndex) => {
            this.enemies.forEach((enemy, enemyIndex) => {
                if (bullet.x < enemy.x + enemy.width &&
                    bullet.x + bullet.width > enemy.x &&
                    bullet.y < enemy.y + enemy.height &&
                    bullet.y + bullet.height > enemy.y) {
                    this.playerBullets.splice(bulletIndex, 1);
                    enemy.markForDeletion(); // Marquer l'ennemi pour suppression
                    this.enemies.splice(enemyIndex, 1);
    
                    // Vérifier si l'ennemi shooté a la bonne couleur
                    if ((currentQuestion.type === 'int' && enemy.bulletColor === 'red') ||
                        (currentQuestion.type === 'string' && enemy.bulletColor === 'green') ||
                        (currentQuestion.type === 'float' && enemy.bulletColor === 'blue') ||
                        (currentQuestion.type === 'bool' && enemy.bulletColor === 'yellow')) {
                        correctEnemyShot = true;
                        // this.updateQuestion();
                        this.displayQuestion();
                        // TODO : change question ?
                    }
                    console.log(correctEnemyShot);
                    
                    this.score += 1;
                }
            });
        });
    
        this.bullets.forEach((bullet, index) => {
            if (this.spaceship.x < bullet.x + bullet.width &&
                this.spaceship.x + this.spaceship.width > bullet.x &&
                this.spaceship.y < bullet.y + bullet.height &&
                this.spaceship.y + this.spaceship.height > bullet.y) {
        
                this.bullets.splice(index, 1);
        
                let bulletEffect = -10; // Effet par défaut : la bullet diminue la vie
        
                if ((currentQuestion.type === 'int' && bullet.color === 'red') ||
                    (currentQuestion.type === 'string' && bullet.color === 'green') ||
                    (currentQuestion.type === 'float' && bullet.color === 'blue') ||
                    (currentQuestion.type === 'bool' && bullet.color === 'yellow')) {
                    bulletEffect = 10; // Effet positif : la bullet augmente la vie
                }
        
                this.spaceship.health += bulletEffect;
        
                // S'assurer que la vie ne dépasse pas 100 ou ne tombe pas en dessous de 0
                this.spaceship.health = Math.max(0, Math.min(100, this.spaceship.health));
        
                if (this.spaceship.health <= 0) {
                    console.log('Game Over');
                }
            }
        });
    
        // Mettre à jour la question seulement si un ennemi de la bonne couleur a été shooté
        // if (correctEnemyShot) {
        //     this.updateQuestion();
        // }
    }
    
    
    updateQuestion() {
        // this.currentJSONIndex++;
        // if (this.currentJSONIndex >= this.questions.length) {
        //     this.currentJSONIndex = 0; // Loop back to the first question if at the end
        // }
        
        // Random question
        
        this.displayQuestion();
    }

    attachEventListeners() {
        document.addEventListener('keydown', (event) => {
            switch (event.key) {
                case 'ArrowLeft':
                    this.spaceship.moveLeft = true;
                    break;
                case 'ArrowRight':
                    this.spaceship.moveRight = true;
                    break;
                case 'ArrowUp':
                    this.spaceship.moveUp = true;
                    break;
                case 'ArrowDown':
                    this.spaceship.moveDown = true;
                    break;
                case ' ':
                    this.spaceship.fireBullet(this);
                    break;
            }
        });

        document.addEventListener('keyup', (event) => {
            switch (event.key) {
                case 'ArrowLeft':
                    this.spaceship.moveLeft = false;
                    break;
                case 'ArrowRight':
                    this.spaceship.moveRight = false;
                    break;
                case 'ArrowUp':
                    this.spaceship.moveUp = false;
                    break;
                case 'ArrowDown':
                    this.spaceship.moveDown = false;
                    break;
            }
        });
    }

    fireEnemyBullet(x, y, speedX, speedY, color) {
        // let bullet = new Projectile(x, y, speedX, speedY, color);
        let bullet = new Projectile(x, y, speedX * 0.7, speedY * 0.7, color);
        this.bullets.push(bullet);
    }
    
}

const game = new Game('gameCanvas');
