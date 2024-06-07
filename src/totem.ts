import { Assets, Sprite } from "pixi.js";
import { Game } from "./game";
import { RuneType, areRuneTypesEqual } from "./gestureRecodniser";
import { ITargetable } from "./targetable";
import { Vector } from "./types";

export class Totem implements ITargetable {
    position = new Vector();
    range = 50;
    game: Game;
    sprite: Sprite;
    loadedSymbol: RuneType | undefined = undefined;
    constructor(game: Game) {
        this.game = game;
        this.sprite = new Sprite(Assets.get("totem"));
        this.sprite.anchor.set(0.5);
        game.genericUpdatables.add(this);
        game.player.registerTarget(this);
        game.poiContainer.addChild(this.sprite);
    }

    remove() {
        this.game.player.unregisterTarget(this);
        this.game.genericUpdatables.delete(this);
        this.sprite.destroy();
    }

    onSpell(rune: RuneType): void {
        this.loadedSymbol = rune;
    }

    showSymbols() {
        return {
            runes: this.loadedSymbol ? [this.loadedSymbol] : [],
            count: 1,
        };
    }

    areaRange = 200;

    update(dt: number) {
        if (this.loadedSymbol != undefined) {
            for (const enemy of this.game.enemies) {
                if (enemy.position.distanceSquared(this.position) < this.areaRange ** 2) {
                    const lastHealth = enemy.health[enemy.health.length - 1];
                    if (areRuneTypesEqual(lastHealth, this.loadedSymbol)) {
                        enemy.onSpell(this.loadedSymbol);
                        console.log("totem", this.loadedSymbol);
                    }
                }
            }
        }

        this.sprite.position.set(...this.position.xy());
    }
}
