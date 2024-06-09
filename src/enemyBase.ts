import { Assets, Container, MeshRope, Sprite } from "pixi.js";
import { Game } from "./game";
import { Vector } from "./types";
import { RuneColor, RuneSymbol, RuneType, areRuneTypesEqual, randomRuneType, runeColorDictionary } from "./gestureRecodniser";
import { ITargetable } from "./targetable";

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
                this.health.push({ color: RuneColor.green, symbol: RuneSymbol.circle });
            }
        } else if (family == "arcane") {
            for (let i = 0; i < this.maxHealth; i++) {
                this.health.push(randomRuneType([RuneSymbol.circle, RuneSymbol.triangle], [RuneColor.blue]));
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

    death(){
        this.remove();
    }

    onSpell(runeType: RuneType) {
        const last = this.health[this.health.length - 1];

        if (areRuneTypesEqual(runeType, last)) {
            const symbol = this.health.pop()!;
            this.game.soundManager.sound("damage", 0.5, this.position);
            for (let index = 0; index < 10; index++) {
                this.game.splash.magicSpark(new Vector(this.position.x, this.position.y), runeColorDictionary[symbol.color], Vector.fromAngle((index / 10) * Math.PI * 2).mult(15), symbol.symbol);
            }
        }
        if (this.game.player.target === this) this.game.targetUI.setSymbols(this.showSymbols());

        if (this.health.length === 0) {
            this.death();
            this.game.player.target = undefined;
        }
    }

    startingPosition: Vector | undefined = undefined;
    update(dt: number) {
        if (this.startingPosition == undefined) this.startingPosition = new Vector(this.position.x, this.position.y);
        this.sprite.position.set(...this.position.xy());
    }
}
