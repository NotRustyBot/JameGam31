import { Assets, Sprite } from "pixi.js";
import { Game } from "./game";
import { Slime } from "./slime";
import { SlimeBall } from "./slimeball";
import { Vector } from "./types";
import { Ghost } from "./ghost";

export class BigOoze {
    game: Game;
    position = new Vector();
    sprite: Sprite;
    constructor(game: Game) {
        this.game = game;
        game.genericUpdatables.add(this);

        this.sprite = new Sprite(Assets.get("bigOoze"));
        this.sprite.anchor.set(0.5);
        game.enemyContainer.addChild(this.sprite);
        game.bigOoze = this;
    }

    ticker = 0;
    cooldown = 0;

    fullAuto = 0;

    fullAutoCooldown = 0;

    update(dt: number) {
        this.sprite.position.set(this.position.x, this.position.y);

        this.sprite.scale.y = Math.sin(this.game.timeManager.timeElapsed * 0.05) * 0.1 + 1;

        if (this.game.player.position.distanceSquared(this.position) > 2000 ** 2) {
            return;
        }

        this.game.soundManager.danger += 1;

        this.cooldown -= dt;
        if (this.cooldown < 0) {
            this.cooldown = 200;

            this.ticker++;
            this.ticker %= 10;

            if (this.ticker == 5) {
                const position = new Vector(this.position.x, this.position.y + 500 - this.ticker * 200);
                this.game.splash.incoming(position, 200);
                this.game.timeManager.schedule(200, () => {
                    const enemy = new Slime(this.game);
                    enemy.position.set(position.x, position.y);
                    enemy.maxHealth = 6;
                    enemy.randomHealth("slime");
                });
            }

            if (this.ticker == 6) {
                this.fullAuto = Math.PI;
            }

            if (this.ticker == 0) {
                const count = 6
               for (let index = 0; index < count; index++) {
                const position = new Vector(this.position.x + 500, this.position.y - 500).add(Vector.fromAngle(index / count * Math.PI * 2).mult(100));
                this.game.splash.incoming(position, 200);
                this.game.timeManager.schedule(200, () => {
                    const enemy = new Ghost(this.game);
                    enemy.position.set(position.x, position.y);
                    enemy.maxHealth = 2;
                    enemy.randomHealth("greenCircles");
                });
               }
            }
        }

        if (this.fullAuto > 0) {
            this.fullAutoCooldown -= dt;
            if (this.fullAutoCooldown < 0) {
                this.fullAutoCooldown = 12;
                this.fullAuto -= 0.1;

                for (let index = 0; index < 4; index++) {
                    let spell = new SlimeBall(this.game);
                    spell.position.set(...this.position.xy());
                    spell.velocity = Vector.fromAngle((index / 4) * Math.PI * 2 + this.fullAuto).mult(5);
                }
            }
        }
    }
}
