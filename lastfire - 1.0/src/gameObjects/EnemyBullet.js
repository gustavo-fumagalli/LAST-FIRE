import ASSETS from '../assets.js';

export default class EnemyBullet extends Phaser.Physics.Arcade.Sprite {
    power = 1;
    moveVelocity = 400; // velocidade base da bala

    constructor(scene, x, y, power = 1, frame = null) {
        // Se frame não for passado, usa o padrão antigo
        const tileId = 11;
        const bulletFrame = frame !== null ? frame : (tileId + power);

        super(scene, x, y, ASSETS.spritesheet.tiles.key, bulletFrame);

        this.scene = scene;
        this.power = power;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.initPhysics();
    }

    initPhysics() {
        this.setSize(16, 24); // hitbox ajustada
        this.setFlipY(true); // sprite invertido (para baixo)
        this.setDepth(10);
        this.setVelocityY(this.moveVelocity * (0.5 + this.power * 0.1));
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        if (this.y > this.scene.scale.height + this.height) {
            this.die();
        }
    }

    getPower() {
        return this.power;
    }

    die() {
        this.scene.removeEnemyBullet(this);
    }
}