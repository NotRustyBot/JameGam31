import { AnimatedSprite, Assets, Container, Sprite, Texture } from "pixi.js";
import { Game } from "./game";
import { ITargetable } from "./targetable";
import { Vector } from "./types";
import { RuneColor, RuneSymbol, RuneType } from "./gestureRecodniser";
import { OutlineFilter } from "pixi-filters";
import { Enemy } from "./enemy";

export class RedDust implements ITargetable {
    sprite: Sprite;
    position = new Vector();
    range: number = 30;
    game: Game;

    level = 0;
    ready = false;

    constructor(game: Game) {
        this.sprite = new Sprite(Assets.get("redDust"));
        this.game = game;
        game.genericUpdatables.add(this);
        game.poiContainer.addChild(this.sprite);
        this.sprite.anchor.set(0.5);
        this.sprite.scale.set(0.5);
        this.sprite.filters = [
            new OutlineFilter({
                color: 0xffffff,
                thickness: 10,
            }),
        ];
    }

    update(dt: number) {
        console.log("redDust", this.level);
        
        if (this.level == 5 && !this.ready) {
            this.ready = true;
            this.game.player.registerTarget(this);
        }
        this.sprite.position.set(...this.position.xy());
    }

    showSymbols(): { runes: RuneType[]; count: number } {
        if (this.level == 5) {
            return {
                runes: [
                    {
                        color: RuneColor.red,
                        symbol: RuneSymbol.star,
                    },
                ],
                count: 1,
            };
        }

        return {
            runes: [],
            count: 1,
        };
    }

    readonly addBurnTime = 1000;

    onSpell(rune: RuneType): void {
        if (rune.color === RuneColor.red && rune.symbol === RuneSymbol.star && this.ready) {
            if (this == this.game.player.target) this.game.player.target = undefined;
            this.game.player.unregisterTarget(this);
            for (let i = 0; i < 5; i++) {
                const enemy =new Enemy(this.game);
                enemy.position.set(this.position.x, this.position.y).add(Vector.fromAngle(i * Math.PI * 2 / 5).mult(250));
                enemy.randomHealth("greenCircles");
        }
        }
    }
}
