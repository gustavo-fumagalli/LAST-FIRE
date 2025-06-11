// Cena de introdução (Intro): exibe vídeo e áudio, permite pular segurando espaço
export class Intro extends Phaser.Scene {
    constructor() {
        super('Intro'); // Nome da cena
        this.skipped = false;         // Controle se a intro já foi pulada
        this.introStarted = false;    // Controle se a intro já começou
    }

    // Carrega o vídeo e áudio da introdução
    preload() {
        this.load.video('intro', 'assets/Intro.mp4', 'loadeddata', false, false);
        this.load.audio('intro_sound', 'assets/intro_sound.mp3');
    }

    // Cria os textos, eventos e prepara para iniciar a intro
    create() {
        this.skipped = false;
        this.introStarted = false;

        // Texto inicial para pressionar qualquer tecla e iniciar a intro
        this.pressToStartText = this.add.text(
            this.scale.width / 2,
            this.scale.height / 2,
            'Pressione qualquer tecla para começar',
            { fontSize: '32px', color: '#fff', stroke: '#000', strokeThickness: 5 }
        ).setOrigin(0.5);

        // Função que realmente inicia o vídeo/áudio ao apertar tecla ou clicar
        const startIntro = () => {
            if (this.introStarted) return; // Evita iniciar mais de uma vez
            this.introStarted = true;

            this.pressToStartText.setVisible(false);

            // Adiciona o vídeo centralizado e inicia reprodução
            this.video = this.add.video(
                this.scale.width / 2,
                this.scale.height / 2,
                'intro'
            ).setOrigin(0.5).setScale(1);
            this.video.play(false); // Não faz loop

            // Toca o som de introdução sincronizado
            this.introSound = this.sound.add('intro_sound', { volume: 1 });
            this.introSound.play();

            // Mostra texto para instruir sobre pular a intro
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

            // Eventos para detectar se o espaço foi pressionado e segurado
            this.input.keyboard.on('keydown-SPACE', this.onSpaceDown, this);
            this.input.keyboard.on('keyup-SPACE', this.onSpaceUp, this);

            // Quando o vídeo termina normalmente, pula para o jogo
            this.video.video.addEventListener('ended', () => this.skip());

            // Remove listeners para não reiniciar a intro de novo
            this.input.keyboard.off('keydown', startIntro);
            this.input.off('pointerdown', startIntro);
        };

        // Espera qualquer tecla ou clique para iniciar a intro
        this.input.keyboard.on('keydown', startIntro);
        this.input.on('pointerdown', startIntro);
    }

    // Função chamada quando o jogador segura espaço: inicia timer de pulo
    onSpaceDown() {
        if (!this.holdingSpace) {
            this.holdingSpace = true;
            this.holdSpaceTimer = this.time.now;
            this.spaceHoldEvent = this.time.addEvent({
                delay: 50,
                loop: true,
                callback: () => {
                    if (this.holdingSpace && (this.time.now - this.holdSpaceTimer >= 1000)) {
                        this.skip(); // Se segurar espaço por 1s, pula intro
                    }
                }
            });
        }
    }

    // Função chamada quando o jogador solta espaço: cancela o timer de pulo
    onSpaceUp() {
        this.holdingSpace = false;
        if (this.spaceHoldEvent) {
            this.spaceHoldEvent.remove();
            this.spaceHoldEvent = null;
        }
    }

    // Função para pular a intro (seja pelo fim do vídeo ou por pulo)
    skip() {
        if (this.skipped) return;
        this.skipped = true;

        if (this.video) this.video.stop();
        if (this.introSound && this.introSound.isPlaying) this.introSound.stop();
        if (this.skipText) this.skipText.destroy();
        if (this.pressToStartText) this.pressToStartText.destroy();

        // Remove eventos de espaço
        this.input.keyboard.off('keydown-SPACE', this.onSpaceDown, this);
        this.input.keyboard.off('keyup-SPACE', this.onSpaceUp, this);

        // Inicia a cena do jogo
        this.scene.start('Game');
    }
}
