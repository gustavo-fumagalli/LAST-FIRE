import ASSETS from '../assets.js';

export default class HealthKit extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, ASSETS.spritesheet.tiles.key, 24); // frame 24 = kit médico
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setScale(1.2);
        this.setDepth(5);
        this.setImmovable(true);

        // Timer para sumir depois de 10 segundos
        this.vanishTimer = scene.time.delayedCall(10000, () => {
            this.destroy();
        });

        // Timer para iniciar a piscada nos últimos 3 segundos (após 7s)
        this.blinkTimer = scene.time.delayedCall(7000, () => {
            this.blinkTween = scene.tweens.add({
                targets: this,
                alpha: 0,
                ease: 'Linear',
                duration: 300, // Pisca a cada 300ms (ajuste para piscar mais devagar/rápido)
                yoyo: true,
                repeat: -1
            });
        });
    }

    collect(player) {
    if (player.health < 10) {
        player.health++;
        if (this.scene.updateHealthDisplay) {
            this.scene.updateHealthDisplay(player.health);
        }

        // SUBTRAI 200 pontos ao pegar o kit
        if (this.scene.updateScore) {
            this.scene.updateScore(-75);
        }

        // Toca o som do medkit
        if (this.scene.medkitSound) {
            this.scene.medkitSound.play();
        }
    }
        // ... resto igual
        if (this.vanishTimer) this.vanishTimer.remove();
        if (this.blinkTimer) this.blinkTimer.remove();
        if (this.blinkTween) this.blinkTween.stop();
        this.destroy();
    }   

    // Garante que não fica piscando depois de sumir de outra forma
    preDestroy() {
        if (this.blinkTween) this.blinkTween.stop();
        if (this.blinkTimer) this.blinkTimer.remove();
        if (this.vanishTimer) this.vanishTimer.remove();
    }
}