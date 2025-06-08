export class CutsceneFinal extends Phaser.Scene {
    constructor() {
        super('CutsceneFinal');
        this.skipped = false;
        this.cutsceneStarted = false;
    }

    preload() {
        this.load.video('fim', 'assets/Fim.mp4', 'loadeddata', false, false); // vídeo sem looping
        this.load.audio('final_sound', 'assets/final_sound.mp3');
    }

    create() {
        this.skipped = false;
        this.cutsceneStarted = false;

        // Mensagem inicial para iniciar a cutscene
        this.pressToStartText = this.add.text(
            this.scale.width / 2,
            this.scale.height / 2,
            'Pressione qualquer tecla para continuar',
            { fontSize: '32px', color: '#fff', stroke: '#000', strokeThickness: 5 }
        ).setOrigin(0.5);

        // Mensagem para pular, discreta no canto inferior direito, invisível até o vídeo começar
        this.skipText = this.add.text(
            this.scale.width - 30,
            this.scale.height - 20,
            'Segure ESPAÇO para pular',
            {
                fontSize: '18px',
                color: '#ffffff99',
                stroke: '#00000099',
                strokeThickness: 2,
                fontStyle: 'italic',
                fontFamily: 'Arial',
                align: 'right'
            }
        ).setOrigin(1, 1).setDepth(10).setVisible(false);

        // Espera tecla ou clique para iniciar vídeo/áudio
        const startCutscene = () => {
            if (this.cutsceneStarted) return;
            this.cutsceneStarted = true;

            this.pressToStartText.setVisible(false);

            // Adiciona vídeo (sem looping)
            this.video = this.add.video(
                this.scale.width / 2,
                this.scale.height / 2,
                'fim'
            ).setOrigin(0.5).setScale(1);
            this.video.play(false);

            // Toca áudio sincronizado
            this.finalSound = this.sound.add('final_sound', { volume: 1 });
            this.finalSound.play();

            // Mensagem de pular fica visível
            this.skipText.setVisible(true);

            // Controle de segurar espaço para pular
            this.holdingSpace = false;
            this.holdSpaceTimer = 0;
            this.spaceHoldEvent = null;

            this.input.keyboard.on('keydown-SPACE', this.onSpaceDown, this);
            this.input.keyboard.on('keyup-SPACE', this.onSpaceUp, this);

            // Detecta fim do vídeo
            this.video.video.addEventListener('ended', () => this.delayedToRanking());

            // Remove listeners únicos
            this.input.keyboard.off('keydown', startCutscene);
            this.input.off('pointerdown', startCutscene);
        };

        this.input.keyboard.on('keydown', startCutscene);
        this.input.on('pointerdown', startCutscene);
    }

    // Player segura espaço: inicia contagem
    onSpaceDown() {
        if (!this.holdingSpace) {
            this.holdingSpace = true;
            this.holdSpaceTimer = this.time.now;
            this.spaceHoldEvent = this.time.addEvent({
                delay: 50,
                loop: true,
                callback: () => {
                    if (this.holdingSpace && (this.time.now - this.holdSpaceTimer >= 1000)) {
                        this.skip();
                    }
                }
            });
        }
    }

    onSpaceUp() {
        this.holdingSpace = false;
        if (this.spaceHoldEvent) {
            this.spaceHoldEvent.remove();
            this.spaceHoldEvent = null;
        }
    }

    // Função chamada para finalizar a cutscene e ir ao ranking (com delay de 4s)
    delayedToRanking() {
        if (this.skipped) return;
        this.skipped = true;

        if (this.video) this.video.stop();
        if (this.finalSound && this.finalSound.isPlaying) this.finalSound.stop();
        if (this.skipText) this.skipText.destroy();
        if (this.pressToStartText) this.pressToStartText.destroy();

        this.input.keyboard.off('keydown-SPACE', this.onSpaceDown, this);
        this.input.keyboard.off('keyup-SPACE', this.onSpaceUp, this);

        // Aguarda 4 segundos e vai para o ranking
        this.time.delayedCall(4000, () => {
            const score = this.registry.get('lastscore') || 0;
            this.scene.start('EnterName', { score });
        });
    }

    // Skip imediato (ao segurar espaço)
    skip() {
        if (this.skipped) return;
        this.skipped = true;

        if (this.video) this.video.stop();
        if (this.finalSound && this.finalSound.isPlaying) this.finalSound.stop();
        if (this.skipText) this.skipText.destroy();
        if (this.pressToStartText) this.pressToStartText.destroy();

        this.input.keyboard.off('keydown-SPACE', this.onSpaceDown, this);
        this.input.keyboard.off('keyup-SPACE', this.onSpaceUp, this);

        // Aguarda 4 segundos antes de mudar para ranking
        this.time.delayedCall(4000, () => {
            const score = this.registry.get('lastscore') || 0;
            this.scene.start('EnterName', { score });
        });
    }
}