export class CutsceneFinal extends Phaser.Scene {
    constructor() {
        super('CutsceneFinal');
    }

    create() {
        // Seu texto ou animação da cutscene
        this.add.text(this.scale.width / 2, this.scale.height / 2, 'CUTSCENE FINAL\n(em produção)', {
            fontSize: '56px',
            fill: '#fff',
            align: 'center'
        }).setOrigin(0.5);

        // Aguarda 4 segundos e então vai para a tela de digitar nome
        this.time.delayedCall(4000, () => {
            // Pega o score do jogo (do registry, igual GameOver)
            const score = this.registry.get('lastscore') || 0;
            this.scene.start('EnterName', { score });
        });

        // OU se você tiver uma animação/vídeo, faça o mesmo ao terminar
        // (Se quiser, pode adicionar um botão de "pular", igual no GameOver)
    
        this.input.once('pointerdown', () => {
        const score = this.registry.get('lastscore') || 0;
        this.scene.start('EnterName', { score });
        });
    
    
    }
}