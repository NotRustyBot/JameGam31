import { Assets, Container, Sprite } from "pixi.js";
import { Game } from "./game";
import { Vector } from "./types";
import { RuneColor, RuneSymbol, RuneType, areRuneTypesEqual, randomRuneType } from "./gestureRecodniser";
import { ITargetable } from "./targetable";
import { HostileSpell } from "./hostileSpell";

export class Enemy implements ITargetable {
    position: Vector;
    sprite: Sprite;
    health: Array<RuneType> = new Array<RuneType>();
    game: Game;
    range = 100;
    maxHealth = 5;
    constructor(game: Game) {
        this.game = game;
        this.position = new Vector(0, 0);
        this.sprite = new Sprite(Assets.get("marker"));
        this.sprite.tint = 0xff0000;
        this.sprite.anchor.set(0.5);
        game.enemyContainer.addChild(this.sprite);

        this.health = [
            { color: RuneColor.red, symbol: RuneSymbol.circle },
            { color: RuneColor.blue, symbol: RuneSymbol.square },
            { color: RuneColor.green, symbol: RuneSymbol.circle },
            { color: RuneColor.red, symbol: RuneSymbol.triangle },
            { color: RuneColor.green, symbol: RuneSymbol.triangle },
        ];
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

    speed = 3;

    cooldown = 100;
    maxCooldown = 100;

    update(dt: number) {
        const player = this.game.player;

        const prefferedDistance = 420;
        const maxDistance = 600;

        let distance = this.position.distance(player.position);
        let ratio = this.cooldown / this.maxCooldown;
        if (ratio > 0.2) ratio = 1;
        this.sprite.alpha = 1 - ratio * 0.2;
        if (distance > maxDistance) {
            this.cooldown = this.maxCooldown;
        } else {
            this.game.soundManager.danger++;
            this.cooldown -= dt;

            let strength = Math.min(Math.max(distance - prefferedDistance, -100), 100) / 100;

            const diff = this.position.diff(player.position);
            if (this.cooldown < 0) {
                this.cooldown = this.maxCooldown;
                const spell = new HostileSpell(this.game);
                spell.position.set(...this.position.xy());
                spell.velocity = diff.result().normalize(-10);
            }
            this.position.add(diff.normalize(-strength * this.speed * dt));

            for (const enemy of this.game.enemies) {
                if (enemy == this) continue;

                const diff = this.position.diff(enemy.position);
                if (diff.length() < 100) {
                    this.position.add(diff.normalize(1));
                }
            }
        }

        this.sprite.position.set(...this.position.xy());
    }
}
