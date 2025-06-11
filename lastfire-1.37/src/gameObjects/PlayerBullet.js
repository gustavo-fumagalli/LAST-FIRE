// Importa os assets (sprites) do jogo
import ASSETS from '../assets.js';

// Classe que representa o projétil (bala) disparado pelo jogador
export default class PlayerBullet extends Phaser.Physics.Arcade.Sprite {
    power = 1;           // Poder/dano da bala
    moveVelocity = 800;  // Velocidade vertical da bala (vai para cima)

    // Construtor: chamado ao criar uma nova bala
    constructor(scene, x, y, power) {
        // Cria o sprite da bala usando a spritesheet e o frame baseado no power
        super(scene, x, y, ASSETS.spritesheet.tiles.key, power-1);

        // Adiciona a bala na cena e habilita a física
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setSize(12, 32);   // Ajusta a hitbox para melhor encaixar na imagem
        this.setDepth(10);      // Renderiza a bala acima de outros objetos
        this.scene = scene;     // Guarda referência à cena

        // Define a velocidade vertical negativa para mover a bala para cima
        this.setVelocityY(-this.moveVelocity);
    }

    // Atualização automática do Phaser a cada frame
    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        // Verifica se a bala saiu do topo da tela
        this.checkWorldBounds();
    }

    // Retorna o poder/dano da bala (útil em colisões)
    getPower() {
        return this.power;
    }

    // Checa se a bala está acima do topo da tela
    checkWorldBounds() {
        if (this.y < 0) {
            this.remove(); // Remove a bala da cena se saiu da tela
        }
    }

    // Remove a bala da cena chamando um método na cena principal
    remove() {
        this.scene.removeBullet(this);
    }
}
