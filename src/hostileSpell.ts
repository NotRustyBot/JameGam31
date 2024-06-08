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
        this.sprite = new Sprite(Assets.get("marker"));
        this.sprite.scale.set(0.5);
        this.sprite.anchor.set(0.5);;
        game.spellsContainer.addChild(this.sprite);
        game.spells.add(this);
        this.sprite.tint = 0xffcc55;


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

    particleCooldown = 0;

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

        while (this.particleCooldown > 0) {
            this.game.splash.magicSpark(this.position.result(), 0xffaa00, this.velocity.result().mult(-0.2));
            this.particleCooldown -= 1;
        }

        this.particleCooldown += dt;

        this.sprite.alpha = (this.life / 100) * 0.5 + 0.5;
        this.sprite.rotation = this.velocity.toAngle();
        this.position.add(this.velocity.result().mult(dt));
        this.sprite.position.set(...this.position.xy());
        this.glow.position.set(...this.position.xy());
    }
}
