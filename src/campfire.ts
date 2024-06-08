import { AnimatedSprite, Assets, Container, Sprite, Texture } from "pixi.js";
import { Game } from "./game";
import { ITargetable } from "./targetable";
import { Vector } from "./types";
import { RuneColor, RuneSymbol, RuneType } from "./gestureRecodniser";
import { OutlineFilter } from "pixi-filters";

export class Campfire implements ITargetable {
    container = new Container();
    sprite: Sprite;
    spriteBurning: AnimatedSprite;
    position = new Vector();
    range: number = 100;
    game: Game;

    burnTime = 0;

    healingArea = 200;

    constructor(game: Game) {
        this.spriteBurning = new AnimatedSprite([
            Assets.get("campfireB00") as Texture,
            Assets.get("campfireB01") as Texture,
            Assets.get("campfireB02") as Texture,
            Assets.get("campfireB03") as Texture,
            Assets.get("campfireB04") as Texture,
            Assets.get("campfireB05") as Texture,
            Assets.get("campfireB06") as Texture,
            Assets.get("campfireB07") as Texture,
            Assets.get("campfireB08") as Texture,
            Assets.get("campfireB09") as Texture,
            Assets.get("campfireB10") as Texture,
            Assets.get("campfireB11") as Texture,
            Assets.get("campfireB12") as Texture,
            Assets.get("campfireB13") as Texture,
            Assets.get("campfireB14") as Texture,
            Assets.get("campfireB15") as Texture,
            Assets.get("campfireB16") as Texture,
            Assets.get("campfireB17") as Texture,
            Assets.get("campfireB18") as Texture,
            Assets.get("campfireB19") as Texture,
        ]);
        this.sprite = new Sprite(Assets.get("campfire"));
        this.spriteBurning.visible = false;
        this.game = game;
        game.genericUpdatables.add(this);
        this.container.addChild(this.sprite, this.spriteBurning);
        game.poiContainer.addChild(this.container);
        this.sprite.anchor.set(0.5);
        this.sprite.scale.set(0.5);
        this.container.filters = [new OutlineFilter({
            color: 0xffffff,
            thickness: 10,
        })];
        this.spriteBurning.anchor.set(0.5);
        this.spriteBurning.scale.set(0.5);
        this.spriteBurning.play();
        this.spriteBurning.animationSpeed = 0.2;
        game.player.registerTarget(this);
    }

    update(dt: number) {
        if (this.burnTime > 0) {
            this.burnTime -= dt;
            if (this.game.player.position.distanceSquared(this.position) < this.healingArea ** 2) {
            }
            this.spriteBurning.visible = true;
            this.sprite.visible = false;
        } else {
            this.spriteBurning.visible = false;
            this.sprite.visible = true;
        }

        this.sprite.position.set(...this.position.xy());
        this.spriteBurning.position.set(...this.position.xy());
    }

    showSymbols(): { runes: RuneType[]; count: number } {
        if (this.burnTime <= 0) {
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
            runes: [
                {
                    color: RuneColor.blue,
                    symbol: RuneSymbol.circle,
                },
            ],
            count: 1,
        };
    }

    readonly addBurnTime = 1000;

    onSpell(rune: RuneType): void {
        if (rune.color === RuneColor.red && rune.symbol === RuneSymbol.triangle && this.burnTime <= 0) {
            this.burnTime = this.addBurnTime;
        } else if (rune.color === RuneColor.blue && rune.symbol === RuneSymbol.circle && this.burnTime > 0) {
            this.burnTime = 0;
        }
    }
}
