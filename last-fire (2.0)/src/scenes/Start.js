export class Start extends Phaser.Scene {
    constructor() {
        super('Start');
    }

    preload() {
        this.load.image('logo', 'assets/logo.png');
        this.load.audio('menuMusic', 'assets/menu_music.mp3');
        this.load.audio('menuMove', 'assets/menu_move.wav'); // som para mover seleção
    }

    create() {

        this.bg = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'background')
        .setDisplaySize(this.cameras.main.width, this.cameras.main.height)
        .setDepth(-100); // Atrás do logo/menu

        this.cameras.main.setBackgroundColor('#040218');

        // Música de fundo
        this.menuMusic = this.sound.add('menuMusic', { loop: true, volume: 0.5 });
        this.menuMusic.play();

        this.menuMoveSound = this.sound.add('menuMove');

        const bg = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'logo')
            .setOrigin(0.5).setScale(1.0).setDepth(-1);

        this.lastFireText = this.add.text(640, 180, 'LASTFIRE', {
            fontSize: '75px',
            fill: '#fff',
            fontFamily: 'Unispace'
        }).setOrigin(0.5);

        this.colorHue = 0;
        this.tweens.add({
            targets: this.lastFireText,
            scale: { from: 1, to: 1.2 },
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Criar os botões
        this.buttons = [];

        const playButton = this.add.text(640, 340, 'JOGAR', {
            fontSize: '48px',
            fill: '#fff',
            backgroundColor: '#212143',
            padding: { left: 32, right: 32, top: 16, bottom: 16 }
        }).setOrigin(0.5).setInteractive();

        playButton.on('pointerdown', () => this.selectOption(0));

        const exitButton = this.add.text(640, 420, 'SAIR', {
            fontSize: '36px',
            fill: '#ccc',
            backgroundColor: '#212143',
            padding: { left: 28, right: 28, top: 14, bottom: 14 }
        }).setOrigin(0.5).setInteractive();

        exitButton.on('pointerdown', () => this.selectOption(1));

        this.buttons.push(playButton, exitButton);
        this.selectedIndex = 0;
        this.updateButtonSelection();

        // Controles por teclado
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
            this.selectOption(this.selectedIndex);
        });
    }

    updateButtonSelection() {
        this.buttons.forEach((btn, index) => {
            if (index === this.selectedIndex) {
                btn.setStyle({ fill: '#ff0', fontSize: '52px' }); // destaque
            } else {
                btn.setStyle({ fill: '#ccc', fontSize: index === 0 ? '48px' : '36px' });
            }
        });
    }

    selectOption(index) {
        switch (index) {
            case 0: // Jogar
                this.menuMusic.stop();
                this.scene.start('Game');
                break;
            case 1: // Sair
                window.close(); // cuidado: alguns navegadores bloqueiam
                break;
        }
    }

    update() {
        this.colorHue += 1;
        if (this.colorHue >= 360) this.colorHue = 0;

        const rgbColor = Phaser.Display.Color.HSVToRGB(this.colorHue / 360, 1, 1);
        const hexColor = Phaser.Display.Color.GetColor(rgbColor.r, rgbColor.g, rgbColor.b);
        this.lastFireText.setColor('#' + hexColor.toString(16).padStart(6, '0'));
    }
}
