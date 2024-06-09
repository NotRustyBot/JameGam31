import { AnimatedSprite, Assets, Container, Sprite, Texture } from "pixi.js";
import { Game } from "./game";
import { Vector } from "./types";
import { EnemyBase } from "./enemyBase";

export class Ghost extends EnemyBase {
    constructor(game: Game) {
        super(game);
        this.position = new Vector(0, 0);
        const sprite = new AnimatedSprite([
            Assets.get("ghost1") as Texture,
            Assets.get("ghost2") as Texture,
            Assets.get("ghost3") as Texture,
            Assets.get("ghost2") as Texture,
        ]);
        this.sprite = sprite;
        this.sprite.tint = 0xffff00;
        this.sprite.anchor.set(0.5);
        this.sprite.scale.set(0.4);
        sprite.animationSpeed = 0.1;
        sprite.play();
        game.enemyContainer.addChild(this.sprite);
    }

    speed = 5;

    cooldown = 0;
    maxCooldown = 40;

     override death(): void {
        this.game.soundManager.sound("ghostDies", 0.25, this.position);
        let time = 0;
        this.game.player.unregisterTarget(this);
        const length = 50;
        const h = (dt: number) => {
            time += dt;
            const ratio = time / length;
            this.sprite.alpha = 1 - ratio;
            if (time > length) {
                this.game.splash.happenings.delete(h);
                this.remove();
            }
        }    

        this.game.splash.happenings.add(h);
    }

    update(dt: number) {

        if(this.health.length == 0) return;
        const player = this.game.player;

        const prefferedDistance = 10;
        const maxDistance = 1000;

        let distance = this.position.distance(player.position);
        let ratio = this.cooldown / this.maxCooldown;
        if (ratio > 0.2) ratio = 1;
        this.sprite.alpha = 1 - ratio * 0.2;
        if (distance > maxDistance) {
            this.cooldown = 0;
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
                const dist = diff.length();
                if (dist < 250) {
                    this.position.add(diff.normalize(dist/250 * 3));
                }
            }
        }
        super.update(dt);
    }
}
