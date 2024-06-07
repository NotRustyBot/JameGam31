import { Assets, Container, Sprite } from "pixi.js";
import { Game } from "./game";
import { RuneColor, RuneSymbol, RuneType, runeColorDictionary } from "./gestureRecodniser";

const symbolToSprite: Record<RuneSymbol, string> = {
    [RuneSymbol.circle]: "circle",
    [RuneSymbol.square]: "square",
    [RuneSymbol.triangle]: "triangle",
};

export class TargetUI {
    game: Game;
    container = new Container();
    healthBg: Sprite;
    constructor(game: Game) {
        this.game = game;
        game.targetUIContainer.addChild(this.container);
        this.healthBg = new Sprite(Assets.get("healthBg"));


        this.setSymbols([

        ]);
    }

    setSymbols(symbols: Array<RuneType>) {
        [...this.container.children].forEach(child => {
            child.destroy();
            })
        this.healthBg = new Sprite(Assets.get("healthBg"));
        this.healthBg.scale.set(0.5);
        this.container.addChild(this.healthBg);
        for (let index = 0; index < symbols.length; index++) {
            const element = symbols[index];
            const sprite = new Sprite(Assets.get(symbolToSprite[element.symbol]));
            this.container.addChild(sprite);
            sprite.tint = runeColorDictionary[element.color];
            sprite.scale.set(0.75);
            sprite.anchor.set(0.5);
            sprite.x = index * 50 + 40;
            sprite.y = 40;
            if(index < symbols.length - 1){
                sprite.alpha = 0.5;
            }    
        }
    }
}
