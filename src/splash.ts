import { Assets, Graphics, Sprite } from "pixi.js";
import { Game } from "./game";
import { Vector } from "./types";

type Happening = (dt: number) => void;

export class Splash {
    game: Game;
    constructor(game: Game) {
        this.game = game;
    }
    happenings = new Set<Happening>();

    update(dt: number): void {
        this.happenings.forEach((h) => h(dt));
    }

    progressTime(till: number) {
        const h = (dt: number) => {
            this.game.shadowGraphics.alpha += dt * 0.001;
            if (this.game.shadowGraphics.alpha > till) {
                this.happenings.delete(h);
            }
        };
        this.happenings.add(h);
    }

    tutorial(graphic: string, time: number) {
        const sprite = new Sprite(Assets.get(graphic));
        sprite.anchor.set(0.5, 0);
        this.game.overlayContainer.addChild(sprite);
        let elapsed = 0;
        sprite.position.x = this.game.camera.size.x / 2;
        const h = (dt: number) => {
            elapsed += dt;

            if (elapsed < 30) {
                sprite.alpha = elapsed / 30;
            }

            if (elapsed > time - 30) {
                sprite.alpha = (time - elapsed) / 30;
            }

            if (elapsed > time) {
                this.happenings.delete(h);
                sprite.destroy();
            }
            this.game.timeManager.requestRate(0.03);
        };
        this.happenings.add(h);
    }

    card(card: string) {
        let t = 0;
        const graphics = new Graphics();
        graphics.rect(0, 0, this.game.camera.size.x, this.game.camera.size.y);
        graphics.fill({ color: 0x000000, alpha: 1 });
        this.game.overlayContainer.addChild(graphics);
        const sprite = new Sprite(Assets.get("cardback"));
        sprite.anchor.set(0.5);
        sprite.position.set(this.game.camera.size.x / 2, -500);
        this.game.overlayContainer.addChild(sprite);
        const h = (dt: number) => {
            t += dt;
            if (t < 50) {
                graphics.alpha = (t / 50) * 0.5;
            }
            if (t < 100) {
                sprite.position.y = this.game.camera.size.y / 2 - (100 - t) * 10;
            }

            if (t > 150 && t < 200) {
                const rt = t - 150;
                if (rt > 25) {
                    sprite.texture = Assets.get(card);
                }
                const r = (25 - rt) / 25;
                sprite.scale.x = Math.abs(r);
            }

            if (t > 250) {
                graphics.alpha = (300 - t) / 100;
                sprite.position.y = this.game.camera.size.y / 2 - (250 - t) * 25;
            }

            this.game.timeManager.requestRate(0);

            if (t > 300) {
                sprite.destroy();
                graphics.destroy();
                this.happenings.delete(h);
                return;
            }
        };

        this.happenings.add(h);
    }

    magicSpark(position: Vector, color: number, velocity: Vector, texture = "marker") {
        const sprite = new Sprite(Assets.get(texture));
        sprite.rotation = Math.random() * Math.PI * 2;
        sprite.tint = color;
        sprite.scale.set(0.5);
        sprite.anchor.set(0.5);
        this.game.particlesContainer.addChild(sprite);
        const glow = new Sprite(Assets.get("glow"));
        glow.tint = 0x000000;
        glow.alpha = 0.5;
        glow.anchor.set(0.5);
        this.game.glowContainer.addChild(glow);

        let life = 30;

        const h = (dt: number) => {
            const gtd = dt * this.game.timeManager.gameRate;
            life -= gtd;
            position.add(velocity.result().mult(gtd));
            velocity.add(new Vector(Math.random() - 0.5, Math.random() - 0.5).mult(gtd).mult(2));
            velocity.mult(0.95);
            glow.position.set(...position.xy());
            sprite.position.set(...position.xy());
            sprite.alpha = ((life / 30) * 0.5 + 0.5) * 0.3;
            if (life < 0) {
                this.happenings.delete(h);
                sprite.destroy();
                glow.destroy();
                return;
            }
        };
        this.happenings.add(h);
    }
}
