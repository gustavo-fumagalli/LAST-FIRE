// Importa os assets (sprites) do jogo
import ASSETS from '../assets.js';

// Classe que representa o jogador controlável
export default class Player extends Phaser.Physics.Arcade.Sprite {
    velocityIncrement = 50;   // Quanto a velocidade aumenta por input
    velocityMax = 300;        // Velocidade máxima do jogador
    drag = 1000;              // Fator de arrasto para desacelerar
    fireRate = 10;            // Intervalo de frames entre tiros
    fireCounter = 0;          // Contador para controlar a cadência de tiro
    health = 3;               // Vida inicial do jogador

    // Construtor: chamado ao criar o jogador
    constructor(scene, x, y, shipId) {
        // Cria o sprite do jogador usando a sprite sheet e o frame indicado por shipId
        super(scene, x, y, ASSETS.spritesheet.ships.key, shipId);

        // Adiciona o jogador na cena e habilita física
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true); // Impede que o jogador saia da tela
        this.setDepth(100);               // Renderiza o jogador acima dos outros objetos
        this.scene = scene;               // Guarda referência à cena

        this.setMaxVelocity(this.velocityMax); // Limita velocidade máxima
        this.setDrag(this.drag);              // Aplica arrasto (desaceleração)
    }

    // Atualização automática do Phaser a cada frame
    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        // Diminui o contador do tiro (cadência)
        if (this.fireCounter > 0) this.fireCounter--;

        // Checa e processa input do jogador (teclas)
        this.checkInput();
    }

    // Função para verificar as teclas pressionadas e mover o jogador
    checkInput() {
        const cursors = this.scene.cursors;
        const leftKey = cursors.left.isDown;
        const rightKey = cursors.right.isDown;
        const upKey = cursors.up.isDown;
        const downKey = cursors.down.isDown;
        const spaceKey = cursors.space.isDown;

        const moveDirection = { x: 0, y: 0 };

        // Define a direção com base nas teclas pressionadas
        if (leftKey) moveDirection.x--;
        if (rightKey) moveDirection.x++;
        if (upKey) moveDirection.y--;
        if (downKey) moveDirection.y++;
        if (spaceKey) this.fire(); // Dispara se apertar espaço

        // Movimenta o jogador alterando a velocidade
        this.body.velocity.x += moveDirection.x * this.velocityIncrement;
        this.body.velocity.y += moveDirection.y * this.velocityIncrement;

        // --- Animação de andar ---
        if (leftKey || rightKey || upKey || downKey) {
            // Se estiver andando, toca a animação de andar
            if (!this.anims.isPlaying || this.anims.getName() !== 'walk') {
                this.anims.play('walk');
            }
        } else {
            // Parado: mostra frame do soldado parado
            this.anims.stop();
            this.setFrame(8); // Altere para o frame do sprite "parado"
        }
    }

    // Função de tiro
    fire() {
        // Só dispara se o contador permitir (controle de cadência)
        if (this.fireCounter > 0) return;

        this.fireCounter = this.fireRate; // Reinicia o contador

        // Cria a bala na posição atual do jogador
        this.scene.fireBullet(this.x, this.y);
    }

    // Função chamada ao levar dano
    hit(damage) {
        this.health -= damage;

        // Atualiza a exibição de vida na HUD, se existir a função na cena
        if (this.scene && this.scene.updateHealthDisplay) {
            this.scene.updateHealthDisplay(this.health);
        }

        // Se a vida chegar a zero, morre
        if (this.health <= 0) this.die();
    }

    // Função chamada ao morrer
    die() {
        // Adiciona animação de explosão na posição atual
        this.scene.addExplosion(this.x, this.y);
        this.destroy(); // Remove o sprite do jogador da cena
    }
}
