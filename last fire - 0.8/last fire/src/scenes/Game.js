import ASSETS from '../assets.js';
import ANIMATION from '../animation.js';
import Player from '../gameObjects/Player.js';
import PlayerBullet from '../gameObjects/PlayerBullet.js';
import EnemyFlying from '../gameObjects/EnemyFlying.js';
import EnemyBullet from '../gameObjects/EnemyBullet.js';
import Explosion from '../gameObjects/Explosion.js';
import HealthKit from '../gameObjects/HealthKit.js';

export class Game extends Phaser.Scene {
    constructor() {
        super('Game');
    }

    preload() {
        this.load.audio('shootSound', 'assets/shoot.wav');
        this.load.audio('explosionSound', 'assets/explosion.wav');
        this.load.audio('hitSound', 'assets/hit.wav');
        this.load.audio('bgMusic', 'assets/music.mp3'); // 🎵 Música de fundo
        this.load.image('heart', 'assets/heart.png');
        this.load.spritesheet(ANIMATION.explosion.texture, ANIMATION.explosion.path, {
            frameWidth: ANIMATION.explosion.frameWidth,
            frameHeight: ANIMATION.explosion.frameHeight
        });
    }

    create() {
    this.bg = this.add.image(this.scale.width / 2, this.scale.height / 2, 'background')
        .setDisplaySize(this.scale.width, this.scale.height)
        .setDepth(-100);

    this.initVariables();
    this.initGameUi();
    this.initAnimations();
    this.initPlayer();
    this.initInput();
    this.initPhysics();

    this.shootSound = this.sound.add('shootSound');
    this.explosionSound = this.sound.add('explosionSound');
    this.hitSound = this.sound.add('hitSound');

    // 🎵 Instancia a música de fundo
    this.bgMusic = this.sound.add('bgMusic', {
        loop: true,
        volume: 0.5
    });

    // 🎮 ESC para abrir o menu de pausa
    this.input.keyboard.on('keydown-ESC', () => {
        if (!this.scene.isActive('PauseMenu')) {
            this.scene.launch('PauseMenu');
            this.scene.pause();
            this.bgMusic.pause(); // 🎵 Pausa a música do jogo
        }
    });

    // ✅ Retoma a música quando a cena Game é retomada
    this.events.on('resume', () => {
        if (this.bgMusic && this.bgMusic.isPaused) {
            this.bgMusic.resume(); // 🎵 Retoma a música do jogo
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
        this.gameStarted = false;
        this.bgMusicStarted = false;
        this.healthKits = this.add.group(); // grupo para kits médicos

        this.currentWave = 0;
        this.waves = [
            { count: 10, speed: 0.0002, power: 1, health: 1 },
            { count: 12, speed: 0.0003, power: 1, health: 1 },
            { count: 15, speed: 0.0003, power: 1, health: 1 },
            { count: 18, speed: 0.0003, power: 1, health: 1 },
            { count: 18, speed: 0.0003, power: 1, health: 2 },
            { count: 20, speed: 0.0004, power: 2, health: 2 },
            { count: 20, speed: 0.0004, power: 2, health: 2 },
            { count: 22, speed: 0.0005, power: 2, health: 2 },
            { count: 22, speed: 0.0005, power: 2, health: 2 },
            { count: 25, speed: 0.0005, power: 2, health: 3 },
        ];
        this.remainingEnemies = 0;
        this.spawnEnemyCounter = 0;
        this.bossActive = false;
        this.bossDefeated = false;
        this.boss = null;
    }

    initGameUi() {
        this.hearts = [];
        const heartXStart = 15;
        const heartY = 10;
        const heartSpacing = 50;

        this.maxHearts = 10; // número máximo de corações exibíveis
        for (let i = 0; i < this.maxHearts; i++) {
            const heart = this.add.image(heartXStart + i * heartSpacing, heartY, 'heart');
            heart.setScale(0.1).setScrollFactor(0).setDepth(100).setOrigin(0, 0);
            heart.setVisible(false); // inicialmente invisível
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
        
        for (let i = 0; i < this.hearts.length; i++) {
    if (i < health) {
        if (!this.hearts[i].visible) this.hearts[i].setVisible(true);
    } else {
        this.hearts[i].setVisible(false);
    }
    }

    // Adiciona mais corações se necessário
    if (health > this.hearts.length) {
        const heartSpacing = 50;
        const heartY = 10;
        let lastX = this.hearts.length > 0 ? this.hearts[this.hearts.length - 1].x : 15;

    for (let i = this.hearts.length; i < health; i++) {
        const heart = this.add.image(lastX + heartSpacing, heartY, 'heart');
        heart.setScale(0.1).setScrollFactor(0).setDepth(100).setOrigin(0, 0);
        this.hearts.push(heart);
    }
    }
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

        this.physics.add.overlap(this.player, this.healthKits, (player, kit) => {
            kit.collect(player);
        }, null, this);
    
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
    }

    fireBullet(x, y) {
        const bullet = new PlayerBullet(this, x, y);
        this.playerBulletGroup.add(bullet);
        this.shootSound.play();

        if (!this.bgMusicStarted) {
            this.bgMusicStarted = true;
            this.bgMusic.play();
        }
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

    addEnemy(shipId, pathId, speed, power, health) {
        const enemy = new EnemyFlying(this, shipId, pathId, speed, power, health);
        this.enemyGroup.add(enemy);
    }

    removeEnemy(enemy) {
        this.enemyGroup.remove(enemy, true, true);
        this.remainingEnemies--;

        if (this.bossActive && enemy === this.boss) {
            this.bossActive = false;
            this.bossDefeated = true;
            this.time.delayedCall(2000, () => {
                this.showVictory();
            });
            return;
        }

        if (this.remainingEnemies === 0 && !this.bossActive) {
            if (this.currentWave === this.waves.length - 1) {
            this.spawnBoss();
            } else {
            this.spawnHealthKit();
            this.time.delayedCall(1500, () => {
            this.startWave(this.currentWave + 1);
            });
            }
        }
        
    }

    spawnBoss() {
        this.bossActive = true;
        this.boss = new EnemyFlying(this, 0, 0, 0.0003, 10);
        this.boss.health = 50;
        this.enemyGroup.add(this.boss);
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
            this.showVictory();
            return;
        }

        this.showWaveText(waveNumber + 1);
        this.remainingEnemies = wave.count;

        for (let i = 0; i < wave.count; i++) {
            this.time.delayedCall(i * 400, () => {
                this.addEnemy(
                    Phaser.Math.RND.between(8, 11),
                    Phaser.Math.RND.between(0, 3),
                    wave.speed,
                    wave.power,
                    wave.health
                );
            });
        }
    }

    showVictory() {
        if (this.bgMusic && this.bgMusic.isPlaying) {
            this.bgMusic.stop();
        }

        this.time.delayedCall(2000, () => {
            this.scene.stop();
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

        if (this.bgMusic && this.bgMusic.isPlaying) {
            this.bgMusic.stop();
        }

        this.scene.stop();
        this.scene.start('GameOver');
    }

    spawnHealthKit() {
    const x = Phaser.Math.Between(100, this.scale.width - 100);
    const y = Phaser.Math.Between(100, this.scale.height - 150);
    const kit = new HealthKit(this, x, y);
    this.healthKits.add(kit);
    }

}
