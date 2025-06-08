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

        // Controle de waves (adicione mais waves se quiser)
        this.currentWave = 0;
        this.waves = [
            { count: 5, speed: 0.0005, power: 1 },
            { count: 8, speed: 0.0007, power: 1 },
            { count: 10, speed: 0.0009, power: 1 },
            { count: 15, speed: 0.001, power: 1 },
        ];
        this.remainingEnemies = 0;
        this.spawnEnemyCounter = 0;
        this.bossActive = false;      
        this.bossDefeated = false;    
        this.boss = null;             // referência ao boss (se precisar)
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
        this.startWave(0);
        // this.addEnemy(0, 0, 0.002, 1);
        // this.addFlyingGroup();
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

    // addFlyingGroup() {
    //     this.timedEvent = this.time.addEvent({
    //         delay: 1000,
    //         callback: () => {
    //             this.addEnemy(
    //                 Phaser.Math.Between(0, 11),
    //                 Phaser.Math.Between(0, 3),
    //                 Phaser.Math.FloatBetween(0.0005, 0.0001),
    //                 Phaser.Math.Between(1, 1)
    //             );
    //         },
    //         callbackScope: this,
    //         loop: true
    //     });
    // }

    addEnemy(shipId, pathId, speed, power) {
        const enemy = new EnemyFlying(this, shipId, pathId, speed, power);
        this.enemyGroup.add(enemy);
    }

    removeEnemy(enemy) {
        this.enemyGroup.remove(enemy, true, true);
        this.remainingEnemies--;

        // Se era o boss
        if (this.bossActive && enemy === this.boss) {
            this.bossActive = false;
            this.bossDefeated = true;
            // Depois de uns 2 segundos, pode chamar a cutscene/vitória
            this.time.delayedCall(2000, () => {
            this.showVictory(); // ou chame um método para a cutscene
            });
            return;
        }

        if (this.remainingEnemies === 0 && !this.bossActive) {
            if (this.currentWave === this.waves.length - 1) {
                // Chama o boss!
                this.spawnBoss();
            } else {
                this.time.delayedCall(1500, () => {
                this.startWave(this.currentWave + 1);
                });
            }
        }
    }

    spawnBoss() {
        this.bossActive = true;
        // Exemplo simples: usa o EnemyFlying, mas pode ser um novo objeto depois!
        // AQUI: shipId = 0 (ou outro), pathId = 0 (ou outro), speed menor, power maior
        this.boss = new EnemyFlying(this, 0, 0, 0.0003, 10); 
        this.boss.health = 30; // Deixe bem resistente!
        this.enemyGroup.add(this.boss);

        // Pode mostrar um texto "BOSS FINAL!"
        this.showWaveText('BOSS FINAL');
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

    startWave(waveNumber) {
    this.currentWave = waveNumber;
    const wave = this.waves[waveNumber];

    if (!wave) {
        // Você pode criar um modo infinito ou mostrar "Parabéns"
        this.showVictory(); // Crie essa função se quiser!
        return;
    }

    this.showWaveText(waveNumber + 1);

    this.remainingEnemies = wave.count;

    // Spawna todos os inimigos dessa wave (pode espaçar no tempo se quiser)
    for (let i = 0; i < wave.count; i++) {
        this.time.delayedCall(i * 400, () => {
            this.addEnemy(
                Phaser.Math.RND.between(0, 11),
                Phaser.Math.RND.between(0, 3),
                wave.speed,
                wave.power
            );
        });
    }
    }

    showVictory() {
        this.time.delayedCall(2000, () => {
        this.scene.stop(); // Opcional: para limpar a cena do Game
        this.scene.start('CutsceneFinal');
        });
    }

    showWaveText(wave) {
    if (this.waveText) this.waveText.destroy();
    this.waveText = this.add.text(this.centreX, 100, `WAVE ${wave}`, {
        fontFamily: 'Arial Black', fontSize: 56, color: '#ffd700',
        stroke: '#000000', strokeThickness: 8,
        align: 'center'
    }).setOrigin(0.5).setDepth(101);

    // Some depois de 2 segundos
    this.time.delayedCall(2000, () => {
        this.waveText.destroy();
    });
    }

    updateScore(points) {
        this.score += points;
        this.scoreText.setText(`Score: ${this.score}`);
    }

    GameOver() {
        this.gameStarted = false;
        // this.gameOverText.setVisible(true);
        this.scene.stop();
        this.scene.start('GameOver');
    }
}
