import { Assets, Container, Sprite } from "pixi.js";
import { Game } from "./game";
import { Vector } from "./types";
import { EnemyBase } from "./enemyBase";

export class Ghost extends EnemyBase {
    constructor(game: Game) {
        super(game);
        this.position = new Vector(0, 0);
        this.sprite = new Sprite(Assets.get("marker"));
        this.sprite.tint = 0xffff00;
        this.sprite.anchor.set(0.5);
        game.enemyContainer.addChild(this.sprite);
    }

    speed = 5;

    cooldown = 100;
    maxCooldown = 40;

    update(dt: number) {
        const player = this.game.player;

        const prefferedDistance = 10;
        const maxDistance = 1000;

        let distance = this.position.distance(player.position);
        let ratio = this.cooldown / this.maxCooldown;
        if (ratio > 0.2) ratio = 1;
        this.sprite.alpha = 1 - ratio * 0.2;
        if (distance > maxDistance) {
            this.cooldown = this.maxCooldown;
        } else {
            this.game.soundManager.danger += 0.025;
            this.cooldown -= dt;

            let strength = Math.min(Math.max(distance - prefferedDistance, -10), 10) / 10;

            if (this.cooldown > 0) strength = -this.cooldown / this.maxCooldown;

            const diff = this.position.diff(player.position);
            if (this.cooldown < 0) {
                if (player.position.distanceSquared(this.position) < this.game.player.size.x ** 2) {
                    player.hit();
                    this.cooldown = this.maxCooldown;
                }
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
        super.update(dt);
    }
}
