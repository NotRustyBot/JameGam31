import { Assets, Container, Sprite } from "pixi.js";
import { Game } from "./game";
import { HostileSpell } from "./hostileSpell";
import { EnemyBase } from "./enemyBase";
import { MagicMissile } from "./magicMissile";
import { Vector } from "./types";
import { Ghost } from "./ghost";

export class Wizard extends EnemyBase {
    constructor(game: Game) {
        super(game);
        this.sprite = new Sprite(Assets.get("wizard"));
        this.sprite.anchor.set(0.5);
        this.sprite.scale.set(0.5);
        game.enemyContainer.addChild(this.sprite);
    }

    type = 0;

    speed = 3;

    cooldown = 100;
    maxCooldown = 100;

    override death() {
        let time = 0;
        this.game.player.unregisterTarget(this);
        const length = 50;
        const h = (dt: number) => {
            time += dt;
            const ratio = time / length;
            this.sprite.alpha = 1 - ratio;
            this.sprite.rotation = ratio ** 0.5;
            if (time > length) {
                this.game.splash.happenings.delete(h);
                this.remove();
            }
        };

        this.game.splash.happenings.add(h);
    }

    isBoss = false;

    boss() {
        this.isBoss = true;
        this.sprite.texture = Assets.get("wizardBoss");
    }

    ticker = 0;

    update(dt: number) {
        if (this.health.length == 0) return;
        const player = this.game.player;

        const prefferedDistance = 420;
        const maxDistance = 900;

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
            if (!this.isBoss) {
                if (this.cooldown < 0) {
                    this.cooldown = this.maxCooldown;
                    let spell;
                    if (this.type == 0) {
                        spell = new HostileSpell(this.game);
                    } else {
                        spell = new MagicMissile(this.game);
                        this.cooldown = this.maxCooldown * 2;
                    }
                    spell.position.set(...this.position.xy());
                    spell.velocity = diff.result().normalize(-10);
                }
            } else {
                if (this.cooldown < 0) {
                    this.cooldown = this.maxCooldown;
                    this.ticker++;

                    if (this.ticker % 2 == 0) {
                        let spell = new HostileSpell(this.game);
                        spell.position.set(...this.position.xy());
                        spell.velocity = diff.result().normalize(-10);
                    } else if (this.ticker == 1) {
                        for (let index = 0; index < 5; index++) {
                            let spell = new HostileSpell(this.game);
                            spell.position.set(...this.position.xy());
                            spell.velocity = Vector.fromAngle((index / 5) * Math.PI * 2).mult(10);
                        }
                    } else if (this.ticker == 5) {
                        const position = new Vector(this.position.x, this.position.y);
                        this.game.splash.incoming(position, 200);
                        this.game.timeManager.schedule(200, () => {
                            this.game.exMachina.ghostsSummoned = true;
                            const enemy = new Ghost(this.game);
                            enemy.position.set(position.x, position.y);
                            enemy.maxHealth = 2;
                            enemy.randomHealth("greenCircles");
                            this.game.exMachina.summonedGhosts.add(enemy);
                        });
                    } else {
                        let spell = new MagicMissile(this.game);
                        spell.position.set(...this.position.xy());
                        spell.velocity = diff.result().normalize(10);
                    }

                    if (this.ticker > 10) this.ticker = 0;
                }
            }
            this.position.add(diff.normalize(-strength * this.speed * dt));

            for (const enemy of this.game.enemies) {
                if (enemy == this) continue;

                const diff = this.position.diff(enemy.position);
                if (diff.length() < 300) {
                    this.position.add(diff.normalize(300/diff.length() * 0.1));
                }
            }
        }

        super.update(dt);
    }
}
