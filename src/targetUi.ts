import { Assets, Container, Sprite } from "pixi.js";
import { Game } from "./game";
import { RuneColor, RuneSymbol, RuneType, runeColorDictionary } from "./gestureRecodniser";

const symbolToSprite: Record<RuneSymbol, string> = {
    [RuneSymbol.circle]: "circle",
    [RuneSymbol.square]: "square",
    [RuneSymbol.star]: "star",
    [RuneSymbol.triangle]: "triangle",
    [RuneSymbol.downangle]: "downangle",
    [RuneSymbol.eight]: "eight",
};

export class TargetUI {
    game: Game;
    container = new Container();
    healthBg: Sprite;
    constructor(game: Game) {
        this.game = game;
        game.targetUIContainer.addChild(this.container);
        this.healthBg = new Sprite(Assets.get("healthBg"));
    }

    setSymbols({ runes, count }: { runes: Array<RuneType>; count: number }) {
        [...this.container.children].forEach((child) => {
            child.destroy();
        });
        this.healthBg = new Sprite(Assets.get("healthBg"));
        this.healthBg.scale.set((0.5 * count) / 6, 0.5);
        this.healthBg.anchor.set(0.5);
        this.container.addChild(this.healthBg);
        for (let index = 0; index < runes.length; index++) {
            const element = runes[index];
            const sprite = new Sprite(Assets.get(symbolToSprite[element.symbol]));
            this.container.addChild(sprite);
            sprite.tint = runeColorDictionary[element.color];
            sprite.scale.set(0.75);
            sprite.anchor.set(0.5);
            sprite.rotation = Math.sin(index) * 0.2;
            sprite.x = index * 50 - (150 * count) / 6 + 25;
            if (index < runes.length - 1) {
                sprite.alpha = 0.5;
            }
        }
    }

    update(dt: number) {
        if (this.game.player.target) {
            this.setSymbols(this.game.player.target.showSymbols());

            this.container.visible = true;
            if (this.game.player.targetInRange) {
                this.healthBg.tint = 0xffffff;
            } else {
                this.healthBg.tint = 0x553333;
            }
            this.container.x = this.game.player.target.position.x;
            this.container.y = this.game.player.target.position.y - 100 - this.game.player.target.range;
        } else {
            this.container.visible = false;
        }
    }
}
