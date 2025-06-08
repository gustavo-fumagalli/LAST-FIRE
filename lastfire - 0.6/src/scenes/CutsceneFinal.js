export class CutsceneFinal extends Phaser.Scene {
    constructor() {
        super('CutsceneFinal');
    }

    create() {
        this.add.text(this.scale.width / 2, this.scale.height / 2, 'CUTSCENE FINAL\n(em produção)', {
            fontSize: '56px',
            fill: '#fff',
            align: 'center'
        }).setOrigin(0.5);

        // Botão para voltar ao menu (opcional)
        const voltar = this.add.text(this.scale.width / 2, this.scale.height / 2 + 100, 'VOLTAR AO MENU', {
            fontSize: '36px',
            fill: '#ffd700',
            backgroundColor: '#222',
            padding: { left: 24, right: 24, top: 12, bottom: 12 }
        }).setOrigin(0.5).setInteractive();

        voltar.on('pointerdown', () => {
            this.scene.start('Start');
        });
    }
}