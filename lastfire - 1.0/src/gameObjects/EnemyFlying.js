import ASSETS from '../assets.js';

export default class EnemyFlying extends Phaser.Physics.Arcade.Sprite {
    health = 1;
    power = 1;
    fireCounterMin = 200;
    fireCounterMax = 300;
    fireCounter = 0;
    spiralAngle = 0;

    paths = [
        [[200, -50], [1080, 160], [200, 300], [990, 120], [200, 100], [1020, 200]],
        [[-50, 200], [1330, 200], [1330, 100], [-50, 100], [-50, 200], [1330, 200]],
        [[-50, 360], [640, 50], [1180, 300], [640, 50], [50, 300], [640, 50], [1180, 300], [640, 300], [-50, 300]],
        [[1330, 360], [640, 50], [50, 360], [640, 350], [1180, 360], [640, 50], [50, 360], [640, 370], [1330, 360]],
    ];

    constructor(scene, shipId, pathId, speed = 0.002, power = 1, health = 1, isBoss = false) {
        const startingFrame = 12;
        super(scene, 0, 0, ASSETS.spritesheet.ships.key, startingFrame + shipId);

        this.scene = scene;
        this.power = power;
        this.health = health;
        this.pathSpeed = speed;
        this.isBoss = isBoss;
        this.bossBulletFrame = 15; // Troque pelo frame certo do sprite do boss!

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setFlipY(true);
        this.setDepth(10);

        this.fireCounter = Phaser.Math.Between(this.fireCounterMin, this.fireCounterMax);
        this.initPath(pathId);
        this.pathDirection = 1;
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        // Atualiza posição no path
        this.path.getPoint(this.pathIndex, this.pathVector);
        this.setPosition(this.pathVector.x, this.pathVector.y);

        // Movimento de vai-e-volta
        this.pathIndex += this.pathSpeed * this.pathDirection;
        if (this.pathIndex >= 1) {
            this.pathIndex = 1;
            this.pathDirection = -1;
        } else if (this.pathIndex <= 0) {
            this.pathIndex = 0;
            this.pathDirection = 1;
        }

        if (this.fireCounter > 0) this.fireCounter--;
        else {
            this.fire();
        }
    }

    initPath(pathId) {
        const points = this.paths[pathId % this.paths.length];
        this.path = new Phaser.Curves.Spline(points);
        this.pathVector = new Phaser.Math.Vector2();
        this.pathIndex = 0;
        this.path.getPoint(0, this.pathVector);
        this.setPosition(this.pathVector.x, this.pathVector.y);
    }

    fire() {
        this.fireCounter = Phaser.Math.Between(this.fireCounterMin, this.fireCounterMax);

        if (this.isBoss) {
            // Ataque aleatório do boss
            const attackType = Phaser.Math.Between(0, 2);
            switch (attackType) {
                case 0: this.shootSpiral(); break;
                case 1: this.shootFrontalSpray(); break;
                case 2: this.shootDiagonal(); break;
            }
        } else {
            // Inimigos normais
            this.scene.fireEnemyBullet(this.x, this.y, this.power);
        }
    }

    // Disparo em espiral (boss)
    shootSpiral() {
        const total = 12;
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
        this.spiralAngle += Math.PI / 10;
    }

    // Spray frontal (boss)
    shootFrontalSpray() {
        const numBullets = 5;
        const spread = Math.PI / 8;
        const player = this.scene.player;
        const baseAngle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);

        for (let i = 0; i < numBullets; i++) {
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

    // Cruz/diagonais (boss)
    shootDiagonal() {
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