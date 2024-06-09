import { Assets, Sprite } from "pixi.js";
import { Game } from "./game";
import { OutlineFilter } from "pixi-filters";

const hpColors = [0xff5555, 0xccccff, 0xaaaaff, 0x6666ff, 0x4444ff];

export class UIManager {
    game: Game;
    bgSprite: Sprite;

    healthSprites: Array<Sprite> = [];
    constructor(game: Game) {
        this.game = game;
        this.bgSprite = new Sprite(Assets.get("playerHp"));
        game.uiContainer.addChild(this.bgSprite);
        this.bgSprite.scale.x = 0.8;
        this.bgSprite.scale.y = 0.8;
        this.bgSprite.x = -50;
        this.bgSprite.y = -25;

        this.updateHealth(game.player.health);
    }

    updateHealth(health: number) {
        for (const sprite of this.healthSprites) {
            sprite.destroy();
        }

        for (let index = 0; index < health; index++) {
            const sprite = new Sprite(Assets.get("hpBar"));
            sprite.filters = [new OutlineFilter({ color: 0x000000, thickness: 3 })];
            sprite.tint = hpColors[index];
            sprite.x = index * (40 + index * 11) + 10;
            sprite.y = 10;
            sprite.skew.set(-0.2, 0);
            sprite.scale.x = 0.15 + index * 0.08;
            sprite.scale.y = 0.5;
            this.game.uiContainer.addChild(sprite);
            this.healthSprites.push(sprite);
        }
    }
}
