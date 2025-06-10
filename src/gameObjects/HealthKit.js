// Importa os assets (sprites) do jogo
import ASSETS from '../assets.js';

// Classe que representa o kit médico coletável
export default class HealthKit extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        // Cria o sprite do kit médico usando o frame 24 da spritesheet
        super(scene, x, y, ASSETS.spritesheet.tiles.key, 24); // frame 24 = kit médico

        // Adiciona o kit à cena e habilita a física nele
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(1.2);        // Aumenta um pouco o tamanho visual do kit
        this.setDepth(5);          // Define a profundidade (renderiza acima de outros objetos)
        this.setImmovable(true);   // Kit não se move ao colidir com outros objetos

        // Timer: faz o kit sumir sozinho após 10 segundos
        this.vanishTimer = scene.time.delayedCall(10000, () => {
            this.destroy();
        });

        // Timer: faz o kit começar a piscar quando faltar 3 segundos para sumir (ou seja, após 7 segundos)
        this.blinkTimer = scene.time.delayedCall(7000, () => {
            // Tween para piscar (alterna alpha entre 0 e 1 a cada 300ms)
            this.blinkTween = scene.tweens.add({
                targets: this,
                alpha: 0,
                ease: 'Linear',
                duration: 300, // Pisca a cada 300ms
                yoyo: true,
                repeat: -1
            });
        });
    }

    // Função chamada ao coletar o kit médico
    collect(player) {
        // Só recupera vida se o jogador não estiver com a vida cheia (max = 10)
        if (player.health < 10) {
            player.health++; // Recupera 1 ponto de vida

            // Atualiza a exibição da vida, se a função existir
            if (this.scene.updateHealthDisplay) {
                this.scene.updateHealthDisplay(player.health);
            }

            // Subtrai 75 pontos do score ao pegar o kit (punição ou balanceamento)
            if (this.scene.updateScore) {
                this.scene.updateScore(-75);
            }

            // Toca o som do kit médico, se existir
            if (this.scene.medkitSound) {
                this.scene.medkitSound.play();
            }
        }

        // Remove timers e tweens para evitar erros de referência
        if (this.vanishTimer) this.vanishTimer.remove();
        if (this.blinkTimer) this.blinkTimer.remove();
        if (this.blinkTween) this.blinkTween.stop();
        this.destroy(); // Remove o kit médico da cena
    }   

    // Garante que nada fica piscando ou agendado depois que o kit for destruído de outra forma
    preDestroy() {
        if (this.blinkTween) this.blinkTween.stop();
        if (this.blinkTimer) this.blinkTimer.remove();
        if (this.vanishTimer) this.vanishTimer.remove();
    }
}
