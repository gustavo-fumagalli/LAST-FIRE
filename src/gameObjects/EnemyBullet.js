// Importa os assets do jogo, como sprites e imagens
import ASSETS from '../assets.js';

// Classe que representa a bala disparada pelo inimigo
export default class EnemyBullet extends Phaser.Physics.Arcade.Sprite {
    power = 1;                  // Poder/dano base da bala
    moveVelocity = 400;         // Velocidade base da bala

    // Construtor: chamado ao criar uma nova bala
    constructor(scene, x, y, power = 1, frame = null) {
        // Se um frame específico não for passado, calcula o frame com base no poder
        const tileId = 11;
        const bulletFrame = frame !== null ? frame : (tileId + power);

        // Chama o construtor da classe Sprite do Phaser, informando posição e frame
        super(scene, x, y, ASSETS.spritesheet.tiles.key, bulletFrame);

        this.scene = scene;    // Guarda referência à cena (importante para acessar outros objetos/métodos)
        this.power = power;    // Guarda o poder/dano da bala

        // Adiciona a bala na cena e habilita a física nela
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Inicializa propriedades de física, tamanho, velocidade, etc
        this.initPhysics();
    }

    // Define o tamanho da hitbox, orientação do sprite e velocidade da bala
    initPhysics() {
        this.setSize(16, 24);                               // Define a hitbox (colisão) da bala
        this.setFlipY(true);                                // Vira o sprite para baixo
        this.setDepth(10);                                  // Define a profundidade de renderização (para ficar acima de outros objetos)
        this.setVelocityY(this.moveVelocity * (0.5 + this.power * 0.1)); // Define a velocidade vertical (mais poder = mais rápido)
    }

    // Atualização automática do Phaser (chamado a cada frame)
    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        // Se a bala sair da tela (parte inferior), chama die() para removê-la
        if (this.y > this.scene.scale.height + this.height) {
            this.die();
        }
    }

    // Retorna o poder da bala (útil para quando ela acerta o jogador)
    getPower() {
        return this.power;
    }

    // Remove a bala da cena (geralmente chamado quando sai da tela ou colide)
    die() {
        this.scene.removeEnemyBullet(this);
    }
}
