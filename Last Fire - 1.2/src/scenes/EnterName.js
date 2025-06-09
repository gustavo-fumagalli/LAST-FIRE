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

        // Texto de instrução centralizado
        this.add.text(centreX, centreY - 70, 'Digite seu nome', {
            fontFamily: 'Arial Black',
            fontSize: '32px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        // INPUT HTML centralizado sobre o canvas (sempre no centro da tela)
        this.nameInput = document.createElement('input');
        this.nameInput.type = 'text';
        this.nameInput.maxLength = 12;
        this.nameInput.style.position = 'fixed'; // Fixa na tela
        this.nameInput.style.top = '50%';
        this.nameInput.style.left = '50%';
        this.nameInput.style.transform = 'translate(-50%, -50%)';
        this.nameInput.style.width = '200px';
        this.nameInput.style.fontSize = '24px';
        this.nameInput.style.textAlign = 'center';
        this.nameInput.style.zIndex = 1000;
        this.nameInput.autofocus = true;

        document.body.appendChild(this.nameInput);
        this.nameInput.focus();

        // Botão "Confirmar" centralizado, logo abaixo do input
        this.confirmButton = this.add.text(centreX, centreY + 50, 'Confirmar', {
            fontFamily: 'Arial Black',
            fontSize: '28px',
            color: '#00ff00',
            stroke: '#000000',
            strokeThickness: 6,
            backgroundColor: '#000000'
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
        if (this.nameInput && this.nameInput.parentNode) {
            this.nameInput.remove();
        }

        // Voltar para o menu inicial
        this.scene.start('Start');
    }

    shutdown() {
        // Limpeza para garantir que o input seja removido em qualquer troca de cena
        if (this.nameInput && this.nameInput.parentNode) {
            this.nameInput.remove();
        }
    }
}