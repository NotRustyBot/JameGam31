import { Assets, Sprite } from "pixi.js";
import { Game } from "./game";
import { Vector } from "./types";

export class HostileSpell {
    game: Game;
    position = new Vector();
    sprite: Sprite;
    life = 100;
    velocity = new Vector();
    constructor(game: Game) {
        this.game = game;
        this.sprite = new Sprite(Assets.get("projectile"));
        game.spellsContainer.addChild(this.sprite);
        game.spells.add(this);
    }

    remove(){
        this.sprite.destroy();
        this.game.spells.delete(this);
    }    

    update(dt: number) {
        if (this.game.player.position.distanceSquared(this.position) < 10 ** 2) {
            this.game.player.hit();
            this.remove();
            return;
        }

        this.life -= dt;

        this.sprite.alpha = (this.life / 100) * 0.5 + 0.5;
        this.position.add(this.velocity.result().mult(dt));
        this.sprite.position.set(...this.position.xy());
    }
}
