import { Assets, Sprite } from "pixi.js";
import { Game } from "./game";
import { RuneColor, RuneSymbol, RuneType, areRuneTypesEqual, randomRuneType, runeColorDictionary } from "./gestureRecodniser";
import { ITargetable } from "./targetable";
import { Vector } from "./types";

const fills = [RuneSymbol.triangle, RuneSymbol.square, RuneSymbol.circle];

export class Obelisk implements ITargetable {
    game: Game;
    position = new Vector();
    range = 200;

    charge = 0;

    health: Array<RuneType> = new Array<RuneType>();

    charge1Sprite: Sprite;
    charge2Sprite: Sprite;
    sprite: Sprite;

    constructor(game: Game) {
        this.game = game;
        this.sprite = new Sprite(Assets.get("obelisk0"));
        this.sprite.anchor.set(0.5,0.5);
        this.sprite.scale.set(0.5);
        this.game.poiContainer.addChild(this.sprite);
        this.charge1Sprite = new Sprite(Assets.get("glow"));
        this.charge1Sprite.anchor.set(0.5);
        this.charge1Sprite.visible = false;
        this.charge1Sprite.scale.set(5);
        this.charge1Sprite.tint = 0x000000;
        this.charge1Sprite.alpha = 0.5;


        this.game.glowContainer.addChild(this.charge1Sprite);
        this.charge2Sprite = new Sprite(Assets.get("glow"));
        this.charge2Sprite.anchor.set(0.5);
        this.charge2Sprite.visible = false;
        this.charge2Sprite.scale.set(10);
        this.charge2Sprite.tint = 0x000000;
        this.charge2Sprite.alpha = 0.5;

        this.game.glowContainer.addChild(this.charge2Sprite);

        this.fill();
        game.player.registerTarget(this);

        game.obelisk = this;
    }

    updatePosition(){
        this.sprite.position.set(...this.position.xy());
        this.charge1Sprite.position.set(...this.position.xy());
        this.charge2Sprite.position.set(...this.position.xy());
    }


    fill() {
        for (let i = 0; i < 5; i++) {
            this.health.push(randomRuneType([fills[this.charge]]));
        }
    }

    onSpell(rune: RuneType): void {
        const last = this.health[this.health.length - 1];
        if (areRuneTypesEqual(rune, last)) {
            const symbol = this.health.pop()!;
            this.game.soundManager.sound("spellTouch", 1, this.position);
            for (let index = 0; index < 10; index++) {
                this.game.splash.magicSpark(new Vector(this.position.x, this.position.y), runeColorDictionary[symbol.color], Vector.fromAngle((index / 10) * Math.PI * 2).mult(10), symbol.symbol);
            }
        }

        if (this.health.length === 0) {
            this.charge++;
            if (this.charge == 1) {
                this.charge1Sprite.visible = true;
                this.sprite.texture = Assets.get("obelisk1");
            }

            if (this.charge == 2) {
                this.charge2Sprite.visible = true;
                this.sprite.texture = Assets.get("obelisk2");
            }

            if (this.charge == 3) {
                //big W
                this.sprite.texture = Assets.get("obelisk3");
                return;
            }
            let time = 500;
            let emit = 0;
            const h = (dt: number) => {
                const gdt = this.game.timeManager.gameRate * dt;
                time -= gdt;
                emit += gdt * 0.1;
                while (emit > 0) {
                    emit--;
                    this.game.splash.magicSpark(
                        new Vector(this.position.x, this.position.y).add(Vector.fromAngle(Math.random() * Math.PI * 2).mult(100 * Math.random())),
                        0xffaaff,
                        new Vector(0, -1),
                        "marker",
                        0,
                        0,
                        0.5
                    );
                }

                if (time < 0) {
                    this.game.splash.happenings.delete(h);
                    this.fill();

                    for (let index = 0; index < 20; index++) {
                        this.game.splash.magicSpark(
                            new Vector(this.position.x, this.position.y),
                            0xffaaff,
                            Vector.fromAngle(Math.random() * Math.PI * 2).mult(10),
                            "marker",
                            0,
                            0,
                            0.5
                        );
                    }
                }
            };
            this.game.splash.happenings.add(h);
        }
    }
    showSymbols(): { runes: RuneType[]; count: number } {
        return { runes: this.health, count: 5 };
    }
}
