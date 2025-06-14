import { Boot } from './scenes/Boot.js';
import { Preloader } from './scenes/Preloader.js';
import { Start } from './scenes/Start.js';
import { Intro } from './scenes/Intro.js';
import { Game } from './scenes/Game.js';
import { GameOver } from './scenes/GameOver.js';
import { PauseMenu } from './scenes/PauseMenu.js'; 
import { CutsceneFinal } from './scenes/CutsceneFinal.js';
import { EnterName } from './scenes/EnterName.js';

// Configuração principal do Phaser.Game
const config = {
    type: Phaser.AUTO,          // Usa WebGL se disponível, senão Canvas
    title: 'Shmup',             // Título do jogo
    description: '',            // Descrição (opcional)
    parent: 'game-container',   // Elemento HTML onde o jogo será renderizado
    width: 1280,                // Largura da tela do jogo
    height: 720,                // Altura da tela do jogo
    backgroundColor: '#000000', // Cor de fundo (fallback)
    pixelArt: false,            // Se usar pixel art (true = pixels nítidos)
    physics: {
        default: 'arcade',      // Sistema de física padrão (Arcade)
        arcade: {
            debug: false,       // Mostra coliders na tela (true para debugar colisões)
            gravity: { y: 0 }   // Gravidade (0 = sem gravidade, top-down)
        }
    },
    // Lista de todas as cenas do jogo, na ordem em que podem ser chamadas
    scene: [
        Boot,
        Preloader,
        Start,
        Intro,
        Game,
        GameOver,
        PauseMenu,
        CutsceneFinal,
        EnterName
    ],
    scale: {
        mode: Phaser.Scale.FIT,             // Ajusta o canvas para caber na janela, mantendo proporção
        autoCenter: Phaser.Scale.CENTER_BOTH // Centraliza o canvas na tela
    },
}

// Inicializa o jogo, criando uma instância de Phaser.Game com a configuração acima
new Phaser.Game(config);
