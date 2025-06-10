// Cena de cutscene final, com vídeo e som, e possibilidade de pular segurando ESPAÇO
export class CutsceneFinal extends Phaser.Scene {
    constructor() {
        super('CutsceneFinal');
        this.skipped = false;          // Controle se já foi pulada ou finalizada
        this.cutsceneStarted = false;  // Controle se a cutscene já começou
    }

    // Carrega o vídeo e áudio da cutscene final
    preload() {
        this.load.video('fim', 'assets/Fim.mp4', 'loadeddata', false, false); // vídeo sem looping
        this.load.audio('final_sound', 'assets/final_sound.mp3');
    }

    // Cria os elementos de texto e inicializa eventos
    create() {
        this.skipped = false;
        this.cutsceneStarted = false;

        // Mensagem para pressionar qualquer tecla para iniciar a cutscene
        this.pressToStartText = this.add.text(
            this.scale.width / 2,
            this.scale.height / 2,
            'Pressione qualquer tecla para continuar',
            { fontSize: '32px', color: '#fff', stroke: '#000', strokeThickness: 5 }
        ).setOrigin(0.5);

        // Texto discreto para mostrar como pular (aparece só durante o vídeo)
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

        // Função para iniciar a cutscene (vídeo e áudio)
        const startCutscene = () => {
            if (this.cutsceneStarted) return;
            this.cutsceneStarted = true;

            this.pressToStartText.setVisible(false);

            // Adiciona o vídeo na tela e inicia reprodução (sem looping)
            this.video = this.add.video(
                this.scale.width / 2,
                this.scale.height / 2,
                'fim'
            ).setOrigin(0.5).setScale(1);
            this.video.play(false);

            // Toca o som final sincronizado com o vídeo
            this.finalSound = this.sound.add('final_sound', { volume: 1 });
            this.finalSound.play();

            // Mostra o texto de "Segure espaço para pular"
            this.skipText.setVisible(true);

            // Inicializa variáveis para controle do pulo
            this.holdingSpace = false;
            this.holdSpaceTimer = 0;
            this.spaceHoldEvent = null;

            // Eventos de teclado para detectar segurar/soltar espaço
            this.input.keyboard.on('keydown-SPACE', this.onSpaceDown, this);
            this.input.keyboard.on('keyup-SPACE', this.onSpaceUp, this);

            // Quando o vídeo terminar, chama delayedToRanking()
            this.video.video.addEventListener('ended', () => this.delayedToRanking());

            // Remove listeners únicos para não reiniciar cutscene de novo
            this.input.keyboard.off('keydown', startCutscene);
            this.input.off('pointerdown', startCutscene);
        };

        // Espera qualquer tecla ou clique para começar a cutscene
        this.input.keyboard.on('keydown', startCutscene);
        this.input.on('pointerdown', startCutscene);
    }

    // Quando o jogador SEGURA espaço: inicia o timer para pular (só pula se segurar 1s)
    onSpaceDown() {
        if (!this.holdingSpace) {
            this.holdingSpace = true;
            this.holdSpaceTimer = this.time.now;
            // Repetidamente checa se já segurou espaço por 1 segundo
            this.spaceHoldEvent = this.time.addEvent({
                delay: 50,
                loop: true,
                callback: () => {
                    if (this.holdingSpace && (this.time.now - this.holdSpaceTimer >= 1000)) {
                        this.skip(); // Se sim, pula a cutscene
                    }
                }
            });
        }
    }

    // Quando SOLTA espaço: cancela o timer
    onSpaceUp() {
        this.holdingSpace = false;
        if (this.spaceHoldEvent) {
            this.spaceHoldEvent.remove();
            this.spaceHoldEvent = null;
        }
    }

    // Função chamada quando o vídeo termina normalmente (ou pelo skip)
    delayedToRanking() {
        if (this.skipped) return;
        this.skipped = true;

        // Para vídeo e áudio, remove textos e listeners
        if (this.video) this.video.stop();
        if (this.finalSound && this.finalSound.isPlaying) this.finalSound.stop();
        if (this.skipText) this.skipText.destroy();
        if (this.pressToStartText) this.pressToStartText.destroy();

        this.input.keyboard.off('keydown-SPACE', this.onSpaceDown, this);
        this.input.keyboard.off('keyup-SPACE', this.onSpaceUp, this);

        // Após 4 segundos, vai para tela de ranking/nome
        this.time.delayedCall(4000, () => {
            const score = this.registry.get('lastscore') || 0;
            this.scene.start('EnterName', { score });
        });
    }

    // Skip imediato: pula a cutscene se segurou espaço
    skip() {
        if (this.skipped) return;
        this.skipped = true;

        if (this.video) this.video.stop();
        if (this.finalSound && this.finalSound.isPlaying) this.finalSound.stop();
        if (this.skipText) this.skipText.destroy();
        if (this.pressToStartText) this.pressToStartText.destroy();

        this.input.keyboard.off('keydown-SPACE', this.onSpaceDown, this);
        this.input.keyboard.off('keyup-SPACE', this.onSpaceUp, this);

        // Aguarda 4 segundos e vai para ranking/nome
        this.time.delayedCall(4000, () => {
            const score = this.registry.get('lastscore') || 0;
            this.scene.start('EnterName', { score });
        });
    }
}
