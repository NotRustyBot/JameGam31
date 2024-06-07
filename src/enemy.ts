import { Assets, Container, Sprite } from "pixi.js";
import { Game } from "./game";
import { Vector } from "./types";
import { RuneColor, RuneSymbol, RuneType } from "./gestureRecodniser";

export class Enemy {
    position: Vector;
    sprite: Sprite;
    health: Array<RuneType> = new Array<RuneType>();
    game: Game;
    constructor(game: Game) {
        this.game = game;
        this.position = new Vector(0, 0);
        this.sprite = new Sprite(Assets.get("marker"));

        this.health = [
            { color: RuneColor.red, symbol: RuneSymbol.circle },
            { color: RuneColor.blue, symbol: RuneSymbol.square },
            { color: RuneColor.green, symbol: RuneSymbol.circle },
            { color: RuneColor.red, symbol: RuneSymbol.triangle },
            { color: RuneColor.green, symbol: RuneSymbol.triangle },
        ]

        game.targetUI.setSymbols(this.health);
    }

    processHit(runeType: RuneType) {
        const last = this.health[this.health.length - 1];
        if(runeType.symbol === last.symbol && runeType.color === last.color) {
            this.health.pop();
        }

        this.game.targetUI.setSymbols(this.health);

    }

    update(dt: number) {

    }
}
