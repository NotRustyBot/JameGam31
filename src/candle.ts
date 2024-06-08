import { AnimatedSprite, Assets, Container, Sprite, Texture } from "pixi.js";
import { Game } from "./game";
import { ITargetable } from "./targetable";
import { Vector } from "./types";
import { RuneColor, RuneSymbol, RuneType } from "./gestureRecodniser";
import { OutlineFilter } from "pixi-filters";

export class Candle implements ITargetable {
    container = new Container();
    sprite: Sprite;
    glow: Sprite;
    spriteBurning: AnimatedSprite;
    position = new Vector();
    range: number = 30;
    game: Game;

    lit = false;

    constructor(game: Game) {
        this.spriteBurning = new AnimatedSprite([
            Assets.get("candleB0") as Texture,
            Assets.get("candleB1") as Texture,
            Assets.get("candleB2") as Texture,
            Assets.get("candleB3") as Texture,
            Assets.get("candleB4") as Texture,
        ]);
        this.sprite = new Sprite(Assets.get("candle"));
        this.spriteBurning.visible = false;
        this.game = game;
        game.genericUpdatables.add(this);
        this.container.addChild(this.sprite, this.spriteBurning);
        game.poiContainer.addChild(this.container);
        this.sprite.anchor.set(0.5);
        this.container.filters = [
            new OutlineFilter({
                color: 0xffffff,
                thickness: 10,
            }),
        ];
        this.spriteBurning.anchor.set(0.5);
        this.spriteBurning.play();
        this.spriteBurning.animationSpeed = 0.2;
        this.container.scale.set(0.1);
        game.player.registerTarget(this);

        this.glow = new Sprite(Assets.get("glow"));
        this.glow.anchor.set(0.5);
        this.glow.scale.set(5);
        this.glow.tint = 0x000000;
        game.glowContainer.addChild(this.glow);
    }

    update(dt: number) {
        if (this.lit) {
            this.spriteBurning.visible = true;
            this.sprite.visible = false;
            this.glow.visible = true;
        } else {
            this.spriteBurning.visible = false;
            this.sprite.visible = true;
            this.glow.visible = false;
        }

        this.container.position.set(...this.position.xy());
        this.glow.position.set(...this.position.xy());
    }

    showSymbols(): { runes: RuneType[]; count: number } {
        if (!this.lit) {
            return {
                runes: [
                    {
                        color: RuneColor.red,
                        symbol: RuneSymbol.triangle,
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
        if (rune.color === RuneColor.red && rune.symbol === RuneSymbol.triangle && !this.lit) {
            this.lit = true;
            this.game.redDust.level++;
            if (this == this.game.player.target) this.game.player.target = undefined;
            this.game.player.unregisterTarget(this);
        }
    }
}
