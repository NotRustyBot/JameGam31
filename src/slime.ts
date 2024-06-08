import { Assets, Container, Sprite } from "pixi.js";
import { Game } from "./game";
import { HostileSpell } from "./hostileSpell";
import { EnemyBase } from "./enemyBase";

export class Slime extends EnemyBase {
    constructor(game: Game) {
        super(game);
        this.sprite = new Sprite(Assets.get("marker"));
        this.sprite.tint = 0x55ff55;
        this.sprite.anchor.set(0.5);
        game.enemyContainer.addChild(this.sprite);
    }


    speed = 2;

    cooldown = 100;
    maxCooldown = 20;

    update(dt: number) {
        const player = this.game.player;

        const prefferedDistance = 420;
        const maxDistance = 600;

        let distance = this.position.distance(player.position);
        let ratio = this.cooldown / this.maxCooldown;
        if (ratio > 0.2) ratio = 1;
        this.sprite.alpha = 1 - ratio * 0.2;
        if (distance > maxDistance) {
            this.cooldown = this.maxCooldown;
        } else {
            this.game.soundManager.danger++;
            this.cooldown -= dt;

            let strength = Math.min(Math.max(distance - prefferedDistance, -100), 100) / 100;

            const diff = this.position.diff(player.position);
            if (this.cooldown < 0) {
                this.cooldown = this.maxCooldown;
                const spell = new HostileSpell(this.game);
                spell.position.set(...this.position.xy());
                spell.velocity = diff.result().normalize(-10);
            }
            this.position.add(diff.normalize(-strength * this.speed * dt));

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
