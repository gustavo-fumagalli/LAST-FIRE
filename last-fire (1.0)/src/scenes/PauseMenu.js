export class PauseMenu extends Phaser.Scene {
    constructor() {
        super('PauseMenu');
    }

    create() {
        // Fundo semitransparente
        this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.6);

        this.add.text(640, 260, 'PAUSADO', {
            fontSize: '64px',
            fill: '#fff'
        }).setOrigin(0.5);

        // Botão Continuar
        const resumeBtn = this.add.text(640, 370, 'CONTINUAR', {
            fontSize: '38px',
            fill: '#fff',
            backgroundColor: '#1d1d2e',
            padding: { left: 28, right: 28, top: 12, bottom: 12 },
        }).setOrigin(0.5).setInteractive();

        resumeBtn.on('pointerdown', () => {
            this.scene.stop();
            this.scene.resume('Game');
        });

        // Botão Reiniciar
        const restartBtn = this.add.text(640, 430, 'REINICIAR', {
            fontSize: '32px',
            fill: '#fff',
            backgroundColor: '#1d1d2e',
            padding: { left: 20, right: 20, top: 8, bottom: 8 },
        }).setOrigin(0.5).setInteractive();

        restartBtn.on('pointerdown', () => {
            this.scene.stop('Game');
            this.scene.stop();
            this.scene.start('Game');
        });

        // Botão Sair ao Menu
        const menuBtn = this.add.text(640, 490, 'MENU', {
            fontSize: '32px',
            fill: '#fff',
            backgroundColor: '#1d1d2e',
            padding: { left: 20, right: 20, top: 8, bottom: 8 },
        }).setOrigin(0.5).setInteractive();

        menuBtn.on('pointerdown', () => {
            this.scene.stop('Game');
            this.scene.stop();
            this.scene.start('Start');
        });

        // ESC fecha menu de pausa
        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.stop();
            this.scene.resume('Game');
        });
    }
}