import { Assets, Container, MeshRope, Point, Sprite } from "pixi.js";
import { Game, getRandom } from "./game";
import { HostileSpell } from "./hostileSpell";
import { EnemyBase } from "./enemyBase";
import { SlimeBall } from "./slimeball";
import { Vector } from "./types";

export class Slime extends EnemyBase {
    constructor(game: Game) {
        super(game);

        this.sprite = new Sprite({
            texture: Assets.get(getRandom(["slime1", "slime2", "slime3", "slime4", "slime5"])),
        });
        this.sprite.scale.set(0.5);
        this.sprite.anchor.set(0.5, 1);
        game.enemyContainer.addChild(this.sprite);
    }

    speed = 2;

    cooldown = 100;
    maxCooldown = 200;

    override death(): void {
        this.game.soundManager.sound("oozeDies", 0.5, this.position);
        let time = 0;
        this.game.player.unregisterTarget(this);
        const length = 50;
        const h = (dt: number) => {
            time += dt;
            const ratio = time / length;
            this.sprite.alpha = 1 - ratio;
            this.sprite.scale.y = 0.5 - ratio ** 0.5 * 0.25;
            if (time > length) {
                this.game.splash.happenings.delete(h);
                this.remove();
            }
        };

        this.game.splash.happenings.add(h);
    }

    update(dt: number) {
        if (this.health.length === 0) return;
        const player = this.game.player;

        const prefferedDistance = 100;
        const maxDistance = 900;

        const cycle = Math.sin(this.game.timeManager.timeElapsed * 0.1);

        let distance = this.position.distance(player.position);
        let ratio = this.cooldown / this.maxCooldown;
        if (ratio > 0.2) ratio = 1;
        this.sprite.alpha = 1 - ratio * 0.2;
        if (distance > maxDistance) {
            this.cooldown = this.maxCooldown;
        } else {
            this.game.soundManager.danger++;
            this.cooldown -= dt;

            let useSpeed = this.speed;
            if (this.cooldown < 100) {
                useSpeed = (this.cooldown / 100) * this.speed;
            }

            let strength = Math.min(Math.max(distance - prefferedDistance, -100), 100) / 100;

            const diff = this.position.diff(player.position);
            if (this.cooldown < 0) {
                this.cooldown = this.maxCooldown;
                this.game.soundManager.sound("oozeDies", 0.25, this.position);

                for (let index = 0; index < 3; index++) {
                    const spell = new SlimeBall(this.game);
                    spell.position.set(...this.position.result().add({ x: 0, y: -100 }).xy());
                    const projDiff = spell.position.diff(player.position);

                    let angle = projDiff.toAngle();
                    spell.velocity = Vector.fromAngle(angle + (index - 1) * 0.5).normalize(-3);
                }
            }

            const dir = diff.normalize(-strength * useSpeed);
            this.sprite.skew.x = -dir.x * 0.1 * Math.abs(cycle);
            this.sprite.scale.y = dir.length() * Math.abs(cycle) * 0.1 + 0.5;
            this.position.add(dir.mult(dt));

            for (const enemy of this.game.enemies) {
                if (enemy == this) continue;

                const diff = this.position.diff(enemy.position);
                if (diff.length() < 100) {
                    this.position.add(diff.normalize(1));
                }
            }
        }

        this.sprite.position.set(...this.position.xy());
    }
}
