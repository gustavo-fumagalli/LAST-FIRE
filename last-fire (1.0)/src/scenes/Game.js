/*
* Asset from: https://kenney.nl/assets/pixel-platformer
*
*/
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

    create() {
        this.initVariables();
        this.initGameUi();
        this.initAnimations();
        this.background = this.add.image(this.centreX, this.centreY, 'background')
            .setOrigin(0.5)
            .setDisplaySize(this.scale.width, this.scale.height)
            .setDepth(0);
        this.initPlayer();
        this.initInput();
        this.initPhysics();
        // this.initMap();
        this.input.keyboard.on('keydown-ESC', () => {
        if (!this.scene.isActive('PauseMenu')) {
        this.scene.launch('PauseMenu');
        this.scene.pause();
    }
});
    }

    update() {
        // this.updateMap();

        if (!this.gameStarted) return;

        this.player.update();
        if (this.spawnEnemyCounter > 0) this.spawnEnemyCounter--;
        else this.addFlyingGroup();
    }

    initVariables() {
    this.score = 0;
    this.centreX = this.scale.width * 0.5;
    this.centreY = this.scale.height * 0.5;

    this.spawnEnemyCounter = 0; // timer before spawning next group of enemies
}

    initGameUi() {
        // Create tutorial text

        this.healthText = this.add.text(20, 60, 'Vidas: 3', {
        fontFamily: 'Arial Black', fontSize: 28, color: '#ff5555',
        stroke: '#000000', strokeThickness: 8,
        })
        .setDepth(100);

        this.tutorialText = this.add.text(this.centreX, this.centreY, 'Tap to shoot!', {
            fontFamily: 'Arial Black', fontSize: 42, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        })
            .setOrigin(0.5)
            .setDepth(100);

        // Create score text
        this.scoreText = this.add.text(20, 20, 'Score: 0', {
            fontFamily: 'Arial Black', fontSize: 28, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
        })
            .setDepth(100);

        // Create game over text
        this.gameOverText = this.add.text(this.scale.width * 0.5, this.scale.height * 0.5, 'Game Over', {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        })
            .setOrigin(0.5)
            .setDepth(100)
            .setVisible(false);
    }

    updateHealthDisplay(health) {
    this.healthText.setText('Vidas: ' + health);
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
    }

    initInput() {
        this.cursors = this.input.keyboard.createCursorKeys();

        // check for spacebar press only once
        this.cursors.space.once('down', (key, event) => {
            this.startGame();
        });
    }

    // // create tile map data
    // initMap() {
    //     const mapData = [];

    //     for (let y = 0; y < this.mapHeight; y++) {
    //         const row = [];

    //         for (let x = 0; x < this.mapWidth; x++) {
    //             // randomly choose a tile id from this.tiles
    //             // weightedPick favours items earlier in the array
    //             const tileIndex = Phaser.Math.RND.weightedPick(this.tiles);

    //             row.push(tileIndex);
    //         }

    //         mapData.push(row);
    //     }
    //     this.map = this.make.tilemap({ data: mapData, tileWidth: this.tileSize, tileHeight: this.tileSize });
    //     const tileset = this.map.addTilesetImage(ASSETS.spritesheet.tiles.key);
    //     this.groundLayer = this.map.createLayer(0, tileset, 0, this.mapTop);
    // }

    // scroll the tile map
    // updateMap() {
    //     this.scrollMovement += this.scrollSpeed;

    //     if (this.scrollMovement >= this.tileSize) {
    //         //  Create new row on top
    //         let tile;
    //         let prev;

    //         // loop through map from bottom to top row
    //         for (let y = this.mapHeight - 2; y > 0; y--) {
    //             // loop through map from left to right column
    //             for (let x = 0; x < this.mapWidth; x++) {
    //                 tile = this.map.getTileAt(x, y - 1);
    //                 prev = this.map.getTileAt(x, y);

    //                 prev.index = tile.index;

    //                 if (y === 1) { // if top row
    //                     // randomly choose a tile id from this.tiles
    //                     // weightedPick favours items earlier in the array
    //                     tile.index = Phaser.Math.RND.weightedPick(this.tiles);
    //                 }
    //             }
    //         }

    //         this.scrollMovement -= this.tileSize; // reset to 0
    //     }

    //     this.groundLayer.y = this.mapTop + this.scrollMovement; // move one tile up
    // }

    startGame() {
        this.gameStarted = true;
        this.tutorialText.setVisible(false);
        this.addFlyingGroup();
    }

    fireBullet(x, y) {
        const bullet = new PlayerBullet(this, x, y);
        this.playerBulletGroup.add(bullet);
    }

    removeBullet(bullet) {
        this.playerBulletGroup.remove(bullet, true, true);
    }

    fireEnemyBullet(x, y, power) {
        const bullet = new EnemyBullet(this, x, y, power);
        this.enemyBulletGroup.add(bullet);
    }

    removeEnemyBullet(bullet) {
        this.playerBulletGroup.remove(bullet, true, true);
    }

    // add a group of flying enemies
    addFlyingGroup() {
        this.spawnEnemyCounter = Phaser.Math.RND.between(5, 8) * 60; // spawn next group after x seconds
        const randomId = Phaser.Math.RND.between(0, 11); // id to choose image in tiles.png
        const randomCount = Phaser.Math.RND.between(5, 8); // number of enemies to spawn
        const randomInterval = Phaser.Math.RND.between(8, 12) * 100; // delay between spawning of each enemy
        const randomPath = Phaser.Math.RND.between(0, 3); // choose a path, a group follows the same path
        const randomPower = Phaser.Math.RND.between(1, 4); // strength of the enemy to determine damage to inflict and selecting bullet image
        const randomSpeed = Phaser.Math.RND.realInRange(0.0001, 0.001); // increment of pathSpeed in enemy

        this.timedEvent = this.time.addEvent(
            {
                delay: randomInterval,
                callback: this.addEnemy,
                args: [randomId, randomPath, randomSpeed, randomPower], // parameters passed to addEnemy()
                callbackScope: this,
                repeat: randomCount
            }
        );
    }

    addEnemy(shipId, pathId, speed, power) {
        const enemy = new EnemyFlying(this, shipId, pathId, speed, power);
        this.enemyGroup.add(enemy);
    }

    removeEnemy(enemy) {
        this.enemyGroup.remove(enemy, true, true);
    }

    addExplosion(x, y) {
        new Explosion(this, x, y);
    }

    hitPlayer(player, obstacle) {
    this.addExplosion(player.x, player.y);
    player.hit(obstacle.getPower());
    obstacle.die();

    // Só GameOver se a vida do player chegou a zero!
    if (player.health <= 0) {
        this.GameOver();
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
    }
}
