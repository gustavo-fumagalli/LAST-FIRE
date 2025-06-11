// Importação de módulos e classes auxiliares do jogo
import ASSETS from '../assets.js';
import ANIMATION from '../animation.js';
import Player from '../gameObjects/Player.js';
import PlayerBullet from '../gameObjects/PlayerBullet.js';
import EnemyFlying from '../gameObjects/EnemyFlying.js';
import EnemyBullet from '../gameObjects/EnemyBullet.js';
import Explosion from '../gameObjects/Explosion.js';
import HealthKit from '../gameObjects/HealthKit.js';

// Cena principal do jogo (lógica de gameplay)
export class Game extends Phaser.Scene {
    constructor() {
        super('Game'); // Nome da cena para Phaser
    }

    // Carrega os assets usados na cena do jogo
    preload() {
        this.load.audio('shootSound', 'assets/shoot.wav');
        this.load.audio('explosionSound', 'assets/explosion.wav');
        this.load.audio('hitSound', 'assets/hit.wav');
        this.load.audio('bgMusic', 'assets/music.mp3');
        this.load.image('heart', 'assets/heart.png');
        this.load.image('backgroundPreBoss', 'assets/backgroundPreBoss.png');
        this.load.image('backgroundBoss', 'assets/background_boss.png');
        this.load.audio('bossMusic', 'assets/boss_music.mp3');
        this.load.audio('medkitSound', 'assets/medkit.mp3');
        this.load.audio('preBossMusic', 'assets/preBossMusic.mp3');


        // Carrega spritesheet de explosão com as dimensões certas
        this.load.spritesheet(ANIMATION.explosion.texture, ANIMATION.explosion.path, {
            frameWidth: ANIMATION.explosion.frameWidth,
            frameHeight: ANIMATION.explosion.frameHeight
        });
    }

    // Cria os objetos, grupos e eventos iniciais da cena
    create() {
        // Plano de fundo
        this.bg = this.add.image(this.scale.width / 2, this.scale.height / 2, 'background')
            .setDisplaySize(this.scale.width, this.scale.height)
            .setDepth(-100);

        this.initVariables();   // Inicializa variáveis de controle
        this.initGameUi();      // Cria UI de corações, texto, etc.
        this.initAnimations();  // Cria animações do jogo
        this.initPlayer();      // Adiciona o jogador
        this.initInput();       // Configura controles do jogador
        this.initPhysics();     // Configura colisões

        // Referências rápidas para sons e classes
        this.EnemyBulletClass = EnemyBullet;
        this.shootSound = this.sound.add('shootSound', { loop: false, volume: 0.4 });
        this.explosionSound = this.sound.add('explosionSound');
        this.hitSound = this.sound.add('hitSound');
        this.medkitSound = this.sound.add('medkitSound');
        this.bgMusic = this.sound.add('bgMusic', { loop: true, volume: 0.6 });
        this.preBossMusic = this.sound.add('preBossMusic', { loop: true, volume: 1.2 });


        // ESC pausa o jogo e a música
        this.input.keyboard.on('keydown-ESC', () => {
            if (!this.scene.isActive('PauseMenu')) {
                this.scene.launch('PauseMenu');
                this.scene.pause();
                this.bgMusic.pause();
            }
        });

        // Quando a cena é retomada, continua a música
        this.events.on('resume', () => {
            if (this.bgMusic && this.bgMusic.isPaused) {
                this.bgMusic.resume();
            }
        });
    }

    // Atualização principal chamada a cada frame
    update() {
        if (!this.gameStarted) return;
        if (this.player) this.player.update();
    }

    // Inicializa variáveis de controle do jogo
    initVariables() {
        this.score = 0;
        this.centreX = this.scale.width * 0.5;
        this.centreY = this.scale.height * 0.5;
        this.gameStarted = false;
        this.bgMusicStarted = false;
        this.healthKits = this.add.group(); // Grupo de kits médicos

        // Sistema de waves de inimigos
        this.currentWave = 0;
        this.waves = [
            // Cada objeto representa uma onda de inimigos com suas características
            { count: 10, speed: 0.0002, power: 1, health: 1, shipId : 8 },
            { count: 12, speed: 0.0003, power: 1, health: 1,  shipId : 8 },
            { count: 15, speed: 0.0003, power: 1, health: 1,  shipId : 8 },
            { count: 18, speed: 0.0003, power: 1, health: 2,  shipId : 8 },
            { count: 20, speed: 0.0003, power: 1, health: 2,  shipId : 10 },
            { count: 20, speed: 0.0004, power: 2, health: 2,  shipId : 10 },
            { count: 20, speed: 0.0004, power: 2, health: 2,  shipId : 10 },
            { count: 22, speed: 0.0005, power: 2, health: 2,  shipId : 10 },
            { count: 22, speed: 0.0005, power: 2, health: 2,  shipId : 6 },
            { count: 25, speed: 0.0005, power: 2, health: 3,  shipId : 6 },
        ];
        this.remainingEnemies = 0;
        this.spawnEnemyCounter = 0;
        this.bossActive = false;
        this.bossDefeated = false;
        this.boss = null;
    }

    // Cria e posiciona elementos da interface do usuário (UI)
    initGameUi() {
        this.hearts = [];
        const heartXStart = 15;
        const heartY = 10;
        const heartSpacing = 50;
        this.maxHearts = 5; // Máximo de corações na UI

        // Adiciona ícones de corações (vida)
        for (let i = 0; i < this.maxHearts; i++) {
            const heart = this.add.image(heartXStart + i * heartSpacing, heartY, 'heart');
            heart.setScale(0.1).setScrollFactor(0).setDepth(100).setOrigin(0, 0);
            heart.setVisible(false);
            this.hearts.push(heart);
        }

        // Texto inicial de tutorial
        this.tutorialText = this.add.text(this.centreX, this.centreY, 'APERTE ESPAÇO PARA COMEÇAR!', {
            fontFamily: 'Arial Black', fontSize: 42, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8, align: 'center'
        }).setOrigin(0.5).setDepth(100);

        // Score do jogador na tela
        this.scoreText = this.add.text(20, 60, 'Score: 0', {
            fontFamily: 'Arial Black', fontSize: 28, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8
        }).setDepth(100);

        // Texto de Game Over (invisível inicialmente)
        this.gameOverText = this.add.text(this.centreX, this.centreY, 'Game Over', {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8, align: 'center'
        }).setOrigin(0.5).setDepth(100).setVisible(false);

        // Barra de vida e nome do boss (invisíveis até o boss aparecer)
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

    // Atualiza os corações de acordo com a vida do jogador
    updateHealthDisplay(health) {
        const maxDisplayHearts = this.maxHearts;
        const displayHealth = Phaser.Math.Clamp(health, 0, maxDisplayHearts);

        for (let i = 0; i < this.hearts.length; i++) {
            this.hearts[i].setVisible(i < displayHealth);
        }
    }

    // Cria as animações utilizadas no jogo
    initAnimations() {
        this.anims.create({
            key: ANIMATION.explosion.key,
            frames: this.anims.generateFrameNumbers(ANIMATION.explosion.texture, ANIMATION.explosion.config),
            frameRate: ANIMATION.explosion.frameRate,
            repeat: ANIMATION.explosion.repeat
        });

        // Animação de andar do soldado
        this.anims.create({
            key: 'walk',
            frames: [
                { key: ASSETS.spritesheet.ships.key, frame: 8 },   // parado
                { key: ASSETS.spritesheet.ships.key, frame: 9 },   // andando
            ],
            frameRate: 5,
            repeat: -1
        });

        // Animação de ataque do boss
        this.anims.create({
            key: 'boss_attack',
            frames: [
                { key: ASSETS.spritesheet.ships.key, frame: 12 }, // boca fechada
                { key: ASSETS.spritesheet.ships.key, frame: 13 }, // boca aberta
                { key: ASSETS.spritesheet.ships.key, frame: 12 }, // volta para fechada
            ],
            frameRate: 10,
            repeat: 0
        });
    }

    // Configura os grupos de colisão e as checagens de física
    initPhysics() {
        this.enemyGroup = this.add.group();
        this.enemyBulletGroup = this.add.group();
        this.playerBulletGroup = this.add.group();

        // Configura as colisões e funções de callback
        this.physics.add.overlap(this.player, this.enemyBulletGroup, this.hitPlayer, null, this);
        this.physics.add.overlap(this.playerBulletGroup, this.enemyGroup, this.hitEnemy, null, this);
        this.physics.add.overlap(this.player, this.enemyGroup, this.hitPlayer, null, this);
        this.physics.add.overlap(this.player, this.healthKits, (player, kit) => kit.collect(player), null, this);
    }

    // Cria o jogador e atualiza a UI de vida
    initPlayer() {
        this.player = new Player(this, this.centreX, this.scale.height - 100, 8);
        this.updateHealthDisplay(this.player.health);
    }

    // Configura o input de teclado (movimentação, tiro e atalho de dev)
    initInput() {
        this.cursors = this.input.keyboard.createCursorKeys();

        // Espaço começa o jogo
        this.input.keyboard.on('keydown-SPACE', () => {
            if (!this.gameStarted) {
                this.startGame();
            }
        });

        // F7 pula direto para o boss (debug/dev)
        this.input.keyboard.on('keydown-F7', () => {
            if (!this.gameStarted) {
                this.startGame();
            }
            this.enemyGroup.clear(true, true);
            this.remainingEnemies = 0;
            this.currentWave = this.waves.length - 1;
            this.spawnBoss();
            console.log('[DEV] Boss ativado diretamente com F7');
        });
    }

    // Inicia o jogo de verdade (some tutorial e começa a primeira wave)
    startGame() {
        this.gameStarted = true;
        this.tutorialText.setVisible(false);
        this.startWave(0);
    }

    // Cria e dispara uma bala do jogador
    fireBullet(x, y) {
        const bullet = new PlayerBullet(this, x, y);
        this.playerBulletGroup.add(bullet);
        this.shootSound.play();

        // Inicia a música de fundo se ainda não começou
        if (!this.bgMusicStarted) {
            this.bgMusicStarted = true;
            this.bgMusic.play();
        }
    }

    // Remove a bala do jogador
    removeBullet(bullet) {
        this.playerBulletGroup.remove(bullet, true, true);
    }

    // Cria e dispara uma bala do inimigo
    fireEnemyBullet(x, y, power) {
        const bullet = new EnemyBullet(this, x, y, power);
        this.enemyBulletGroup.add(bullet);
    }

    // Remove a bala do inimigo
    removeEnemyBullet(bullet) {
        this.enemyBulletGroup.remove(bullet, true, true);
    }

    // Adiciona um inimigo voador na cena
    addEnemy(shipId, pathId, speed, power, health) {
        const enemy = new EnemyFlying(this, shipId, pathId, speed, power, health);
        this.enemyGroup.add(enemy);
    }

    // Remove o inimigo e trata progressão de waves e boss
    removeEnemy(enemy) {
        this.enemyGroup.remove(enemy, true, true);
        this.remainingEnemies--;

        // Se for o boss, para música e mostra vitória
        if (this.bossActive && enemy === this.boss) {
            this.bossActive = false;
            this.bossDefeated = true;
            if (this.bossMusic && this.bossMusic.isPlaying) {
                this.bossMusic.stop();
            }
            this.hideBossHealthBar();
            this.time.delayedCall(2000, () => this.showVictory());
            return;
        }

        // Se acabou os inimigos e não é boss, vai para próxima wave ou boss
        if (this.remainingEnemies === 0 && !this.bossActive) {
            if (this.currentWave === this.waves.length - 1) {
                this.spawnBoss();
            } else {
                this.spawnHealthKit();
                this.time.delayedCall(1500, () => this.startWave(this.currentWave + 1));
            }
        }
    }

    // Spawna o boss final, troca música, fundo e mostra barra de vida
    spawnBoss() {
        this.bossActive = true;
        this.bg.setTexture('backgroundBoss');

        
        // Para a música pré-boss, se estiver tocando
        if (this.preBossMusic && this.preBossMusic.isPlaying) {
        this.preBossMusic.stop();
}       // Para música normal e toca música do boss
        if (this.bgMusic && this.bgMusic.isPlaying) {
            this.bgMusic.stop();
        }
        this.bossMusic = this.sound.add('bossMusic', { loop: true, volume: 0.5 });
        this.bossMusic.play();

        // Cria o boss e adiciona ao grupo de inimigos
        this.boss = new EnemyFlying(this, 0, 0, 0.0003, 10, 50, true);
        this.boss.maxHealth = 50;
        this.boss.setScale(3);
        this.enemyGroup.add(this.boss);

        // Exibe barra de vida do boss
        this.showBossHealthBar(this.boss.health, this.boss.maxHealth);
        this.showWaveText('BOSS FINAL');
    }

    // Cria animação de explosão ao morrer alguém
    addExplosion(x, y) {
        this.explosionSound.play();
        new Explosion(this, x, y);
    }

    // Função de colisão entre jogador e obstáculos (inimigo ou bala)
    hitPlayer(player, obstacle) {
        this.addExplosion(player.x, player.y);
        this.hitSound.play();
        player.hit(obstacle.getPower ? obstacle.getPower() : 1);

        // Subtrai pontos do score ao tomar dano
        this.updateScore(-75);

        if (obstacle.die) obstacle.die();

        if (player.health <= 0) {
            this.GameOver();
        } else {
            this.updateHealthDisplay(player.health);
        }
        this.cameras.main.shake(200, 0.01);
        this.cameras.main.flash(150, 255, 0, 0);
    }

    // Função de colisão entre bala do jogador e inimigo
    hitEnemy(bullet, enemy) {
        this.updateScore(10);
        bullet.remove();
        enemy.hit(bullet.getPower());

        // Atualiza barra de vida do boss se acertar ele
        if (enemy === this.boss && this.bossActive) {
            this.updateBossHealthBar(this.boss.health, this.boss.maxHealth);
        }
    }

    // Inicia uma wave de inimigos conforme o número passado
    startWave(waveNumber) {
        this.currentWave = waveNumber;
        const wave = this.waves[waveNumber];
    
        if (!wave) {
            this.showVictory();
            return;
        }
    
        // Se for a wave 9 ou 10 (índice 8 ou 9), muda fundo e toca música pré-boss
        if (waveNumber >= 8 && waveNumber <= 9 && !this.bossActive) {
            // Muda o fundo para o de boss
            this.bg.setTexture('backgroundPreBoss');
    
            // Para a música normal
            if (this.bgMusic && this.bgMusic.isPlaying) {
                this.bgMusic.stop();
            }
    
            // Inicia música pré-boss se ainda não estiver tocando
            if (!this.preBossMusic.isPlaying) {
                this.preBossMusic.play();
            }
        }
    
        // Se for antes da wave 8 e a música normal não estiver tocando, toca
        if (waveNumber < 8 && !this.bgMusicStarted) {
            this.bgMusicStarted = true;
            this.bgMusic.play();
        }
    
        this.showWaveText(`WAVE ${waveNumber + 1}`);
        this.remainingEnemies = wave.count;
    
        for (let i = 0; i < wave.count; i++) {
            this.time.delayedCall(i * 400, () => {
                this.addEnemy(
                    wave.shipId,
                    Phaser.Math.RND.between(0, 3),
                    wave.speed,
                    wave.power,
                    wave.health
                );
            });
        }
    }
    

    // Mostra tela de vitória e troca de cena para cutscene final
    showVictory() {
        if (this.bgMusic && this.bgMusic.isPlaying) {
            this.bgMusic.stop();
        }
        // Salva o score no registry antes de trocar de cena
        this.registry.set('lastscore', this.score);

        this.time.delayedCall(2000, () => {
            this.scene.stop();
            this.scene.start('CutsceneFinal');
        });
    }

    // Mostra texto na tela informando número da wave
    showWaveText(wave) {
        if (this.waveText) this.waveText.destroy();
        this.waveText = this.add.text(this.centreX, 100, `${wave}`, {
            fontFamily: 'Arial Black', fontSize: 56, color: '#ffd700',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(101);

        this.time.delayedCall(2000, () => this.waveText.destroy());
    }

    // Atualiza o score do jogador na UI
    updateScore(points) {
        this.score += points;
        if (this.score < 0) this.score = 0;
        this.scoreText.setText(`Score: ${this.score}`);
    }

    // Função chamada quando o jogador perde todas as vidas
    GameOver() {
        this.gameStarted = false;

        if (this.bgMusic && this.bgMusic.isPlaying) this.bgMusic.stop();
        if (this.bossMusic && this.bossMusic.isPlaying) this.bossMusic.stop();

        // Salva score e vai para cena de game over
        this.registry.set('lastscore', this.score);
        this.scene.stop();
        this.scene.start('GameOver');
    }

    // Spawna um kit médico em posição aleatória
    spawnHealthKit() {
        const x = Phaser.Math.Between(100, this.scale.width - 100);
        const y = Phaser.Math.Between(100, this.scale.height - 150);
        const kit = new HealthKit(this, x, y);
        this.healthKits.add(kit);
    }

    // Exibe a barra de vida e nome do boss
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

    // Atualiza o valor da barra de vida do boss
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

    // Esconde a barra de vida do boss e seu nome
    hideBossHealthBar() {
        this.bossHealthBar.setVisible(false).clear();
        this.bossHealthBarBg.setVisible(false).clear();
        this.bossNameText.setVisible(false);
    }
}
