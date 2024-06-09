import { Assets, Container, Graphics, Sprite, Text } from "pixi.js";
import { Game, getRandom } from "./game";
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

    tutorial(graphic: string, time: number, slow = 0.5) {
        const sprite = new Sprite(Assets.get(graphic));
        sprite.anchor.set(1, 0);
        this.game.overlayContainer.addChild(sprite);
        let elapsed = 0;
        const h = (dt: number) => {
            sprite.x = this.game.camera.size.x;
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
            this.game.timeManager.requestRate(slow);
        };
        this.happenings.add(h);
    }

    monologue(text: string, time: number) {
        const container = new Container();
        const mainSprite = new Sprite(Assets.get("mainProfile"));
        const bubble = new Sprite(Assets.get("voicebox"));
        const textSprie = new Text({ text: "", style: { fontSize: 25, fill: 0x000000, wordWrap: true, wordWrapWidth: bubble.width - 150, fontFamily: "PermanentMarker" } });
        textSprie.x = -bubble.width / 2 + 110;
        textSprie.y = -100;
        bubble.anchor.set(0.5);
        mainSprite.anchor.set(0.5);
        mainSprite.x = -bubble.width / 2 - 50;
        container.addChild(bubble, mainSprite, textSprie);
        this.game.overlayContainer.addChild(container);
        container.position.x = this.game.camera.size.x / 2;
        container.position.y = this.game.camera.size.y + 500;
        let elapsed = 0;
        const h = (dt: number) => {
            container.position.x = this.game.camera.size.x / 2;

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

    card(card: string, win = false) {
        let t = 0;
        const graphics = new Graphics();

        if (!win) {
            graphics.rect(0, 0, this.game.camera.size.x, this.game.camera.size.y);
            graphics.fill({ color: 0x000000, alpha: 1 });
        }
        this.game.overlayContainer.addChild(graphics);
        const sprite = new Sprite(Assets.get("cardback"));
        sprite.anchor.set(0.5);
        sprite.scale.set(0.5);
        sprite.position.set(this.game.camera.size.x / 2, -500);
        if (win) {
            sprite.position.set((this.game.camera.size.x / 4) * 3, -500);
        }
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
                sprite.scale.x = Math.abs(r)/2;
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

    magicSpark(position: Vector, color: number, velocity: Vector, texture = "marker", chaos = 2, rotation = Math.PI * 2, scale = 0.5) {
        const sprite = new Sprite(Assets.get(texture));
        sprite.rotation = Math.random() * rotation;
        sprite.tint = color;
        sprite.scale.set(scale);
        sprite.anchor.set(0.5);
        this.game.particlesContainer.addChild(sprite);

        let life = 30;

        const h = (dt: number) => {
            const gtd = dt * this.game.timeManager.gameRate;
            life -= gtd;
            position.add(velocity.result().mult(gtd));
            velocity.add(new Vector(Math.random() - 0.5, Math.random() - 0.5).mult(gtd).mult(chaos));
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
            time -= dt * this.game.timeManager.gameRate;

            spawnCooldown += dt * this.game.timeManager.gameRate;
            while (spawnCooldown > 0) {
                spawnCooldown--;
                this.magicSpark(vector.result(), 0xff5555, new Vector(0, 1));
            }

            if (time < 0) {
                this.happenings.delete(h);
                return;
            }
        };
        this.happenings.add(h);
    }

    lightning() {
        this.game.soundManager.sound(getRandom(["thunder1", "thunder3", "thunder2"]), 1);
        let time = 10;
        const h = (dt: number) => {
            time -= dt * this.game.timeManager.gameRate;
            this.game.shadowGraphics.alpha = 1 - (time % 5) / 5;

            if (time < 0) {
                this.happenings.delete(h);
                this.game.shadowGraphics.alpha = 1;

                return;
            }
        };
        this.happenings.add(h);
    }

    victory() {
        const whitefill = new Graphics();
        whitefill.rect(0, 0, this.game.camera.size.x, this.game.camera.size.y);
        whitefill.fill({ color: 0xffffff });
        this.game.overlayContainer.addChild(whitefill);

        for (const enemy of this.game.enemies) {
            enemy.remove();
        }
        for (const spell of this.game.spells) {
            spell.remove();
        }

        this.game.soundManager.ambientTracks["spell"].level = 0;
        this.game.soundManager.ambientTracks["campfire"].level = 0;
        this.game.soundManager.ambientTracks["rain"].level = 0;
        this.game.soundManager.sound("victory", 0.5, this.game.player.position);

        let t = 0;

        const credits = [
            ["NotRustyBot", "Code"],
            ["varidare", "Artwork"],
            ["Tanmay Khelkar", "Artwork"],
            ["Andy Lin", "Music"],
            ["Jake Greenstein", "Sound Effects"],
            ["B0tLAS", "Voice"],
            ["Daniel Radcliffe", "Tester"],
            ["Monkey435", "Tester"],
            ["Omni", "Tester"],
        ];

        const names = credits.map((c) => c[0]).join("\n");
        const positions = credits.map((c) => c[1]).join("\n");

        const namesText = new Text({
            text: names,
            style: {
                fontSize: 36,
                fill: 0x55ff55,
                fontFamily: "PermanentMarker",
                align: "left",
            },
        });

        namesText.anchor.set(0, 0);

        namesText.position.x = 310;
        namesText.position.y = 50;

        const posText = new Text({
            text: positions,
            style: {
                fontSize: 36,
                fill: 0x5555ff,
                fontFamily: "PermanentMarker",
                align: "right",
            },
        });
        posText.anchor.set(1, 0);
        posText.position.x = 300;
        posText.position.y = 50;

        namesText.alpha = 0;
        posText.alpha = 0;

        const thanks = new Text({
            text: "Thanks for playing!",
            style: {
                fontSize: 48,
                fill: 0xffaa55,
                fontFamily: "PermanentMarker",
                align: "right",
            },
        });
        thanks.alpha = 0;
        thanks.position.y = 500;
        thanks.position.x = 100;

        const lineup =  new Sprite(Assets.get("lineup"));
        lineup.position.x = window.innerWidth ;
        lineup.position.y = window.innerHeight;
        lineup.anchor.set(0, 1);
        lineup.scale.set(-0.75, 0.75);
        lineup.alpha = 0;

        const card1 =  new Sprite(Assets.get("card1"));
        card1.position.x = window.innerWidth - 450;
        card1.position.y = 400;
        card1.scale.set(0.3);
        card1.anchor.set(0.5, 1);
        card1.rotation = -0.3
        card1.alpha = 0;

        const card2 =  new Sprite(Assets.get("card2"));
        card2.position.x =window.innerWidth - 350;
        card2.position.y = 400;
        card2.scale.set(0.3);
        card2.anchor.set(0.5, 1);
        card2.alpha = 0;

        const card3 =  new Sprite(Assets.get("card3"));
        card3.position.x = window.innerWidth - 250;
        card3.position.y = 400;
        card3.scale.set(0.3);
        card3.anchor.set(0.5, 1);
        card3.rotation = 0.3
        card3.alpha = 0;




        this.game.overlayContainer.addChild(lineup);
        this.game.overlayContainer.addChild(namesText);
        this.game.overlayContainer.addChild(posText);
        this.game.overlayContainer.addChild(thanks);
        this.game.overlayContainer.addChild(card1);
        this.game.overlayContainer.addChild(card2);
        this.game.overlayContainer.addChild(card3);

        let card = false;

        const h = (dt: number) => {
            t += dt;
            this.game.soundManager.musicTarget = 0;

            if (!card && t > 250) {
                this.card("card3", true);
                this.game.soundManager.voiceline("18");
                this.game.soundManager.voiceline("19");
                card = true;
            }

            if (t > 600 && t < 800) {
                posText.alpha = (t - 600) / 200;
                namesText.alpha = (t - 600) / 200;
            }

            if (t > 1000 && t < 1100) {
                lineup.alpha = (t - 1000) / 100;
            }

            if (t > 1100 && t < 1200) {
                card1.alpha = (t - 1100) / 100;
            }

            if (t > 1200 && t < 1300) {
                card2.alpha = (t - 1200) / 100;
            }

            if (t > 1300 && t < 1400) {
                card3.alpha = (t - 1300) / 100;
            }

            if (t > 1500 && t < 1600) {
                thanks.alpha = (t - 1500) / 100;
            }
        };
        this.happenings.add(h);
    }
}
