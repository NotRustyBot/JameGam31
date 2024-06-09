import { AnimatedSprite, Assets, Container, Sprite, Texture } from "pixi.js";
import { Game } from "./game";
import { ITargetable } from "./targetable";
import { Vector } from "./types";
import { RuneColor, RuneSymbol, RuneType } from "./gestureRecodniser";
import { OutlineFilter } from "pixi-filters";
import { Wizard } from "./wizard";
import { Ghost } from "./ghost";

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
            let timeout = 0;
            const h = (dt: number) => {
                timeout += dt;
                this.game.soundManager.danger++;
                if (timeout > 500) {

                    this.game.splash.happenings.delete(h);
                }
            };

            this.game.splash.happenings.add(h);
            for (let i = 0; i < 5; i++) {
                const position = new Vector(this.position.x, this.position.y).add(Vector.fromAngle((i * Math.PI * 2) / 5).mult(250 + 100 * i));
                this.game.splash.incoming(position, 200 + 100 * i);
                this.game.timeManager.schedule(200 + 100 * i, () => {
                    this.game.exMachina.ghostsSummoned = true;
                    const enemy = new Ghost(this.game);
                    enemy.position.set(position.x, position.y);
                    enemy.maxHealth = 1;
                    enemy.randomHealth("greenCircles");
                    this.game.exMachina.summonedGhosts.add(enemy);
                });
            }
        }
    }
}
