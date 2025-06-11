// Cena para o jogador digitar o nome e salvar o score no ranking
export class EnterName extends Phaser.Scene {
    constructor() {
        super('EnterName'); // Nome da cena
    }

    // Recebe os dados passados de outra cena (ex: score final)
    init(data) {
        this.score = data.score || 0; // Score atual do jogador
    }

    // Cria elementos visuais e input de nome
    create() {
        const centreX = this.scale.width / 2;
        const centreY = this.scale.height / 2;

        // Texto "Digite seu nome" centralizado
        this.add.text(centreX, centreY - 70, 'Digite seu nome', {
            fontFamily: 'Arial Black',
            fontSize: '32px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        // Cria input HTML para digitar o nome, centralizado na tela
        this.nameInput = document.createElement('input');
        this.nameInput.type = 'text';
        this.nameInput.maxLength = 12;
        this.nameInput.style.position = 'fixed'; // Sempre fixo na tela
        this.nameInput.style.top = '50%';
        this.nameInput.style.left = '50%';
        this.nameInput.style.transform = 'translate(-50%, -50%)';
        this.nameInput.style.width = '200px';
        this.nameInput.style.fontSize = '24px';
        this.nameInput.style.textAlign = 'center';
        this.nameInput.style.zIndex = 1000;
        this.nameInput.autofocus = true;

        // Adiciona o input ao corpo do HTML e foca nele
        document.body.appendChild(this.nameInput);
        this.nameInput.focus();

        // Botão "Confirmar", centralizado abaixo do input
        this.confirmButton = this.add.text(centreX, centreY + 50, 'Confirmar', {
            fontFamily: 'Arial Black',
            fontSize: '28px',
            color: '#00ff00',
            stroke: '#000000',
            strokeThickness: 6,
            backgroundColor: '#000000'
        }).setOrigin(0.5).setInteractive();

        // Ao clicar no botão "Confirmar", salva o score e volta para o menu
        this.confirmButton.on('pointerdown', () => {
            this.saveScoreAndReturn();
        });

        // Ou confirma pressionando ENTER no input de texto
        this.nameInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                this.saveScoreAndReturn();
            }
        });
    }

    // Salva o nome e score no localStorage e retorna ao menu
    saveScoreAndReturn() {
        const name = this.nameInput.value.trim() || 'Player'; // Garante um nome padrão

        // Recupera os scores salvos, adiciona o novo e mantém apenas os 5 melhores
        let highScores = JSON.parse(localStorage.getItem('highScores')) || [];
        highScores.push({ name, score: this.score });
        highScores.sort((a, b) => b.score - a.score);
        highScores = highScores.slice(0, 5); // Top 5 apenas
        localStorage.setItem('highScores', JSON.stringify(highScores));

        // Remove o input de nome do DOM
        if (this.nameInput && this.nameInput.parentNode) {
            this.nameInput.remove();
        }

        // Volta para a tela de início/menu principal
        this.scene.start('Start');
    }

    // Garante limpeza do input HTML ao sair da cena
    shutdown() {
        if (this.nameInput && this.nameInput.parentNode) {
            this.nameInput.remove();
        }
    }
}
