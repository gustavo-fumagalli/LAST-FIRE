// Importa os assets do jogo, como sprites e imagens
import ASSETS from '../assets.js';

// Classe para o inimigo voador (EnemyFlying)
export default class EnemyFlying extends Phaser.Physics.Arcade.Sprite {
    health = 1;                // Vida do inimigo
    power = 1;                 // Dano causado pelo inimigo
    fireCounterMin = 200;      // Tempo mínimo entre tiros
    fireCounterMax = 300;      // Tempo máximo entre tiros
    fireCounter = 0;           // Contador para atirar
    spiralAngle = 0;           // Ângulo usado para tiros em espiral

    // Caminhos (paths) pré-definidos que o inimigo pode seguir na tela
    paths = [
        [[200, -50], [1080, 160], [200, 300], [990, 120], [200, 100], [1020, 200]],
        [[-50, 200], [1330, 200], [1330, 100], [-50, 100], [-50, 200], [1330, 200]],
        [[-50, 360], [640, 50], [1180, 300], [640, 50], [50, 300], [640, 50], [1180, 300], [640, 300], [-50, 300]],
        [[1330, 360], [640, 50], [50, 360], [640, 350], [1180, 360], [640, 50], [50, 360], [640, 370], [1330, 360]],
    ];

    // Construtor da classe, inicializa o inimigo
    constructor(scene, shipId, pathId, speed = 0.002, power = 1, health = 1, isBoss = false) {
        const startingFrame = 12;
        // Chama o construtor da classe Sprite do Phaser
        super(scene, 0, 0, ASSETS.spritesheet.ships.key, startingFrame + shipId);
        const animKey = `enemyFlying-${shipId}`;

        // Cria a animação do inimigo se ainda não existir
        if (!scene.anims.exists(animKey)) {
            scene.anims.create({
                key: animKey,
                frames: [
                    { key: ASSETS.spritesheet.ships.key, frame: 12 + shipId },
                    { key: ASSETS.spritesheet.ships.key, frame: 12 + shipId + 1 }
                ],
                frameRate: 4,
                repeat: -1
            });
        }

        // Toca a animação
        this.play(animKey);

        this.scene = scene;        // Referência para a cena atual
        this.power = power;        // Define o poder/dano
        this.health = health;      // Define a vida
        this.pathSpeed = speed;    // Define a velocidade de movimento no path
        this.isBoss = isBoss;      // Define se é um boss
        this.bossBulletFrame = 15; // Frame da bala do boss (ajuste se precisar)

        scene.add.existing(this);      // Adiciona à cena
        scene.physics.add.existing(this); // Habilita física

        this.setFlipY(true);       // Inverte o sprite verticalmente
        this.setDepth(10);         // Define profundidade de renderização

        // Inicializa o contador de tiro com valor aleatório dentro do intervalo
        this.fireCounter = Phaser.Math.Between(this.fireCounterMin, this.fireCounterMax);
        // Inicializa o caminho do inimigo
        this.initPath(pathId);
        this.pathDirection = 1;    // Direção do movimento (1 = ida, -1 = volta)
    }

    // Atualização automática chamada a cada frame
    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        // Atualiza a posição do inimigo conforme o caminho (path)
        this.path.getPoint(this.pathIndex, this.pathVector);
        this.setPosition(this.pathVector.x, this.pathVector.y);

        // Movimento de vai-e-volta no caminho
        this.pathIndex += this.pathSpeed * this.pathDirection;
        if (this.pathIndex >= 1) {
            this.pathIndex = 1;
            this.pathDirection = -1;
        } else if (this.pathIndex <= 0) {
            this.pathIndex = 0;
            this.pathDirection = 1;
        }

        // Contador de disparo
        if (this.fireCounter > 0) this.fireCounter--;
        else {
            this.fire();
        }
    }

    // Inicializa o caminho do inimigo baseado no pathId
    initPath(pathId) {
        const points = this.paths[pathId % this.paths.length];
        this.path = new Phaser.Curves.Spline(points);
        this.pathVector = new Phaser.Math.Vector2();
        this.pathIndex = 0;
        this.path.getPoint(0, this.pathVector);
        this.setPosition(this.pathVector.x, this.pathVector.y);
    }

    // Função de disparo (normal ou boss)
    fire() {
        this.fireCounter = Phaser.Math.Between(this.fireCounterMin, this.fireCounterMax);

        if (this.isBoss) {
            // Se for boss, animação de ataque e ataque especial aleatório
            this.anims.play('boss_attack', true);

            const attackType = Phaser.Math.Between(0, 2);
            switch (attackType) {
                case 0: this.shootSpiral(); break;          // Disparo em espiral
                case 1: this.shootFrontalSpray(); break;     // Spray frontal
                case 2: this.shootDiagonal(); break;         // Disparo diagonal (cruzado)
            }
        } else {
            // Inimigos normais atiram uma bala só para baixo
            this.scene.fireEnemyBullet(this.x, this.y, this.power);
        }
    }

    // Disparo em espiral (para boss)
    shootSpiral() {
        const total = 12;       // Quantidade de balas no círculo
        const speed = 300;
        for (let i = 0; i < total; i++) {
            const angle = this.spiralAngle + (i * (2 * Math.PI / total));
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const bullet = new this.scene.EnemyBulletClass(this.scene, this.x, this.y, this.power, this.bossBulletFrame);
            bullet.body.velocity.x = vx;
            bullet.body.velocity.y = vy;
            this.scene.enemyBulletGroup.add(bullet);
        }
        this.spiralAngle += Math.PI / 10;  // Rotaciona o ângulo para o próximo disparo
    }

    // Disparo frontal espalhado (para boss)
    shootFrontalSpray() {
        if (this.isBoss) {
            this.anims.play('boss_attack', true);
        }

        const numBullets = 5;           // Número de balas no spray
        const spread = Math.PI / 8;     // Ângulo total de abertura
        const player = this.scene.player;
        // Calcula o ângulo base em direção ao jogador
        const baseAngle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);

        for (let i = 0; i < numBullets; i++) {
            // Espalha as balas ao redor do ângulo base
            const angle = baseAngle - spread/2 + (i * spread/(numBullets-1));
            const speed = 400;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const bullet = new this.scene.EnemyBulletClass(this.scene, this.x, this.y, this.power, this.bossBulletFrame);
            bullet.body.velocity.x = vx;
            bullet.body.velocity.y = vy;
            this.scene.enemyBulletGroup.add(bullet);
        }
    }

    // Disparo cruzado/diagonal (para boss)
    shootDiagonal() {
        if (this.isBoss) {
            this.anims.play('boss_attack', true);
        }

        const angles = [
            Math.PI/4,
            (3*Math.PI)/4,
            (5*Math.PI)/4,
            (7*Math.PI)/4
        ];
        const speed = 350;
        angles.forEach(angle => {
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const bullet = new this.scene.EnemyBulletClass(this.scene, this.x, this.y, this.power, this.bossBulletFrame);
            bullet.body.velocity.x = vx;
            bullet.body.velocity.y = vy;
            this.scene.enemyBulletGroup.add(bullet);
        });
    }

    // Função chamada quando o inimigo leva dano
    hit(damage) {
        this.health -= damage;
        if (this.health <= 0) this.die();
    }

    // Função chamada quando o inimigo morre
    die() {
        this.scene.addExplosion(this.x, this.y);  // Adiciona explosão na posição atual
        this.remove();                            // Remove o inimigo da cena
    }

    // Retorna o poder/dano do inimigo
    getPower() {
        return this.power;
    }

    // Remove o inimigo da cena (útil para gerenciamento de grupo)
    remove() {
        this.scene.removeEnemy(this);
    }
}
