import ASSETS from '../assets.js';

export default class EnemyFlying extends Phaser.Physics.Arcade.Sprite {
    health = 1;
    power = 1;

    fireCounterMin = 200;  // intervalo mínimo entre tiros
    fireCounterMax = 400;  // intervalo máximo entre tiros
    fireCounter = 0;

    paths = [
        [[200, -50], [1080, 160], [200, 300], [990, 120], [200, 100], [1020, 200]],
        [[-50, 200], [1330, 200], [1330, 100], [-50, 100], [-50, 200], [1330, 200]],
        [[-50, 360], [640, 50], [1180, 300], [640, 50], [50, 300], [640, 50], [1180, 300], [640, 300], [-50, 300]],
        [[1330, 360], [640, 50], [50, 360], [640, 350], [1180, 360], [640, 50], [50, 360], [640, 370], [1330, 360]],
    ];

    constructor(scene, shipId, pathId, speed = 0.002, power = 1) {
        const startingFrame = 12;
        super(scene, 0, 0, ASSETS.spritesheet.ships.key, startingFrame + shipId);

        this.scene = scene;
        this.power = power;
        this.pathSpeed = speed;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setFlipY(true);
        this.setDepth(10);

        this.fireCounter = Phaser.Math.Between(this.fireCounterMin, this.fireCounterMax);
        this.initPath(pathId);

        this.initPath(pathId, speed); // path setup
        this.pathDirection = 1; // 1 = indo; -1 = voltando
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        // Atualiza posição no path
        this.path.getPoint(this.pathIndex, this.pathVector);
        this.setPosition(this.pathVector.x, this.pathVector.y);

        // Incrementa ou decrementa pathIndex dependendo da direção
        this.pathIndex += this.pathSpeed * this.pathDirection;

        // Inverte a direção quando chega no fim ou início do path
        if (this.pathIndex >= 1) {
            this.pathIndex = 1;
            this.pathDirection = -1;
        } else if (this.pathIndex <= 0) {
            this.pathIndex = 0;
            this.pathDirection = 1;
        }

        // update firing interval (mantém o resto igual)
        if (this.fireCounter > 0) this.fireCounter--;
        else {
            this.fire();
        }
    }

    initPath(pathId) {
        const points = this.paths[pathId % this.paths.length]; // segurança para evitar índice inválido
        this.path = new Phaser.Curves.Spline(points);
        this.pathVector = new Phaser.Math.Vector2();
        this.pathIndex = 0;

        this.path.getPoint(0, this.pathVector);
        this.setPosition(this.pathVector.x, this.pathVector.y);
    }

    fire() {
        this.fireCounter = Phaser.Math.Between(this.fireCounterMin, this.fireCounterMax);
        this.scene.fireEnemyBullet(this.x, this.y, this.power);
    }

    hit(damage) {
        this.health -= damage;
        if (this.health <= 0) this.die();
    }

    die() {
        this.scene.addExplosion(this.x, this.y);
        this.remove();
    }

    getPower() {
        return this.power;
    }

    remove() {
        this.scene.removeEnemy(this);
    }
}
