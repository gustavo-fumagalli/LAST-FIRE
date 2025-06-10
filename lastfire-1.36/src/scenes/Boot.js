// Cena Boot: usada normalmente para inicializar o jogo rapidamente e preparar o carregamento dos assets principais.
export class Boot extends Phaser.Scene
{
    // Construtor: define o nome da cena como 'Boot'
    constructor ()
    {
        super('Boot');
    }

    // Função preload: onde você pode carregar assets essenciais para o Preloader (como logo ou plano de fundo leve)
    preload ()
    {
        // A Boot Scene geralmente carrega apenas o mínimo necessário para o preloader,
        // pois ela não mostra barra de progresso nem nada visual para o jogador.
        // Exemplo de carregamento (comando comentado):
        // this.load.image('background', 'assets/background.png');
    }

    // Função create: chamada após o preload, inicia a próxima cena (Preloader)
    create ()
    {
        this.scene.start('Preloader'); // Vai para a cena Preloader, onde os assets principais do jogo serão carregados
    }
}
