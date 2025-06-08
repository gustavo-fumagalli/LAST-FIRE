import ASSETS from '../assets.js';

export default class HealthKit extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, ASSETS.spritesheet.tiles.key, 24); // frame 10 = kit médico
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setScale(1.2);
        this.setDepth(5);
        this.setImmovable(true);
    }

    collect(player) {
        if (player.health < 10) {
            player.health++;
            if (this.scene.updateHealthDisplay) {
                this.scene.updateHealthDisplay(player.health);
            }
        }
        this.destroy();
    }
}