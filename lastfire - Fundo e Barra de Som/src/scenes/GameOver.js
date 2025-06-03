export class GameOver extends Phaser.Scene {
    constructor() {
        super('GameOver');
    }

    preload() {
        this.load.video('gameover', 'assets/game_over.mp4', 'loadeddata', false, true);
    }

    create() {
        const video = this.add.video(this.scale.width / 2, this.scale.height / 2, 'gameover').setOrigin(0.5).setScale(1);
        video.play(true);

        video.video.addEventListener('ended', () => {
            this.scene.start('Start'); // volta para menu inicial após o vídeo
        });

        // Pular vídeo com clique
        this.input.once('pointerdown', () => {
            video.stop();
            this.scene.start('Start');
        });
    }
}
