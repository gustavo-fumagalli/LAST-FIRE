import ASSETS from '../assets.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    velocityIncrement = 50;
    velocityMax = 300;
    drag = 1000;
    fireRate = 22;
    fireCounter = 0;
    health = 3;

    constructor(scene, x, y, shipId) {
        super(scene, x, y, ASSETS.spritesheet.ships.key, shipId);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true); // prevent ship from leaving the screen
        this.setDepth(100); // make ship appear on top of other game objects
        this.scene = scene;
        this.setMaxVelocity(this.velocityMax); // limit maximum speed of ship
        this.setDrag(this.drag);
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        if (this.fireCounter > 0) this.fireCounter--;

        this.checkInput();
    }

    checkInput() {
        const cursors = this.scene.cursors;
        const leftKey = cursors.left.isDown;
        const rightKey = cursors.right.isDown;
        const upKey = cursors.up.isDown;
        const downKey = cursors.down.isDown;
        const spaceKey = cursors.space.isDown;

        const moveDirection = { x: 0, y: 0 };

        if (leftKey) moveDirection.x--;
        if (rightKey) moveDirection.x++;
        if (upKey) moveDirection.y--;
        if (downKey) moveDirection.y++;
        if (spaceKey) this.fire();

        // Mover
        this.body.velocity.x += moveDirection.x * this.velocityIncrement;
        this.body.velocity.y += moveDirection.y * this.velocityIncrement;

        // --- Animação de andar ---
        if (leftKey || rightKey || upKey || downKey) {
            if (!this.anims.isPlaying || this.anims.getName() !== 'walk') {
                this.anims.play('walk');
            }
        } else {
            // Nenhuma seta pressionada: frame parado
            this.anims.stop();
            this.setFrame(8); // Troque para o frame do sprite "parado" do soldado
        }
    }

    fire() {
        if (this.fireCounter > 0) return;

        this.fireCounter = this.fireRate;

        this.scene.fireBullet(this.x, this.y);
    }

   hit(damage) {
    this.health -= damage;

    // Atualiza o display de vida na HUD do Game
    if (this.scene && this.scene.updateHealthDisplay) {
        this.scene.updateHealthDisplay(this.health);
    }

    if (this.health <= 0) this.die();
}

    die() {
        this.scene.addExplosion(this.x, this.y);
        this.destroy(); // destroy sprite so it is no longer updated
    }
}