
export class Start extends Phaser.Scene {
    constructor() {
        super('Start');
    }

    create() {
        // Fundo
        this.cameras.main.setBackgroundColor('#040218');
        this.add.text(640, 180, 'LASTFIRE', {
            fontSize: '80px',
            fill: '#fff',
            fontFamily: 'Arial',
        }).setOrigin(0.5);

        // Botão Jogar
        const playButton = this.add.text(640, 340, 'JOGAR', {
            fontSize: '48px',
            fill: '#fff',
            backgroundColor: '#212143',
            padding: { left: 32, right: 32, top: 16, bottom: 16 },
            borderRadius: 16
        }).setOrigin(0.5).setInteractive();

        playButton.on('pointerdown', () => {
            this.scene.start('Game');
        });

        // Botão Sair (opcional)
        const exitButton = this.add.text(640, 420, 'SAIR', {
            fontSize: '36px',
            fill: '#ccc',
            backgroundColor: '#212143',
            padding: { left: 28, right: 28, top: 14, bottom: 14 },
            borderRadius: 16
        }).setOrigin(0.5).setInteractive();

        exitButton.on('pointerdown', () => {
            window.close(); // Nem sempre funciona no navegador, mas está aqui para desktop/app.
        });

        // Créditos ou instruções
        this.add.text(640, 550, 'Aperte ESC para pausar o jogo.', {
            fontSize: '22px',
            fill: '#aaa'
        }).setOrigin(0.5);
    }
}