import { Assets, Container, Sprite } from "pixi.js";
import { Game } from "./game";
import { Vector } from "./types";
import { RuneColor, RuneSymbol, RuneType, areRuneTypesEqual, randomRuneType } from "./gestureRecodniser";
import { ITargetable } from "./targetable";
import { HostileSpell } from "./hostileSpell";

export class EnemyBase implements ITargetable {
    position: Vector;
    sprite!: Sprite;
    health: Array<RuneType> = new Array<RuneType>();
    game: Game;
    range = 100;
    maxHealth = 5;
    constructor(game: Game) {
        this.game = game;
        this.position = new Vector(0, 0);
        game.player.registerTarget(this);
        game.enemies.add(this);
    }

    randomHealth(family?: string) {
        this.health = [];
        if (family == "default" || !family) {
            for (let i = 0; i < this.maxHealth; i++) {
                this.health.push(randomRuneType([RuneSymbol.circle, RuneSymbol.square, RuneSymbol.triangle]));
            }
        } else if (family == "greenCircles") {
            for (let i = 0; i < this.maxHealth; i++) {
                this.health.push({color: RuneColor.green, symbol: RuneSymbol.circle});
            }
        }
    }

    showSymbols() {
        return { runes: this.health, count: this.maxHealth };
    }

    remove() {
        this.game.enemies.delete(this);
        this.sprite.destroy();
        this.game.player.unregisterTarget(this);
    }

    onSpell(runeType: RuneType) {
        const last = this.health[this.health.length - 1];

        if (areRuneTypesEqual(runeType, last)) {
            this.health.pop();
        }
        if (this.game.player.target === this) this.game.targetUI.setSymbols(this.showSymbols());

        if (this.health.length === 0) {
            this.remove();
            this.game.player.target = undefined;
        }
    }


    update(dt: number) {
        this.sprite.position.set(...this.position.xy());
    }
}
