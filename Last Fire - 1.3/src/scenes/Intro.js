export class Intro extends Phaser.Scene {
    constructor() {
        super('Intro');
        this.skipped = false;
        this.introStarted = false;
    }

    preload() {
        this.load.video('intro', 'assets/Intro.mp4', 'loadeddata', false, false);
        this.load.audio('intro_sound', 'assets/intro_sound.mp3');
    }

    create() {
        this.skipped = false;
        this.introStarted = false;

        this.pressToStartText = this.add.text(
            this.scale.width / 2,
            this.scale.height / 2,
            'Pressione qualquer tecla para começar',
            { fontSize: '32px', color: '#fff', stroke: '#000', strokeThickness: 5 }
        ).setOrigin(0.5);

        // Espera qualquer tecla ou clique para iniciar vídeo/áudio
        const startIntro = () => {
            if (this.introStarted) return;
            this.introStarted = true;

            this.pressToStartText.setVisible(false);

            // Adiciona vídeo (sem looping)
            this.video = this.add.video(
                this.scale.width / 2,
                this.scale.height / 2,
                'intro'
            ).setOrigin(0.5).setScale(1);
            this.video.play(false);

            // Toca áudio sincronizado
            this.introSound = this.sound.add('intro_sound', { volume: 1 });
            this.introSound.play();

            // Agora sim! Cria o texto por cima do vídeo:
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
            ).setOrigin(1, 1).setDepth(10).setVisible(true);

            // --- CONTROLE DE PULAR E FIM ---
            this.holdingSpace = false;
            this.holdSpaceTimer = 0;
            this.spaceHoldEvent = null;

            this.input.keyboard.on('keydown-SPACE', this.onSpaceDown, this);
            this.input.keyboard.on('keyup-SPACE', this.onSpaceUp, this);

            this.video.video.addEventListener('ended', () => this.skip());

            this.input.keyboard.off('keydown', startIntro);
            this.input.off('pointerdown', startIntro);
        };

        this.input.keyboard.on('keydown', startIntro);
        this.input.on('pointerdown', startIntro);
    }

    // ... (restante do código igual)
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

    skip() {
        if (this.skipped) return;
        this.skipped = true;

        if (this.video) this.video.stop();
        if (this.introSound && this.introSound.isPlaying) this.introSound.stop();
        if (this.skipText) this.skipText.destroy();
        if (this.pressToStartText) this.pressToStartText.destroy();

        this.input.keyboard.off('keydown-SPACE', this.onSpaceDown, this);
        this.input.keyboard.off('keyup-SPACE', this.onSpaceUp, this);

        this.scene.start('Game');
    }
}