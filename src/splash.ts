import { Assets, Container, Graphics, Sprite, Text } from "pixi.js";
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
        sprite.anchor.set(1, 0);
        sprite.x = this.game.camera.size.x;
        this.game.overlayContainer.addChild(sprite);
        let elapsed = 0;
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

    monologue(text: string, time: number) {
        const container = new Container();
        const mainSprite = new Sprite(Assets.get("mainProfile"));
        const bubble = new Sprite(Assets.get("bubble"));
        const textSprie = new Text({ text: "", style: { fontSize: 25, fill: 0x000000, wordWrap: true, wordWrapWidth: bubble.width - 130 } });
        textSprie.x = -bubble.width / 2 + 110;
        textSprie.y = -80;
        bubble.anchor.set(0.5);
        mainSprite.anchor.set(0.5);
        mainSprite.x = -bubble.width / 2 - 50;
        container.addChild(bubble, mainSprite, textSprie);
        this.game.overlayContainer.addChild(container);
        container.position.x = this.game.camera.size.x / 2;
        container.position.y = this.game.camera.size.y + 500;
        let elapsed = 0;
        const h = (dt: number) => {
            const ratio = elapsed / (time - 100);
            const substring = text.substring(0, Math.floor(text.length * ratio));
            textSprie.text = substring;

            elapsed += dt;
            mainSprite.rotation = Math.sin(elapsed * 0.1) * 0.1;
            if (elapsed < 30) {
                container.position.y = this.game.camera.size.y + (30 - elapsed) * 20 - 200;
            }

            if (elapsed > time - 30) {
                container.position.y = this.game.camera.size.y - 200 + (elapsed - time + 30) * 20;
            }

            if (elapsed > time) {
                this.happenings.delete(h);
                container.destroy();
            }
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

        let life = 30;

        const h = (dt: number) => {
            const gtd = dt * this.game.timeManager.gameRate;
            life -= gtd;
            position.add(velocity.result().mult(gtd));
            velocity.add(new Vector(Math.random() - 0.5, Math.random() - 0.5).mult(gtd).mult(2));
            velocity.mult(0.95);
            sprite.position.set(...position.xy());
            sprite.alpha = ((life / 30) * 0.5 + 0.5) * 0.3;
            if (life < 0) {
                this.happenings.delete(h);
                sprite.destroy();
                return;
            }
        };
        this.happenings.add(h);
    }

    incoming(vector: Vector, time: number) {
        let spawnCooldown = 0;
        const h = (dt: number) => {
            time -= dt;

            spawnCooldown += dt * this.game.timeManager.gameRate;
            while (spawnCooldown > 0) {
                spawnCooldown--;
                this.magicSpark(vector.result(),  0xff5555, new Vector(0, 1));
            }

            if (time < 0) {
                this.happenings.delete(h);
                return;
            }
        };
        this.happenings.add(h);
    }
}
