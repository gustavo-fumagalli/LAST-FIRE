export class GameOver extends Phaser.Scene {
    constructor() {
        super('GameOver');
    }

    preload() {
        this.load.video('gameover', 'assets/game_over.mp4', 'loadeddata', false, true);
    }

    create() {
        const video = this.add.video(this.scale.width / 2, this.scale.height / 2, 'gameover').setOrigin(0.5).setScale(1);
        video.play();
        this.returningToMenu = false;

        video.video.addEventListener('ended', () => {
            if (!this.returningToMenu) {
                this.returningToMenu = true;
                this.scene.start('EnterName', { score: this.registry.get('lastscore') }); // Passa o score para a próxima cena
            }
        });

        // Pular vídeo com clique
        this.input.once('pointerdown', () => {
            if (!this.returningToMenu) {
                this.returningToMenu = true;
                video.stop();
                this.scene.start('EnterName', { score: this.registry.get('lastscore') });
            }
        });
    }
}
