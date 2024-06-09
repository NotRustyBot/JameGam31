import { Assets, Sprite } from "pixi.js";
import { Game } from "./game";
import { RuneType, areRuneTypesEqual, runeColorDictionary } from "./gestureRecodniser";
import { ITargetable } from "./targetable";
import { Vector } from "./types";
import { MagicMissile } from "./magicMissile";
import { OutlineFilter } from "pixi-filters";

export class Totem implements ITargetable {
    position = new Vector();
    range = 100;
    game: Game;
    sprite: Sprite;
    loadedSymbol: RuneType | undefined = undefined;
    constructor(game: Game) {
        this.game = game;
        this.sprite = new Sprite(Assets.get("totem"));
        this.sprite.anchor.set(0.5);
        this.sprite.scale.set(0.3);
        this.sprite.filters = [
            new OutlineFilter({
                color: 0xffffff,
                thickness: 10,
            }),
        ]
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
        this.sprite.texture = Assets.get("totemLit");
    }

    showSymbols() {
        return {
            runes: this.loadedSymbol ? [this.loadedSymbol] : [],
            count: 1,
        };
    }

    areaRange = 400;

    particleCooldown = 0;

    update(dt: number) {
        if(this.loadedSymbol && this.game.player.position.distanceSquared(this.position) < this.areaRange ** 2) {
            this.game.soundManager.ambientTracks["spell"].level += 0.5; 
        }

        if (this.loadedSymbol != undefined) {
            for (const enemy of this.game.enemies) {
                if (enemy.position.distanceSquared(this.position) < this.areaRange ** 2) {
                    const lastHealth = enemy.health[enemy.health.length - 1];
                    if (areRuneTypesEqual(lastHealth, this.loadedSymbol)) {
                        enemy.onSpell(this.loadedSymbol);
                    }
                }
            }

            for (const spell of this.game.spells) {
                if (spell instanceof MagicMissile) {
                    if (spell.position.distanceSquared(this.position) < this.areaRange ** 2) {
                        areRuneTypesEqual(spell.missileRune, this.loadedSymbol) && spell.remove();
                    }
                }
            }
        }

        if (this.loadedSymbol != undefined) {
            this.particleCooldown += dt;
            while (this.particleCooldown > 0) {
                const offset = Vector.fromAngle(Math.random() * Math.PI * 2).mult(this.areaRange);

                this.game.splash.magicSpark(this.position.result().add(offset), runeColorDictionary[this.loadedSymbol.color], new Vector(0, -5), this.loadedSymbol.symbol);
                this.particleCooldown--;
            }
        }

        this.sprite.position.set(...this.position.xy());
    }
}
