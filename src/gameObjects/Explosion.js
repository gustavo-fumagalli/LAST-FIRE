// Importa os assets (sprites) do jogo
import ASSETS from '../assets.js';
// Importa as definições de animações, incluindo a animação de explosão
import ANIMATION from '../animation.js';

// Classe que representa a explosão no jogo
export default class Explosion extends Phaser.GameObjects.Sprite {

    // Construtor: chamado ao criar uma nova explosão
    constructor(scene, x, y) {
        // Chama o construtor da classe Sprite do Phaser, usando o frame 4 como imagem inicial
        super(scene, x, y, ASSETS.spritesheet.tiles.key, 4);

        // Adiciona a explosão na cena para ser renderizada
        scene.add.existing(this);

        // Define a profundidade para garantir que a explosão fique na frente de outros objetos
        this.setDepth(10);

        // Toca a animação de explosão, já definida em ANIMATION.explosion.key
        this.anims.play(ANIMATION.explosion.key);

        // Quando a animação da explosão termina, destrói esse objeto para limpar da memória
        this.on(
            Phaser.Animations.Events.ANIMATION_COMPLETE, // Evento de fim da animação
            function () {
                this.destroy();
            },
            this
        );
    }
}
