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

        this.setSymbols([]);
    }

    setSymbols(symbols: Array<RuneType>) {
        [...this.container.children].forEach((child) => {
            child.destroy();
        });
        this.healthBg = new Sprite(Assets.get("healthBg"));
        this.healthBg.scale.set(0.5);
        this.healthBg.anchor.set(0.5);
        this.container.addChild(this.healthBg);
        for (let index = 0; index < symbols.length; index++) {
            const element = symbols[index];
            const sprite = new Sprite(Assets.get(symbolToSprite[element.symbol]));
            this.container.addChild(sprite);
            sprite.tint = runeColorDictionary[element.color];
            sprite.scale.set(0.75);
            sprite.anchor.set(0.5);
            sprite.rotation = Math.sin(index) * 0.2;
            sprite.x = index * 50 - 120;
            if (index < symbols.length - 1) {
                sprite.alpha = 0.5;
            }
        }
    }

    update(dt: number) {
        if (this.game.player.target) {
            this.container.visible = true;
            if (this.game.player.targetInRange) {
                this.healthBg.tint = 0xffffff;
            } else {
                this.healthBg.tint = 0x553333;
            }
            this.container.x = this.game.player.target.position.x;
            this.container.y = this.game.player.target.position.y - 100;
        } else {
            this.container.visible = false;
        }
    }
}
