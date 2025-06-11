// Cena Start: menu principal do jogo, com animações, créditos, ranking e opções
export class Start extends Phaser.Scene {
    constructor() {
        super('Start');
        this.isShowingCredits = false;   // Indica se os créditos estão na tela
        this.started = false;            // Controle para iniciar o menu apenas uma vez
        this.highScoreTexts = [];        // Guarda textos do ranking para fácil remoção
    }

    init() {
        this.started = false; // Garante reset ao voltar ao menu
    }

    preload() {
        // Carrega logo, fundo e sons do menu
        this.load.image('logo', 'assets/logo.png');
        this.load.image('background', 'assets/background.png');
        this.load.audio('menuMusic', 'assets/menu_music.mp3');
        this.load.audio('menuMove', 'assets/menu_move.wav');
    }

    create() {
        // Fundo do menu
        this.bg = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'background')
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height)
            .setDepth(-100);

        this.cameras.main.setBackgroundColor('#040218');

        // Música de fundo do menu (loop)
        this.menuMusic = this.sound.add('menuMusic', { loop: true, volume: 0.5 });
        this.menuMusic.play();

        this.menuMoveSound = this.sound.add('menuMove');

        // Logo centralizado
        this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'logo')
            .setOrigin(0.5).setScale(0.9).setDepth(-1);

        // Título do jogo, animado de cima para o centro
        this.lastFireText = this.add.text(
            this.cameras.main.width / 2,
            -100,
            'LAST FIRE',
            {
                fontSize: '90px',
                fill: '#ccddee',
                fontFamily: 'Share Tech Mono',
                shadow: {
                    offsetX: 2,
                    offsetY: 2,
                    color: '#000033',
                    blur: 8,
                    stroke: true,
                    fill: true
                }
            }
        ).setOrigin(0.5).setScale(0.2);

        // Texto de instrução "APERTE QUALQUER TECLA PARA COMEÇAR"
        this.pressAnyKeyText = this.add.text(
            this.cameras.main.width / 2,
            500,
            'APERTE QUALQUER TECLA PARA COMEÇAR',
            {
                fontSize: '20px',
                fill: '#ccddee',
                fontFamily: 'Share Tech Mono',
                shadow: {
                    offsetX: 1,
                    offsetY: 1,
                    color: '#000022',
                    blur: 6,
                    stroke: true,
                    fill: true
                }
            }
        ).setOrigin(0.5);

        // Animação do título descendo
        this.tweens.add({
            targets: this.lastFireText,
            y: 180,
            scale: 1.0,
            duration: 2500,
            ease: 'Bounce.easeOut',
        });

        // Pisca o texto de instrução até o menu ser ativado
        this.blinkTween = this.tweens.add({
            targets: this.pressAnyKeyText,
            alpha: 0,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // Cria os botões do menu mas deixa invisíveis até começar
        this.createMainMenuButtons();
        this.buttons.forEach(btn => btn.setVisible(false));
        this.disableMenuControls();

        // Listener para iniciar o menu com qualquer tecla
        this.anyKeyListener = this.input.keyboard.on('keydown', () => {
            if (!this.started) {
                this.startMenu();
            }
        });
    }

    // Chama quando o jogador aperta qualquer tecla para começar o menu
    startMenu() {
        if (this.started) return;
        this.started = true;

        // Remove listener para evitar reinício
        if (this.anyKeyListener) {
            this.input.keyboard.off('keydown', this.anyKeyListener);
            this.anyKeyListener = null;
        }

        // Para animação, esconde texto, mostra botões e ativa controles
        this.blinkTween.stop();
        this.pressAnyKeyText.setVisible(false);
        this.buttons.forEach(btn => btn.setVisible(true));
        this.enableMenuControls();

        // Exibe o ranking no menu
        this.showHighScores();
    }

    // Cria os botões principais do menu
    createMainMenuButtons() {
        if (this.buttons) this.buttons.forEach(btn => btn.destroy());
        if (this.creditsTexts) this.creditsTexts.forEach(t => t.destroy());
        this.creditsTexts = null;
        this.isShowingCredits = false;

        this.buttons = [];

        const startY = 320;
        const spacing = 80;

        // Botão "JOGAR", "CRÉDITOS" e "SAIR"
        const playButton = this.createPixelButton(640, startY, 'JOGAR', () => this.selectOption(0));
        const creditsButton = this.createPixelButton(640, startY + spacing, 'CRÉDITOS', () => this.selectOption(1));
        const exitButton = this.createPixelButton(640, startY + spacing * 2, 'SAIR', () => this.selectOption(2));

        this.buttons.push(playButton, creditsButton, exitButton);

        this.selectedIndex = 0;
        this.updateButtonSelection();
    }

    // Função utilitária para criar botão pixelizado
    createPixelButton(x, y, label, callback) {
        const btn = this.add.text(x, y, label, {
            fontFamily: 'Share Tech Mono',
            fontSize: '24px',
            fill: '#aaccee',
            stroke: '#224488',
            strokeThickness: 1,
            padding: { left: 15, right: 15, top: 8, bottom: 8 },
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        btn.on('pointerover', () => {
            btn.setStyle({ fill: '#ffffff', stroke: '#88bbff' });
        });

        btn.on('pointerout', () => {
            btn.setStyle({ fill: '#aaccee', stroke: '#224488' });
        });

        btn.on('pointerdown', callback);

        return btn;
    }

    // Atualiza visual do botão selecionado no menu (teclado ou mouse)
    updateButtonSelection() {
        this.buttons.forEach((btn, index) => {
            if (index === this.selectedIndex) {
                btn.setStyle({
                    fill: '#ffffff',
                    stroke: '#ffff88',
                    fontSize: '28px'
                });
            } else {
                btn.setStyle({
                    fill: '#aaccee',
                    stroke: '#224488',
                    fontSize: '24px'
                });
            }
        });
    }

    // Desativa controles do menu
    disableMenuControls() {
        if (this.upKeyListener) this.input.keyboard.off('keydown-UP', this.upKeyListener);
        if (this.downKeyListener) this.input.keyboard.off('keydown-DOWN', this.downKeyListener);
        if (this.enterKeyListener) this.input.keyboard.off('keydown-ENTER', this.enterKeyListener);
        if (this.escKeyListener) this.input.keyboard.off('keydown-ESC', this.escKeyListener);
    }

    // Ativa controles do menu (setas, enter, esc)
    enableMenuControls() {
        this.upKeyListener = () => {
            if (!this.isShowingCredits) {
                this.selectedIndex = (this.selectedIndex - 1 + this.buttons.length) % this.buttons.length;
                this.menuMoveSound.play();
                this.updateButtonSelection();
            }
        };
        this.downKeyListener = () => {
            if (!this.isShowingCredits) {
                this.selectedIndex = (this.selectedIndex + 1) % this.buttons.length;
                this.menuMoveSound.play();
                this.updateButtonSelection();
            }
        };
        this.enterKeyListener = () => {
            if (!this.isShowingCredits) {
                this.selectOption(this.selectedIndex);
            }
        };
        this.escKeyListener = () => {
            if (this.isShowingCredits) {
                this.hideCredits();
            }
        };

        this.input.keyboard.on('keydown-UP', this.upKeyListener);
        this.input.keyboard.on('keydown-DOWN', this.downKeyListener);
        this.input.keyboard.on('keydown-ENTER', this.enterKeyListener);
        this.input.keyboard.on('keydown-ESC', this.escKeyListener);
    }

    // Ação dos botões: JOGAR, CRÉDITOS, SAIR
    selectOption(index) {
        switch (index) {
            case 0: // JOGAR
                this.menuMusic.stop();
                this.scene.start('Intro');
                break;
            case 1: // CRÉDITOS
                this.showCredits();
                break;
            case 2: // SAIR
                window.close();
                break;
        }
    }

    // Exibe créditos animados, botando um fundo escuro e texto subindo
    showCredits() {
        this.buttons.forEach(btn => btn.destroy());
        this.buttons = [];

        this.isShowingCredits = true;

        this.creditsBackground = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.9);

        const creditText = `DESENVOLVIMENTO
Daniel Tsuyama
Miguel Carreira
Gustavo Fumagalli
Renan Guimarães
Danilo Rosa

ARTE POR
Renan Guimarães
Danilo Rosa

MÚSICA E EFEITOS POR
Daniel Tsuyama

FEITO COM
Phaser 

OBRIGADO POR JOGAR!`;

        // Container dos textos dos créditos (começa fora da tela)
        this.creditsContainer = this.add.container(640, 800);
        const creditsLines = creditText.split('\n');
        this.creditsTexts = [];

        creditsLines.forEach((line, index) => {
            const text = this.add.text(0, index * 40, line.trim(), {
                fontSize: '28px',
                fill: '#ffff00',
                fontFamily: 'Share Tech Mono',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 3
            }).setOrigin(0.5, 0);
            this.creditsContainer.add(text);
            this.creditsTexts.push(text);
        });

        // Animação de rolagem dos créditos
        this.tweens.add({
            targets: this.creditsContainer,
            y: -400,
            duration: 20000,
            ease: 'Linear',
            onComplete: () => {
                this.hideCredits();
            }
        });

        // Botão para voltar ao menu, com ESC ou clique
        this.backButton = this.add.text(640, 650, 'VOLTAR (ESC)', {
            fontSize: '28px',
            fill: '#ffffff',
            fontFamily: 'Share Tech Mono',
            backgroundColor: '#333355',
            padding: { left: 20, right: 20, top: 10, bottom: 10 }
        }).setOrigin(0.5).setInteractive();

        this.backButton.on('pointerdown', () => this.hideCredits());
    }

    // Esconde créditos e volta ao menu principal
    hideCredits() {
        if (this.creditsContainer) this.creditsContainer.destroy();
        if (this.creditsTexts) this.creditsTexts.forEach(t => t.destroy());
        if (this.backButton) this.backButton.destroy();
        if (this.creditsBackground) this.creditsBackground.destroy();

        this.creditsContainer = null;
        this.creditsTexts = null;
        this.backButton = null;
        this.creditsBackground = null;

        this.isShowingCredits = false;
        this.createMainMenuButtons();

        // Garante que a música do menu esteja tocando ao voltar
        if (!this.menuMusic.isPlaying) {
            this.menuMusic.play();
        }
    }

    // Mostra o ranking dos 5 maiores scores salvos no localStorage
    showHighScores() {
        // Remove textos antigos do ranking
        this.highScoreTexts.forEach(t => t.destroy());
        this.highScoreTexts = [];

        // Recupera os scores salvos, ordena e pega os 5 maiores
        const savedScores = localStorage.getItem('highScores');
        let scores = savedScores ? JSON.parse(savedScores) : [];
        scores.sort((a, b) => b.score - a.score);
        const topScores = scores.slice(0, 5);

        // --- Ajuste de posicionamento dos textos ---
        const baseY = 540;       // Posição vertical inicial do ranking
        const titleOffset = 0;   // Offset do título
        const listOffset = 35;   // Offset da lista
        const lineSpacing = 30;  // Espaçamento entre linhas

        // Título do ranking
        const title = this.add.text(
            640, baseY + titleOffset,
            'TOP 5',
            {
                fontSize: '20px',
                fill: '#ffff00',
                fontFamily: 'Share Tech Mono',
                align: 'center'
            }
        ).setOrigin(0.5);
        this.highScoreTexts.push(title);

        // Lista dos 5 melhores scores
        topScores.forEach((entry, index) => {
            const text = this.add.text(
                640,
                baseY + listOffset + index * lineSpacing,
                `${index + 1}. ${entry.name || 'Player'} - ${entry.score}`,
                {
                    fontSize: '16px',
                    fill: '#ffffff',
                    fontFamily: 'Share Tech Mono',
                    align: 'center'
                }
            ).setOrigin(0.5);
            this.highScoreTexts.push(text);
        });
    }
}
