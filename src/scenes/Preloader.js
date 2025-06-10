import ASSETS from '../assets.js';

// Cena Preloader: responsável por exibir a barra de progresso e carregar todos os assets do jogo
export class Preloader extends Phaser.Scene {
    constructor() {
        super('Preloader'); // Nome da cena
    }

    // Inicializa e desenha a barra de progresso visual
    init() {
        const centreX = this.scale.width * 0.5;
        const centreY = this.scale.height * 0.5;

        const barWidth = 468;
        const barHeight = 32;
        const barMargin = 4;

        // Adiciona o contorno da barra de progresso
        this.add.rectangle(centreX, centreY, barWidth, barHeight).setStrokeStyle(1, 0xffffff);

        // Adiciona a barra interna que será "preenchida" conforme o progresso do loading
        const bar = this.add.rectangle(
            centreX - (barWidth * 0.5) + barMargin,
            centreY,
            barMargin,
            barHeight - barMargin,
            0xffffff
        );

        // Evento do LoaderPlugin que atualiza o tamanho da barra conforme o progresso
        this.load.on('progress', (progress) => {
            // A barra vai aumentando de acordo com o progresso (de 0 a 1)
            bar.width = barMargin + ((barWidth - (barMargin * 2)) * progress);
        });
    }

    // Carrega os assets principais do jogo
    preload() {
        // Carrega o fundo do jogo para garantir que sempre aparece
        this.load.image('background', 'assets/background.png'); 

        // Percorre o objeto ASSETS (de assets.js) e carrega todos os assets declarados nele
        for (let type in ASSETS) {
            for (let key in ASSETS[type]) {
                let args = ASSETS[type][key].args.slice();
                args.unshift(ASSETS[type][key].key);
                this.load[type].apply(this.load, args); // Chama o método de loading correspondente (ex: this.load.image, this.load.audio, etc)
            }
        }
    }

    // Quando tudo está carregado, inicia a próxima cena
    create() {
        // Geralmente aqui você pode definir animações globais ou preparar recursos globais se precisar

        // Troca para a cena inicial do jogo (menu de início)
        this.scene.start('Start');

        // OBS: As linhas abaixo estão após o .start(), então normalmente não serão executadas, mas mostram exemplos de loading extra:
        this.load.video('gameover', 'assets/game_over.mp4');
        this.load.audio('shootSound', 'assets/shoot.wav');
        this.load.audio('hitSound', 'assets/hit.mp3');
        this.load.image('heart', 'assets/heart.png');
        this.load.audio('bgMusic', 'assets/music.mp3');
        this.load.image('backgroundPreBoss', 'assets/background_pre_boss.png');
        this.load.audio('preBossMusic', 'assets/preBossMusic.mp3'); 
        this.load.image('backgroundBoss', 'assets/background_boss.png');
        this.load.audio('bossMusic', 'assets/boss_music.mp3');
        this.load.audio('medkitSound', 'assets/medkit.mp3');
        // Essas linhas podem ser removidas daqui se todos os assets já forem carregados no for acima.
    }
}
