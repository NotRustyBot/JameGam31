import { Assets, Sprite } from "pixi.js";
import { Game } from "./game";
import { Vector } from "./types";

export class HostileSpell {
    game: Game;
    position = new Vector();
    sprite: Sprite;
    glow: Sprite;
    life = 100;
    velocity = new Vector();
    constructor(game: Game) {
        this.game = game;
        this.sprite = new Sprite(Assets.get("projectile"));
        game.spellsContainer.addChild(this.sprite);
        game.spells.add(this);

        this.glow = new Sprite(Assets.get("glow"));
        this.glow.anchor.set(0.5);
        this.glow.scale.set(2);
        this.glow.tint = 0x000000;
        game.glowContainer.addChild(this.glow);
    }

    remove() {
        this.sprite.destroy();
        this.glow.destroy();
        this.game.spells.delete(this);
    }

    update(dt: number) {
        if (this.game.player.position.distanceSquared(this.position) < this.game.player.size.x ** 2) {
            this.game.player.hit();
            this.remove();
            return;
        }

        this.life -= dt;

        if (this.life <= 0) {
            this.remove();
            return;
        }

        this.sprite.alpha = (this.life / 100) * 0.5 + 0.5;
        this.position.add(this.velocity.result().mult(dt));
        this.sprite.position.set(...this.position.xy());
        this.glow.position.set(...this.position.xy());
    }
}
