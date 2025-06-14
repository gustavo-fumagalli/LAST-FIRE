// Cena PauseMenu: menu de pausa do jogo com opções de continuar, volume, reiniciar e sair para menu.
export class PauseMenu extends Phaser.Scene {
    constructor() {
        super('PauseMenu');
        this.volume = 0.4;              // Volume inicial do som do pause
        this.volumeBarVisible = false;  // Indica se a barra de volume está visível
        this.volumeStep = 0.05;         // Passo ao aumentar/diminuir volume pelas setas
    }

    preload() {
        this.load.audio('pauseMusic', 'assets/pause_music.mp3');
        this.load.audio('menuMove', 'assets/menu_move.wav');
    }

    create() {
        // Fundo semi-transparente
        this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.6);

        this.menuMoveSound = this.sound.add('menuMove');

        // Título animado "PAUSADO"
        this.titleText = this.add.text(640, -100, 'PAUSADO', {
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
        }).setOrigin(0.5).setScale(0.2);

        // Animação do título descendo e aumentando de tamanho
        this.tweens.add({
            targets: this.titleText,
            y: 180,
            scale: 1.0,
            duration: 1500,
            ease: 'Bounce.easeOut',
        });

        // Música de pausa
        this.pauseMusic = this.sound.add('pauseMusic', {
            loop: true,
            volume: this.volume
        });
        this.pauseMusic.play();

        // Lista de botões do menu
        this.buttons = [];
        this.selectedIndex = 0;

        let startY = 300;
        let spacing = 70;

        // Cria botões interativos
        this.buttons.push(this.createPixelButton(640, startY, 'CONTINUAR', this.resumeGame.bind(this)));
        this.buttons.push(this.createPixelButton(640, startY + spacing, 'VOLUME', this.toggleVolume.bind(this)));
        this.buttons.push(this.createPixelButton(640, startY + spacing * 2, 'REINICIAR', this.restartGame.bind(this)));
        this.buttons.push(this.createPixelButton(640, startY + spacing * 3, 'MENU', this.returnToMenu.bind(this)));

        this.updateButtonSelection();

        // Controles de navegação dos botões pelo teclado
        this.input.keyboard.on('keydown-UP', () => {
            this.selectedIndex = (this.selectedIndex - 1 + this.buttons.length) % this.buttons.length;
            this.menuMoveSound.play();
            this.updateButtonSelection();
        });

        this.input.keyboard.on('keydown-DOWN', () => {
            this.selectedIndex = (this.selectedIndex + 1) % this.buttons.length;
            this.menuMoveSound.play();
            this.updateButtonSelection();
        });

        this.input.keyboard.on('keydown-ENTER', () => {
            const selectedBtn = this.buttons[this.selectedIndex];
            this.menuMoveSound.play();
            selectedBtn.emit('pointerdown');
        });

        this.input.keyboard.on('keydown-ESC', this.resumeGame.bind(this));

        // Controles de volume pelas setas esquerda/direita
        this.input.keyboard.on('keydown-LEFT', () => {
            if (this.volumeBarVisible) {
                this.setVolume(this.volume - this.volumeStep);
            }
        });

        this.input.keyboard.on('keydown-RIGHT', () => {
            if (this.volumeBarVisible) {
                this.setVolume(this.volume + this.volumeStep);
            }
        });
    }

    // Alterna visibilidade da barra de volume
    toggleVolume() {
        if (!this.volumeBarVisible) {
            this.createVolumeBar();
            this.volumeBarVisible = true;
        } else {
            this.setVolumeBarVisible(false);
            this.volumeBarVisible = false;
        }
    }

    // Retoma o jogo do ponto onde parou
    resumeGame() {
        this.pauseMusic.stop();
        this.destroyVolumeBar();
        this.scene.stop();
        this.scene.resume('Game');
    }

    // Reinicia o jogo do começo
    restartGame() {
        this.pauseMusic.stop();
        this.destroyVolumeBar();
        this.scene.stop('Game');
        this.scene.stop();
        this.scene.start('Game');
    }

    // Volta para o menu principal do jogo
    returnToMenu() {
        this.pauseMusic.stop();
        this.destroyVolumeBar();
        this.scene.stop('Game');
        this.scene.stop();
        this.scene.start('Start');
    }

    // Cria barra de volume interativa na tela
    createVolumeBar() {
        // Destroi barras antigas se existirem
        if (this.volumeBarBg) {
            this.volumeBarBg.destroy();
            this.volumeBarFill.destroy();
            this.volumeBarHandle.destroy();
            this.volumeBarText.destroy();
        }

        const barX = 640 - 150;
        const barY = 580;
        const barWidth = 300;
        const barHeight = 20;

        // Barra de fundo, preenchimento, "alça" e texto de porcentagem
        this.volumeBarBg = this.add.rectangle(barX, barY, barWidth, barHeight, 0x44445a).setOrigin(0, 0.5).setDepth(200);
        const fillWidth = barWidth * this.volume;
        this.volumeBarFill = this.add.rectangle(barX, barY, fillWidth, barHeight, 0x2ee670).setOrigin(0, 0.5).setDepth(201);
        this.volumeBarHandle = this.add.circle(barX + fillWidth, barY, 12, 0xffffff).setDepth(202).setInteractive();
        this.volumeBarText = this.add.text(barX + barWidth + 20, barY, Math.round(this.volume * 100) + '%', {
            fontSize: '20px',
            fill: '#fff'
        }).setOrigin(0, 0.5).setDepth(203);

        // Permite clicar na barra para definir volume
        this.volumeBarBg.setInteractive(new Phaser.Geom.Rectangle(0, -barHeight / 2, barWidth, barHeight), Phaser.Geom.Rectangle.Contains);
        this.volumeBarBg.on('pointerdown', (pointer) => {
            const relativeX = Phaser.Math.Clamp(pointer.x - barX, 0, barWidth);
            this.setVolume(relativeX / barWidth);
        });

        // Permite arrastar o círculo ("alça") para ajustar volume
        this.input.setDraggable(this.volumeBarHandle);
        this.volumeBarHandle.on('drag', (pointer, dragX) => {
            const relativeX = Phaser.Math.Clamp(dragX - barX, 0, barWidth);
            this.setVolume(relativeX / barWidth);
        });

        this.setVolumeBarVisible(true);
    }

    // Mostra/oculta a barra de volume
    setVolumeBarVisible(visible) {
        if (this.volumeBarBg) this.volumeBarBg.setVisible(visible);
        if (this.volumeBarFill) this.volumeBarFill.setVisible(visible);
        if (this.volumeBarHandle) this.volumeBarHandle.setVisible(visible);
        if (this.volumeBarText) this.volumeBarText.setVisible(visible);
    }

    // Destroi todos os elementos da barra de volume
    destroyVolumeBar() {
        if (this.volumeBarBg) this.volumeBarBg.destroy();
        if (this.volumeBarFill) this.volumeBarFill.destroy();
        if (this.volumeBarHandle) this.volumeBarHandle.destroy();
        if (this.volumeBarText) this.volumeBarText.destroy();
        this.volumeBarBg = null;
        this.volumeBarFill = null;
        this.volumeBarHandle = null;
        this.volumeBarText = null;
        this.volumeBarVisible = false;
    }

    // Define o volume (limita entre 0 e 1), atualiza barra e texto
    setVolume(volume) {
        this.volume = Phaser.Math.Clamp(volume, 0, 1);

        const barX = this.volumeBarBg.x;
        const barWidth = this.volumeBarBg.width;

        this.volumeBarFill.width = barWidth * this.volume;
        this.volumeBarHandle.x = barX + this.volumeBarFill.width;
        this.volumeBarText.setText(Math.round(this.volume * 100) + '%');

        this.sound.volume = this.volume; // Aplica volume globalmente para a cena
    }

    // Cria um botão de texto pixelizado/interativo
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

    // Destaca visualmente o botão selecionado no menu
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
}
