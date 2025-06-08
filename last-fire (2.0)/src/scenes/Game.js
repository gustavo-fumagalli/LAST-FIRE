import ASSETS from '../assets.js';
import ANIMATION from '../animation.js';
import Player from '../gameObjects/Player.js';
import PlayerBullet from '../gameObjects/PlayerBullet.js';
import EnemyFlying from '../gameObjects/EnemyFlying.js';
import EnemyBullet from '../gameObjects/EnemyBullet.js';
import Explosion from '../gameObjects/Explosion.js';

export class Game extends Phaser.Scene {
    constructor() {
        super('Game');
    }

    preload() {
        this.load.audio('shootSound', 'assets/shoot.wav');
        this.load.audio('explosionSound', 'assets/explosion.wav');
        this.load.audio('hitSound', 'assets/hit.wav');
        this.load.image('heart', 'assets/heart.png');
        this.load.spritesheet(ANIMATION.explosion.texture, ANIMATION.explosion.path, {
            frameWidth: ANIMATION.explosion.frameWidth,
            frameHeight: ANIMATION.explosion.frameHeight
        });
    }

    create() {

        this.bg = this.add.image(this.scale.width / 2, this.scale.height / 2, 'background')
        .setDisplaySize(this.scale.width, this.scale.height)
        .setDepth(-100); // Garante que o fundo está atrás de tudo

        this.initVariables();
        this.initGameUi();
        this.initAnimations();
        this.initPlayer();
        this.initInput();
        this.initPhysics();

        this.shootSound = this.sound.add('shootSound');
        this.explosionSound = this.sound.add('explosionSound');
        this.hitSound = this.sound.add('hitSound');

        this.input.keyboard.on('keydown-ESC', () => {
            if (!this.scene.isActive('PauseMenu')) {
                this.scene.launch('PauseMenu');
                this.scene.pause();
            }
        });
    }

    update() {
       

        if (!this.gameStarted) return;

        if (this.player) this.player.update();
    }

    initVariables() {
        this.score = 0;
        this.centreX = this.scale.width * 0.5;
        this.centreY = this.scale.height * 0.5;

        this.tiles = [50, 50, 50, 50, 50, 50, 50, 50, 50, 110, 110, 110, 110, 110, 50, 50, 50, 50, 50, 50, 50, 50, 50, 110, 110, 110, 110, 110, 36, 48, 60, 72, 84];
        this.tileSize = 32;
        this.mapOffset = 10;
        this.mapTop = -this.mapOffset * this.tileSize;
        this.mapHeight = Math.ceil(this.scale.height / this.tileSize) + this.mapOffset + 1;
        this.mapWidth = Math.ceil(this.scale.width / this.tileSize);
        this.scrollSpeed = 0;
        this.scrollMovement = 0;
    }

    initGameUi() {
        this.hearts = [];
        const heartXStart = 15;
        const heartY = 10;
        const heartSpacing = 50;

        for (let i = 0; i < 3; i++) {
            const heart = this.add.image(heartXStart + i * heartSpacing, heartY, 'heart');
            heart.setScale(0.1).setScrollFactor(0).setDepth(100).setOrigin(0, 0);
            this.hearts.push(heart);
        }

        this.tutorialText = this.add.text(this.centreX, this.centreY, 'APERTE ESPAÇO PARA COMEÇAR!', {
            fontFamily: 'Arial Black', fontSize: 42, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8, align: 'center'
        }).setOrigin(0.5).setDepth(100);

        this.scoreText = this.add.text(20, 60, 'Score: 0', {
            fontFamily: 'Arial Black', fontSize: 28, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8
        }).setDepth(100);

        this.gameOverText = this.add.text(this.centreX, this.centreY, 'Game Over', {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8, align: 'center'
        }).setOrigin(0.5).setDepth(100).setVisible(false);
    }

    updateHealthDisplay(health) {
        this.hearts.forEach((heart, index) => {
            heart.setVisible(index < health);
        });
    }

    initAnimations() {
        this.anims.create({
            key: ANIMATION.explosion.key,
            frames: this.anims.generateFrameNumbers(ANIMATION.explosion.texture, ANIMATION.explosion.config),
            frameRate: ANIMATION.explosion.frameRate,
            repeat: ANIMATION.explosion.repeat
        });
    }

    initPhysics() {
        this.enemyGroup = this.add.group();
        this.enemyBulletGroup = this.add.group();
        this.playerBulletGroup = this.add.group();

        this.physics.add.overlap(this.player, this.enemyBulletGroup, this.hitPlayer, null, this);
        this.physics.add.overlap(this.playerBulletGroup, this.enemyGroup, this.hitEnemy, null, this);
        this.physics.add.overlap(this.player, this.enemyGroup, this.hitPlayer, null, this);
    }

    initPlayer() {
        this.player = new Player(this, this.centreX, this.scale.height - 100, 8);
        this.updateHealthDisplay(this.player.health);
    }

    initInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.input.keyboard.on('keydown-SPACE', () => {
            if (this.gameStarted) {
                this.fireBullet(this.player.x, this.player.y - 40);
            } else {
                this.startGame();
            }
        });
    }

   

    startGame() {
        this.gameStarted = true;
        this.tutorialText.setVisible(false);

        this.addEnemy(0, 0, 0.002, 1);
        this.addFlyingGroup();
    }

    fireBullet(x, y) {
        const bullet = new PlayerBullet(this, x, y);
        this.playerBulletGroup.add(bullet);
        this.shootSound.play();
    }

    removeBullet(bullet) {
        this.playerBulletGroup.remove(bullet, true, true);
    }

    fireEnemyBullet(x, y, power) {
        const bullet = new EnemyBullet(this, x, y, power);
        this.enemyBulletGroup.add(bullet);
    }

    removeEnemyBullet(bullet) {
        this.enemyBulletGroup.remove(bullet, true, true);
    }

    addFlyingGroup() {
        this.timedEvent = this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.addEnemy(
                    Phaser.Math.Between(0, 11),
                    Phaser.Math.Between(0, 3),
                    Phaser.Math.FloatBetween(0.0005, 0.0001),
                    Phaser.Math.Between(1, 1)
                );
            },
            callbackScope: this,
            loop: true
        });
    }

    addEnemy(shipId, pathId, speed, power) {
        const enemy = new EnemyFlying(this, shipId, pathId, speed, power);
        this.enemyGroup.add(enemy);
    }

    removeEnemy(enemy) {
        this.enemyGroup.remove(enemy, true, true);
    }

    addExplosion(x, y) {
        this.explosionSound.play();
        new Explosion(this, x, y);
    }

    hitPlayer(player, obstacle) {
        this.addExplosion(player.x, player.y);
        this.hitSound.play();
        player.hit(obstacle.getPower ? obstacle.getPower() : 1);
        if (obstacle.die) obstacle.die();

        if (player.health <= 0) {
            this.GameOver();
        } else {
            this.updateHealthDisplay(player.health);
        }
    }

    hitEnemy(bullet, enemy) {
        this.updateScore(10);
        bullet.remove();
        enemy.hit(bullet.getPower());
    }

    updateScore(points) {
        this.score += points;
        this.scoreText.setText(`Score: ${this.score}`);
    }

    GameOver() {
        this.gameStarted = false;
        this.gameOverText.setVisible(true);
        this.scene.stop();
        this.scene.start('GameOver');
    }
}
