export class PauseMenu extends Phaser.Scene {
    constructor() {
        super('PauseMenu');
        this.volume = 0.4; // Valor padrão do volume
        this.volumeBarVisible = false;
    }

    preload() {
        this.load.audio('pauseMusic', 'assets/pause_music.mp3');
    }

    create() {
    // Fundo semitransparente
    this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.6);

    this.add.text(640, 260, 'PAUSADO', {
        fontSize: '64px',
        fill: '#fff'
    }).setOrigin(0.5);

    this.pauseMusic = this.sound.add('pauseMusic', {
        loop: true,
        volume: this.volume
    });
    this.pauseMusic.play();

    // CONTINUAR
    const resumeBtn = this.add.text(640, 350, 'CONTINUAR', {
        fontSize: '38px',
        fill: '#fff',
        backgroundColor: '#1d1d2e',
        padding: { left: 28, right: 28, top: 12, bottom: 12 },
    }).setOrigin(0.5).setInteractive();

    resumeBtn.on('pointerdown', () => {
        this.pauseMusic.stop();
        this.scene.stop();
        this.scene.resume('Game');
    });

    // VOLUME
    const volumeBtn = this.add.text(640, 410, 'VOLUME', {
        fontSize: '32px',
        fill: '#fff',
        backgroundColor: '#2d2d45',
        padding: { left: 18, right: 18, top: 8, bottom: 8 },
    }).setOrigin(0.5).setInteractive();

    volumeBtn.on('pointerdown', () => {
        if (!this.volumeBarVisible) {
            this.createVolumeBar();
            this.volumeBarVisible = true;
        } else {
            this.setVolumeBarVisible(false);
            this.volumeBarVisible = false;
        }
    });

    // REINICIAR
    const restartBtn = this.add.text(640, 470, 'REINICIAR', {
        fontSize: '32px',
        fill: '#fff',
        backgroundColor: '#1d1d2e',
        padding: { left: 20, right: 20, top: 8, bottom: 8 },
    }).setOrigin(0.5).setInteractive();

    restartBtn.on('pointerdown', () => {
        this.pauseMusic.stop();
        this.scene.stop('Game');
        this.scene.stop();
        this.scene.start('Game');
    });

    // MENU
    const menuBtn = this.add.text(640, 530, 'MENU', {
        fontSize: '32px',
        fill: '#fff',
        backgroundColor: '#1d1d2e',
        padding: { left: 20, right: 20, top: 8, bottom: 8 },
    }).setOrigin(0.5).setInteractive();

    menuBtn.on('pointerdown', () => {
        this.pauseMusic.stop();
        this.scene.stop('Game');
        this.scene.stop();
        this.scene.start('Start');
    });

    // ESC fecha menu de pausa
    this.input.keyboard.on('keydown-ESC', () => {
        this.pauseMusic.stop();
        this.scene.stop();
        this.scene.resume('Game');
    });
}

    createVolumeBar() {
    // Remove se já existir para evitar duplicatas
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

    // Fundo da barra
    this.volumeBarBg = this.add.rectangle(barX, barY, barWidth, barHeight, 0x44445a).setOrigin(0, 0.5).setDepth(200);

    // Preenchimento da barra
    const fillWidth = barWidth * this.volume;
    this.volumeBarFill = this.add.rectangle(barX, barY, fillWidth, barHeight, 0x2ee670).setOrigin(0, 0.5).setDepth(201);

    // Alça deslizante
    this.volumeBarHandle = this.add.circle(barX + fillWidth, barY, 12, 0xffffff).setDepth(202).setInteractive();

    // Texto do volume
    this.volumeBarText = this.add.text(barX + barWidth + 20, barY, Math.round(this.volume * 100) + '%', {
        fontSize: '20px',
        fill: '#fff'
    }).setOrigin(0, 0.5).setDepth(203);

    // Input
    this.volumeBarBg.setInteractive(new Phaser.Geom.Rectangle(0, -barHeight/2, barWidth, barHeight), Phaser.Geom.Rectangle.Contains);

    // Clique na barra
    this.volumeBarBg.on('pointerdown', (pointer) => {
        const relativeX = Phaser.Math.Clamp(pointer.x - barX, 0, barWidth);
        this.setVolume(relativeX / barWidth);
    });

    // Arrastar a alça
    this.input.setDraggable(this.volumeBarHandle);
    this.volumeBarHandle.on('drag', (pointer, dragX, dragY) => {
        const relativeX = Phaser.Math.Clamp(dragX - barX, 0, barWidth);
        this.setVolume(relativeX / barWidth);
    });

    // Atualiza barra visualmente
    this.setVolumeBarVisible(true);
}

setVolumeBarVisible(visible) {
    if (this.volumeBarBg) {
        this.volumeBarBg.setVisible(visible);
        this.volumeBarFill.setVisible(visible);
        this.volumeBarHandle.setVisible(visible);
        this.volumeBarText.setVisible(visible);
    }
}

setVolume(volume) {
    // Garante limites 0-1
    this.volume = Phaser.Math.Clamp(volume, 0, 1);
    // Atualiza visual
    const barX = this.volumeBarBg.x;
    const barWidth = this.volumeBarBg.width;

    this.volumeBarFill.width = barWidth * this.volume;
    this.volumeBarHandle.x = barX + this.volumeBarFill.width;
    this.volumeBarText.setText(Math.round(this.volume * 100) + '%');

    // Atualiza volume do som de pausa (ou global)
    if (this.pauseMusic) this.pauseMusic.setVolume(this.volume);

    // Se quiser afetar todos os sons:
    // this.sound.volume = this.volume;
}

    setVolumeBarVisible(visible) {
        if (this.volumeLabel) this.volumeLabel.setVisible(visible);
        if (this.volumeBarBg) this.volumeBarBg.setVisible(visible);
        if (this.volumeBarFill) this.volumeBarFill.setVisible(visible);
        if (this.volumeHandle) this.volumeHandle.setVisible(visible);
        if (this.volumeText) this.volumeText.setVisible(visible);
    }

    updateVolumeBar() {
        const barX = 640;
        const barWidth = 400;
        this.volumeBarFill.width = this.volume * barWidth;
        this.volumeBarFill.x = barX - barWidth / 2;
        this.volumeHandle.x = barX - barWidth / 2 + this.volume * barWidth;
        this.volumeText.setText(`${Math.round(this.volume * 100)}%`);
        if (this.pauseMusic) this.pauseMusic.setVolume(this.volume);
    }
}
