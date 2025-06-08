import ASSETS from '../assets.js';

export default class EnemyBullet extends Phaser.Physics.Arcade.Sprite {
    power = 1;
    moveVelocity = 400; // velocidade base da bala

    constructor(scene, x, y, power = 1) {
        const tileId = 11;
        super(scene, x, y, ASSETS.spritesheet.tiles.key, tileId + power);

        this.scene = scene;
        this.power = power;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.initPhysics();
    }

    initPhysics() {
        this.setSize(16, 24);               // hitbox ajustada
        this.setFlipY(true);                // sprite invertido (para baixo)
        this.setDepth(10);                  // render acima de planos inferiores
        this.setVelocityY(this.moveVelocity * (0.5 + this.power * 0.1)); // velocidade baseada no poder
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
