import { Assets, Sprite } from "pixi.js";
import { Game } from "./game";
import { OutlineFilter } from "pixi-filters";

const hpTextures = ["health1", "health2", "health3", "health4", "health5"];


export class UIManager {
    game: Game;
    sprite: Sprite;

    constructor(game: Game) {
        this.game = game;
        this.sprite = new Sprite(Assets.get("health1"));
        game.uiContainer.addChild(this.sprite);
        this.sprite.scale.x = 0.8;
        this.sprite.scale.y = 0.8;

        this.updateHealth(game.player.health);
    }

    updateHealth(health: number) {
        this.sprite.texture = Assets.get(hpTextures[health - 1]);
    }
}
