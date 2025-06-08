export class PauseMenu extends Phaser.Scene {
    constructor() {
        super('PauseMenu');
        this.volume = 0.4;
        this.volumeBarVisible = false;
        this.volumeStep = 0.05;
         
    }

    preload() {
        this.load.audio('pauseMusic', 'assets/pause_music.mp3');
    }

    create() {
    this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.6);

    this.titleText = this.add.text(640, 200, 'PAUSADO', {
        fontSize: '64px',
        fill: '#ffff00',
        fontFamily: '"Press Start 2P", monospace',
        stroke: '#000000',
        strokeThickness: 6
    }).setOrigin(0.5);

    this.pauseMusic = this.sound.add('pauseMusic', {
        loop: true,
        volume: this.volume
    });
    this.pauseMusic.play();

    this.buttons = [];
    this.selectedIndex = 0;

    let startY = 300;
    let spacing = 70;

    this.buttons.push(this.createPixelButton(640, startY, 'CONTINUAR', this.resumeGame.bind(this)));
    this.buttons.push(this.createPixelButton(640, startY + spacing, 'VOLUME', this.toggleVolume.bind(this)));
    this.buttons.push(this.createPixelButton(640, startY + spacing * 2, 'REINICIAR', this.restartGame.bind(this)));
    this.buttons.push(this.createPixelButton(640, startY + spacing * 3, 'MENU', this.returnToMenu.bind(this)));

    this.updateButtonSelection();

    this.input.keyboard.on('keydown-UP', () => {
        this.selectedIndex = (this.selectedIndex - 1 + this.buttons.length) % this.buttons.length;
        this.updateButtonSelection();
    });

    this.input.keyboard.on('keydown-DOWN', () => {
        this.selectedIndex = (this.selectedIndex + 1) % this.buttons.length;
        this.updateButtonSelection();
    });

    this.input.keyboard.on('keydown-ENTER', () => {
        const selectedBtn = this.buttons[this.selectedIndex];
        selectedBtn.emit('pointerdown');
    });

    this.input.keyboard.on('keydown-ESC', this.resumeGame.bind(this));
    
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

    
    toggleVolume() {
        if (!this.volumeBarVisible) {
            this.createVolumeBar();
            this.volumeBarVisible = true;
        } else {
            this.setVolumeBarVisible(false);
            this.volumeBarVisible = false;
        }
    }

    resumeGame() {
    this.pauseMusic.stop();
    this.destroyVolumeBar();
    this.scene.stop();
    this.scene.resume('Game');
    }

    restartGame() {
        this.pauseMusic.stop();
        this.destroyVolumeBar();
        this.scene.stop('Game');
        this.scene.stop();
        this.scene.start('Game');
    }

    returnToMenu() {
        this.pauseMusic.stop();
        this.destroyVolumeBar();
        this.scene.stop('Game');
        this.scene.stop();
        this.scene.start('Start');
    }

    createVolumeBar() {
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

        this.volumeBarBg = this.add.rectangle(barX, barY, barWidth, barHeight, 0x44445a).setOrigin(0, 0.5).setDepth(200);
        const fillWidth = barWidth * this.volume;
        this.volumeBarFill = this.add.rectangle(barX, barY, fillWidth, barHeight, 0x2ee670).setOrigin(0, 0.5).setDepth(201);
        this.volumeBarHandle = this.add.circle(barX + fillWidth, barY, 12, 0xffffff).setDepth(202).setInteractive();
        this.volumeBarText = this.add.text(barX + barWidth + 20, barY, Math.round(this.volume * 100) + '%', {
            fontSize: '20px',
            fill: '#fff'
        }).setOrigin(0, 0.5).setDepth(203);

        this.volumeBarBg.setInteractive(new Phaser.Geom.Rectangle(0, -barHeight / 2, barWidth, barHeight), Phaser.Geom.Rectangle.Contains);

        this.volumeBarBg.on('pointerdown', (pointer) => {
            const relativeX = Phaser.Math.Clamp(pointer.x - barX, 0, barWidth);
            this.setVolume(relativeX / barWidth);
        });

        this.input.setDraggable(this.volumeBarHandle);
        this.volumeBarHandle.on('drag', (pointer, dragX) => {
            const relativeX = Phaser.Math.Clamp(dragX - barX, 0, barWidth);
            this.setVolume(relativeX / barWidth);
        });

        this.setVolumeBarVisible(true);
    }

    setVolumeBarVisible(visible) {
        if (this.volumeBarBg) this.volumeBarBg.setVisible(visible);
        if (this.volumeBarFill) this.volumeBarFill.setVisible(visible);
        if (this.volumeBarHandle) this.volumeBarHandle.setVisible(visible);
        if (this.volumeBarText) this.volumeBarText.setVisible(visible);
    }

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

    setVolume(volume) {
        this.volume = Phaser.Math.Clamp(volume, 0, 1);

        const barX = this.volumeBarBg.x;
        const barWidth = this.volumeBarBg.width;

        this.volumeBarFill.width = barWidth * this.volume;
        this.volumeBarHandle.x = barX + this.volumeBarFill.width;
        this.volumeBarText.setText(Math.round(this.volume * 100) + '%');

        if (this.pauseMusic) this.pauseMusic.setVolume(this.volume);
        // Para afetar globalmente:
        // this.sound.volume = this.volume;
    }

    createPixelButton(x, y, label, callback) {
    const btn = this.add.text(x, y, label, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '28px',
        fill: '#00ff00',
        backgroundColor: '#000000',
        padding: { left: 20, right: 20, top: 10, bottom: 10 },
        stroke: '#00ff00',
        strokeThickness: 2,
        align: 'center'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => {
        const index = this.buttons.indexOf(btn);
        if (index !== -1) {
            this.selectedIndex = index;
            this.updateButtonSelection();
        }
    });

    btn.on('pointerout', () => {
        this.updateButtonSelection();
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



}
