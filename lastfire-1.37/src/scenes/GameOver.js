// Cena de Game Over: mostra um vídeo e depois encaminha para a tela de digitar nome/score
export class GameOver extends Phaser.Scene {
    constructor() {
        super('GameOver'); // Nome da cena
    }

    // Pré-carrega o vídeo de game over
    preload() {
        this.load.video('gameover', 'assets/game_over.mp4', 'loadeddata', false, true);
    }

    // Cria o vídeo na tela e define eventos para finalizar ou pular o vídeo
    create() {
        // Adiciona o vídeo centralizado e inicia a reprodução
        const video = this.add.video(this.scale.width / 2, this.scale.height / 2, 'gameover').setOrigin(0.5).setScale(1);
        video.play();
        this.returningToMenu = false; // Controle para evitar múltiplas transições

        // Quando o vídeo termina, avança para a cena de digitar nome/score
        video.video.addEventListener('ended', () => {
            if (!this.returningToMenu) {
                this.returningToMenu = true;
                this.scene.start('EnterName', { score: this.registry.get('lastscore') }); // Passa o score para a próxima cena
            }
        });

        // Permite pular o vídeo com um clique (mouse ou toque)
        this.input.once('pointerdown', () => {
            if (!this.returningToMenu) {
                this.returningToMenu = true;
                video.stop();
                this.scene.start('EnterName', { score: this.registry.get('lastscore') });
            }
        });
    }
}
