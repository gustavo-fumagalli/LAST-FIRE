import ASSETS from './assets.js';

// Exporta um objeto contendo as configurações das animações do jogo
export default {
    // Animação de explosão
    'explosion': 
    {
        key: 'explosion',                          // Nome/chave da animação (usado no Phaser)
        texture: ASSETS.spritesheet.tiles.key,     // Qual spritesheet usar (referência ao arquivo em assets.js)
        frameRate: 6,                              // Velocidade da animação (frames por segundo)
        config: { start: 4, end: 8 },              // Quais frames usar dessa spritesheet (vai do frame 4 até o 8)
    },
};
