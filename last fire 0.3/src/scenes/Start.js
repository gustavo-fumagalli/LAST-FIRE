export class Start extends Phaser.Scene {
    constructor() {
        super('Start');
        this.isShowingCredits = false;
    }

    preload() {
        this.load.image('logo', 'assets/logo.png');
        this.load.image('background', 'assets/background.png');
        this.load.audio('menuMusic', 'assets/menu_music.mp3');
        this.load.audio('menuMove', 'assets/menu_move.wav');
    }

    create() {
        this.bg = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'background')
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height)
            .setDepth(-100);

        this.cameras.main.setBackgroundColor('#040218');

        this.menuMusic = this.sound.add('menuMusic', { loop: true, volume: 0.5 });
        this.menuMusic.play();

        this.menuMoveSound = this.sound.add('menuMove');

        this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'logo')
            .setOrigin(0.5).setScale(1.0).setDepth(-1);

        this.lastFireText = this.add.text(640, 180, 'LAST FIRE', {
            fontSize: '75px',
            fill: '#fff',
            fontFamily: 'Vineta BT'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: this.lastFireText,
            scale: { from: 1, to: 1.2 },
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.createMainMenuButtons();

        this.input.keyboard.on('keydown-UP', () => {
            if (!this.isShowingCredits) {
                this.selectedIndex = (this.selectedIndex - 1 + this.buttons.length) % this.buttons.length;
                this.menuMoveSound.play();
                this.updateButtonSelection();
            }
        });

        this.input.keyboard.on('keydown-DOWN', () => {
            if (!this.isShowingCredits) {
                this.selectedIndex = (this.selectedIndex + 1) % this.buttons.length;
                this.menuMoveSound.play();
                this.updateButtonSelection();
            }
        });

        this.input.keyboard.on('keydown-ENTER', () => {
            if (!this.isShowingCredits) {
                this.selectOption(this.selectedIndex);
            }
        });

        this.input.keyboard.on('keydown-ESC', () => {
            if (this.isShowingCredits) {
                this.hideCredits();
            }
        });
    }

    createMainMenuButtons() {
        if (this.buttons) {
            this.buttons.forEach(btn => btn.destroy());
        }
        if (this.creditsTexts) {
            this.creditsTexts.forEach(t => t.destroy());
            this.creditsTexts = null;
        }
        this.isShowingCredits = false;

        this.buttons = [];

        const startY = 320;
        const spacing = 80;

        const playButton = this.createPixelButton(640, startY, 'JOGAR', () => this.selectOption(0));
        const creditsButton = this.createPixelButton(640, startY + spacing, 'CRÉDITOS', () => this.selectOption(1));
        const exitButton = this.createPixelButton(640, startY + spacing * 2, 'SAIR', () => this.selectOption(2));

        this.buttons.push(playButton, creditsButton, exitButton);

        this.selectedIndex = 0;
        this.updateButtonSelection();
    }

    createPixelButton(x, y, label, callback) {
        const btn = this.add.text(x, y, label, {
            fontFamily: '"Press Start 2P", monospace', // Fonte pixelada
            fontSize: '28px',
            fill: '#00ff00',                // Cor verde retrô
            backgroundColor: '#000000',     // Fundo preto
            padding: { left: 20, right: 20, top: 10, bottom: 10 },
            stroke: '#00ff00',              // Contorno verde
            strokeThickness: 2,
            align: 'center'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        btn.on('pointerover', () => {
            btn.setStyle({
                fill: '#ffff00',
                stroke: '#ffff00',
                backgroundColor: '#003300'
            });
        });

        btn.on('pointerout', () => {
            btn.setStyle({
                fill: '#00ff00',
                stroke: '#00ff00',
                backgroundColor: '#000000'
            });
        });

        btn.on('pointerdown', callback);

        return btn;
    }

    updateButtonSelection() {
        this.buttons.forEach((btn, index) => {
            if (index === this.selectedIndex) {
                btn.setStyle({
                    fill: '#ffff00',
                    stroke: '#ffff00',
                    backgroundColor: '#003300',
                    fontSize: '32px'
                });
            } else {
                btn.setStyle({
                    fill: '#00ff00',
                    stroke: '#00ff00',
                    backgroundColor: '#000000',
                    fontSize: '28px'
                });
            }
        });
    }

    selectOption(index) {
        switch (index) {
            case 0: // Jogar
                this.menuMusic.stop();
                this.scene.start('Game');
                break;
            case 1: // Créditos
                this.showCredits();
                break;
            case 2: // Sair
                window.close();
                break;
        }
    }

    showCredits() {
        // Remove botões
        this.buttons.forEach(btn => btn.destroy());
        this.buttons = [];

        this.isShowingCredits = true;

        // Fundo preto semitransparente
        this.creditsBackground = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.9);

        const creditText = `DESENVOLVIMENTO
                            Seu Nome

                            ARTE
                            Nome da Arte

                            MÚSICA
                            Nome da Trilha

                            FEITO COM
                            Phaser 3

                            OBRIGADO POR JOGAR!`;

        // Container para controlar a rolagem e transformação
        this.creditsContainer = this.add.container(640, 800); // container centralizado

        const creditsLines = creditText.split('\n');
        this.creditsTexts = [];

        creditsLines.forEach((line, index) => {
            const text = this.add.text(0, index * 40, line.trim(), {
                fontSize: '28px',
                fill: '#ffff00',
                fontFamily: 'Arial',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 3
            }).setOrigin(0.5, 0); // Centraliza horizontalmente
            this.creditsContainer.add(text);
            this.creditsTexts.push(text);
        });

        this.tweens.add({
            targets: this.creditsContainer,
            y: -400,
            duration: 20000,
            ease: 'Linear',
            onUpdate: (tween, target) => {
                const progress = Phaser.Math.Clamp((target.y + 400) / (800 + 400), 0, 1);
                const scale = 0.5 + progress * 1.5;
                target.setScale(scale);

            },
            onComplete: () => {
                this.hideCredits();
            }
        });

        // Texto para "VOLTAR" aparece durante a animação, clicável para sair rápido
        this.backButton = this.add.text(640, 650, 'VOLTAR (ESC)', {
            fontSize: '32px',
            fill: '#ffffff',
            backgroundColor: '#333355',
            padding: { left: 20, right: 20, top: 10, bottom: 10 }
        }).setOrigin(0.5).setInteractive();

        this.backButton.on('pointerdown', () => this.hideCredits());
    }

    hideCredits() {
        if (this.creditsContainer) {
            this.creditsContainer.destroy();
            this.creditsContainer = null;
        }
        if (this.creditsTexts) {
            this.creditsTexts.forEach(t => t.destroy());
            this.creditsTexts = null;
        }
        if (this.backButton) {
            this.backButton.destroy();
            this.backButton = null;
        }

        if (this.creditsBackground) {
        this.creditsBackground.destroy();
        this.creditsBackground = null;
        }

        this.isShowingCredits = false;
        this.createMainMenuButtons();

        if (!this.menuMusic.isPlaying) {
            this.menuMusic.play();
        }
    }

    update() {
        this.colorHue = (this.colorHue || 0) + 1;
        if (this.colorHue >= 360) this.colorHue = 0;

        const rgbColor = Phaser.Display.Color.HSVToRGB(this.colorHue / 360, 1, 1);
        const hexColor = Phaser.Display.Color.GetColor(rgbColor.r, rgbColor.g, rgbColor.b);
        this.lastFireText.setColor('#' + hexColor.toString(16).padStart(6, '0'));
    }
}
