export class EnterName extends Phaser.Scene {
    constructor() {
        super('EnterName');
    }

    init(data) {
        this.score = data.score || 0;
    }

    create() {
        const centreX = this.scale.width / 2;
        const centreY = this.scale.height / 2;

        this.add.text(centreX, centreY - 100, 'Digite seu nome', {
            fontFamily: 'Arial Black', fontSize: 32, color: '#ffffff',
            stroke: '#000000', strokeThickness: 6
        }).setOrigin(0.5);

        // Criar um input HTML sobre o canvas Phaser
        this.nameInput = document.createElement('input');
        this.nameInput.type = 'text';
        this.nameInput.maxLength = 12;
        this.nameInput.style.position = 'absolute';
        this.nameInput.style.top = `${centreY}px`;
        this.nameInput.style.left = `${centreX - 100}px`;
        this.nameInput.style.width = '200px';
        this.nameInput.style.fontSize = '24px';
        this.nameInput.style.textAlign = 'center';
        this.nameInput.style.zIndex = 1000;

        document.body.appendChild(this.nameInput);
        this.nameInput.focus();

        // Botão de confirmar
        this.confirmButton = this.add.text(centreX, centreY + 50, 'Confirmar', {
            fontFamily: 'Arial Black', fontSize: 28, color: '#00ff00',
            stroke: '#000000', strokeThickness: 6, backgroundColor: '#000000'
        }).setOrigin(0.5).setInteractive();

        this.confirmButton.on('pointerdown', () => {
            this.saveScoreAndReturn();
        });

        // Ou confirmar com Enter
        this.nameInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                this.saveScoreAndReturn();
            }
        });
    }

    saveScoreAndReturn() {
        const name = this.nameInput.value.trim() || 'Player';

        // Salvar score no localStorage
        let highScores = JSON.parse(localStorage.getItem('highScores')) || [];
        highScores.push({ name, score: this.score });
        highScores.sort((a, b) => b.score - a.score);
        highScores = highScores.slice(0, 5);
        localStorage.setItem('highScores', JSON.stringify(highScores));

        // Remover input do DOM
        this.nameInput.remove();

        // Voltar para o menu inicial
        this.scene.start('Start');
    }

    shutdown() {
        // Limpeza no caso de mudança abrupta de cena
        if (this.nameInput && this.nameInput.parentNode) {
            this.nameInput.remove();
        }
    }
}
