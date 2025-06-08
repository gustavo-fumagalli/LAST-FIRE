export class Intro extends Phaser.Scene {
    constructor() {
        super('Intro');
        this.skipped = false;
    }

    preload() {
        this.load.video('intro', 'assets/Intro.mp4', 'loadeddata', false, true);
    }

    create() {
        const video = this.add.video(this.scale.width / 2, this.scale.height / 2, 'intro').setOrigin(0.5).setScale(1);
        video.play(true); // Tenta forçar com áudio


        this.skipped = false;

        video.video.addEventListener('ended', () => {
            if (!this.skipped) {
                this.skipped = true;
                video.stop();
                this.scene.start('Game');
            }
        });

        const skip = () => {
            if (!this.skipped) {
                this.skipped = true;
                video.stop();
                this.scene.start('Game');
            }
        };
        this.input.once('pointerdown', skip);
        this.input.keyboard.once('keydown', skip);
    }
}