export default {
    // Exemplo comentado de como adicionar áudio:
    // 'audio': {
    //     score: {
    //         key: 'sound',
    //         args: ['assets/sound.mp3', 'assets/sound.m4a', 'assets/sound.ogg']
    //     },
    // },

    // Exemplo comentado de como adicionar imagens:
    // 'image': {
    //     spikes: {
    //         key: 'spikes',
    //         args: ['assets/spikes.png']
    //     },
    // },

    // Spritesheets são imagens divididas em vários frames (usadas para animação)
    'spritesheet': {
        // Spritesheet dos "ships" (naves, soldados, etc.)
        ships: {
            key: 'ships',                    // Chave de referência para usar no Phaser
            args: ['assets/ships.png', {     // Caminho da imagem
                frameWidth: 64,              // Largura de cada frame
                frameHeight: 64,             // Altura de cada frame
            }]
        },
        // Spritesheet dos "tiles" (itens, explosões, balas, kits médicos, etc.)
        tiles: {
            key: 'tiles',
            args: ['assets/tiles.png', {     // Caminho do arquivo tiles.png
                frameWidth: 32,              // Cada frame tem 32x32 pixels
                frameHeight: 32
            }]
        },

         bossDeath: {
        key: 'bossDeath',
        args: ['assets/BossDeath.png', {
            frameWidth: 64,  // 1033 / 6 ≈ 172px
            frameHeight: 64
        }]
        }
    },

    // Imagens simples (sem divisão em frames)
    'image': {
        background: {
            key: 'background',               // Chave de referência
            args: ['assets/background.png']  // Caminho do arquivo de fundo
        }
    }
};
