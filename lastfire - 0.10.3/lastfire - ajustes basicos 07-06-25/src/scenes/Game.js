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
        this.load.audio('bgMusic', 'assets/music.mp3');
        this.load.image('heart', 'assets/heart.png');
        this.load.image('backgroundBoss', 'assets/background_boss.png');
        this.load.audio('bossMusic', 'assets/boss_music.mp3');
        this.load.audio('medkitSound', 'assets/medkit.mp3');


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
        this.medkitSound = this.sound.add('medkitSound');


        this.bgMusic = this.sound.add('bgMusic', { loop: true, volume: 0.5 });

        this.input.keyboard.on('keydown-ESC', () => {
            if (!this.scene.isActive('PauseMenu')) {
                this.scene.launch('PauseMenu');
                this.scene.pause();
                this.bgMusic.pause();
            }
        });

        this.events.on('resume', () => {
            if (this.bgMusic && this.bgMusic.isPaused) {
                this.bgMusic.resume();
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
        this.healthKits = this.add.group();

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

        this.maxHearts = 5; // <-- limite máximo para 5

        for (let i = 0; i < this.maxHearts; i++) {
            const heart = this.add.image(heartXStart + i * heartSpacing, heartY, 'heart');
            heart.setScale(0.1).setScrollFactor(0).setDepth(100).setOrigin(0, 0);
            heart.setVisible(false);
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

        //  UI da barra do boss
        this.bossHealthBarBg = this.add.graphics().setDepth(100).setVisible(false);
        this.bossHealthBar = this.add.graphics().setDepth(101).setVisible(false);
        this.bossNameText = this.add.text(this.centreX, this.scale.height - 40, '', {
            fontFamily: 'Arial Black',
            fontSize: 32,
            color: '#ff0000',
            stroke: '#000000',
            strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5).setDepth(102).setVisible(false);
    }

    updateHealthDisplay(health) {
        const maxDisplayHearts = this.maxHearts; // limite de corações visíveis (5)
        const displayHealth = Phaser.Math.Clamp(health, 0, maxDisplayHearts);

        for (let i = 0; i < this.hearts.length; i++) {
            this.hearts[i].setVisible(i < displayHealth);
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
        this.physics.add.overlap(this.player, this.healthKits, (player, kit) => kit.collect(player), null, this);
    }

    initPlayer() {
        this.player = new Player(this, this.centreX, this.scale.height - 100, 8);
        this.updateHealthDisplay(this.player.health);
    }

    initInput() {
        this.cursors = this.input.keyboard.createCursorKeys();

        this.input.keyboard.on('keydown-SPACE', () => {
            if (!this.gameStarted) {
                this.startGame();
            }
        });

        //  Atalho F7 para pular direto para o boss (modo dev)
        this.input.keyboard.on('keydown-F7', () => {
            if (!this.gameStarted) {
                this.startGame();
            }
            this.enemyGroup.clear(true, true); // remove inimigos existentes
            this.remainingEnemies = 0;
            this.currentWave = this.waves.length - 1;
            this.spawnBoss();
            console.log('[DEV] Boss ativado diretamente com F7');
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

            //  Parar a música do boss
            if (this.bossMusic && this.bossMusic.isPlaying) {
                this.bossMusic.stop();
            }

            this.hideBossHealthBar();
            this.time.delayedCall(2000, () => this.showVictory());
            return;
        }


        if (this.remainingEnemies === 0 && !this.bossActive) {
            if (this.currentWave === this.waves.length - 1) {
                this.spawnBoss();
            } else {
                this.spawnHealthKit();
                this.time.delayedCall(1500, () => this.startWave(this.currentWave + 1));
            }
        }
    }

    spawnBoss() {
        this.bossActive = true;

        // Trocar background para o do boss
        this.bg.setTexture('backgroundBoss');

        // Parar música atual e tocar música do boss
        if (this.bgMusic && this.bgMusic.isPlaying) {
            this.bgMusic.stop();
        }
        this.bossMusic = this.sound.add('bossMusic', { loop: true, volume: 0.5 });
        this.bossMusic.play();

        // Criar o boss normalmente
        this.boss = new EnemyFlying(this, 0, 0, 0.0003, 10);
        this.boss.health = 50;
        this.boss.maxHealth = 50;
        this.boss.setScale(3);
        this.enemyGroup.add(this.boss);

        this.showBossHealthBar(this.boss.health, this.boss.maxHealth);
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
        if (obstacle.die) obstacle.die();// Não mata o inimigo ao encostar no jogador, apenas aplica uma punição severa

        if (player.health <= 0) {
            this.GameOver();
        } else {
            this.updateHealthDisplay(player.health);
        }
        this.cameras.main.shake(200, 0.01); // duração e intensidade
        this.cameras.main.flash(150, 255, 0, 0); // tempo, cor RGB


    }

    hitEnemy(bullet, enemy) {
        this.updateScore(10);
        bullet.remove();
        enemy.hit(bullet.getPower());

        if (enemy === this.boss && this.bossActive) {
            this.updateBossHealthBar(this.boss.health, this.boss.maxHealth);
        }

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

        // Salva o score no registry ANTES de trocar de cena
        this.registry.set('lastscore', this.score);

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

        this.time.delayedCall(2000, () => this.waveText.destroy());
    }

    updateScore(points) {
        this.score += points;
        this.scoreText.setText(`Score: ${this.score}`);
    }

    GameOver() {
        this.gameStarted = false;

        if (this.bgMusic && this.bgMusic.isPlaying) this.bgMusic.stop();
        if (this.bossMusic && this.bossMusic.isPlaying) this.bossMusic.stop();

        // Passa a pontuação para a cena GameOver via registry
        this.registry.set('lastscore', this.score);

        // Para a cena atual e inicia a cena de game over
        this.scene.stop();
        this.scene.start('GameOver');
    }


    spawnHealthKit() {
        const x = Phaser.Math.Between(100, this.scale.width - 100);
        const y = Phaser.Math.Between(100, this.scale.height - 150);
        const kit = new HealthKit(this, x, y);
        this.healthKits.add(kit);
    }

    showBossHealthBar(current, max) {
        this.bossHealthBarBg.setVisible(true).clear();
        this.bossHealthBar.setVisible(true).clear();
        this.bossNameText.setVisible(true).setText('HUGO, o Fumero');

        const barWidth = 600;
        const barHeight = 20;
        const x = this.scale.width / 2 - barWidth / 2;
        const y = this.scale.height - 80;

        this.bossHealthBarBg.fillStyle(0x000000);
        this.bossHealthBarBg.fillRect(x - 2, y - 2, barWidth + 4, barHeight + 4);

        this.updateBossHealthBar(current, max);
    }

    updateBossHealthBar(current, max) {
        const barWidth = 600;
        const barHeight = 20;
        const x = this.scale.width / 2 - barWidth / 2;
        const y = this.scale.height - 80;
        const percent = Phaser.Math.Clamp(current / max, 0, 1);

        this.bossHealthBar.clear();
        this.bossHealthBar.fillStyle(0xff0000);
        this.bossHealthBar.fillRect(x, y, barWidth * percent, barHeight);
    }

    hideBossHealthBar() {
        this.bossHealthBar.setVisible(false).clear();
        this.bossHealthBarBg.setVisible(false).clear();
        this.bossNameText.setVisible(false);
    }
}
