import { Assets, Graphics } from "pixi.js";
import { Game } from "./game";
import { Vector, Vectorlike } from "./types";

export enum RuneColor {
    red,
    green,
    blue,
}

export enum RuneSymbol {
    circle,
    square,
    triangle,
}

enum PlayState {
    idle,
    playing,
    finished,
    failed,
}

export const runeColorDictionary: Record<RuneColor, number> = {
    [RuneColor.red]: 0xff5555,
    [RuneColor.green]: 0x55ff55,
    [RuneColor.blue]: 0x5555ff,
};

const validSymbols: Record<RuneSymbol, Array<number>> = {
    [RuneSymbol.triangle]: [0, 2, 4],
    [RuneSymbol.square]: [1, 2, 4, 5],
    [RuneSymbol.circle]: [0, 1, 2, 3, 4, 5],
};

type RuneMark = {
    x: number;
    y: number;
    color: RuneColor;
};

export type RuneType = {
    color: RuneColor;
    symbol: RuneSymbol;
};

export class GestureRecodniser {
    game: Game;
    isGestureUI: boolean = false;
    runeColor: RuneColor | undefined = undefined;
    runeSymbol: RuneSymbol | undefined = undefined;
    points: Vector[] = [];
    playState: PlayState = PlayState.idle;
    playCooldown = 0;
    readonly successCooldown = 25;
    readonly failCooldown = 100;
    runeSetup: Array<RuneMark> = [
        { x: 0, y: -1, color: RuneColor.red },
        { x: 0.75, y: -0.5, color: RuneColor.green },
        { x: 0.75, y: 0.5, color: RuneColor.green },
        { x: 0, y: 1, color: RuneColor.blue },
        { x: -0.75, y: 0.5, color: RuneColor.blue },
        { x: -0.75, y: -0.5, color: RuneColor.red },
    ];

    graphics: Graphics;

    playedArray = new Array<number>();

    constructor(game: Game) {
        this.game = game;
        this.graphics = new Graphics();
        this.game.gestureContainer.addChild(this.graphics);
    }

    finishSymbol() {
        let likelyShape: RuneSymbol | undefined = undefined;
        switch (this.playedArray.length) {
            case 3:
                likelyShape = RuneSymbol.triangle;
                break;
            case 4:
                likelyShape = RuneSymbol.square;
                break;

            case 6:
                likelyShape = RuneSymbol.circle;
                break;

            default:
                this.failSymbol();
                return;
                break;
        }

        let compareToSymbol = validSymbols[likelyShape];
        //smallest from playedArray
        const smallest = Math.min(...this.playedArray);
        while (smallest != this.playedArray[0]) {
            let temp = this.playedArray.shift();
            this.playedArray.push(temp!);
        }

        if (this.playedArray[1] > this.playedArray[2]) {
            //reverse the array
            this.playedArray.reverse();
            while (smallest != this.playedArray[0]) {
                let temp = this.playedArray.shift();
                this.playedArray.push(temp!);
            }
        }

        let allGood = true;
        for (let i = 0; i < compareToSymbol.length; i++) {
            if (compareToSymbol[i] != this.playedArray[i]) {
                allGood = false;
                this.failSymbol();
                return;
            }
        }

        this.successSymbol(likelyShape);
    }

    successSymbol(symbol: RuneSymbol) {
        this.playState = PlayState.finished;
        this.playCooldown = this.successCooldown;
        this.runeSymbol = symbol;
        if (this.runeColor == undefined) {
            throw new Error("RuneColor is undefined");
        }
        this.game.player.target.processHit({ color: this.runeColor, symbol: this.runeSymbol });
    }

    failSymbol() {
        this.playState = PlayState.failed;
        this.playCooldown = this.failCooldown;
    }

    update(dt: number) {
        this.graphics.clear();

        if (this.playState == PlayState.failed) {
            if (this.playCooldown > 0) {
                this.handleFailing();
                this.playCooldown -= dt;
            } else {
                if (!this.game.mouse.down) this.playState = PlayState.idle;
            }
        } else if (this.playState == PlayState.finished) {
            if (this.playCooldown > 0) {
                this.handleSuccess();
                this.playCooldown -= dt;
            } else {
                if (!this.game.mouse.down) this.playState = PlayState.idle;
            }
        } else {
            if (this.game.mouse.down && this.playState == PlayState.idle) {
                this.playState = PlayState.playing;
                this.points = [];
                this.runeColor = undefined;
                this.playedArray = [];
            }

            if (this.playState == PlayState.playing) {
                if (!this.game.mouse.down) {
                    this.failSymbol();
                    return;
                }
                this.handlePlaying();
            }
        }
    }

    handleFailing() {
        if (this.points.length > 0) {
            this.graphics.moveTo(this.points[0].x, this.points[0].y);
            for (const point of this.points) {
                this.graphics.lineTo(point.x, point.y);
            }

            let color = 0xffffff;
            let ratio = this.playCooldown / this.failCooldown;
            this.graphics.stroke({ color: color, alpha: ratio, width: 5 + 50 * (1 - ratio) });
        }
    }

    handleSuccess() {
        if (this.points.length > 0) {
            let color = 0xffffff;
            if (this.runeColor !== undefined) {
                color = runeColorDictionary[this.runeColor];
            }

            let ratio = this.playCooldown / this.successCooldown;

            let coord = this.runeToPosition(this.playedArray[0]);
            this.graphics.moveTo(coord.x, coord.y);

            if (this.runeSymbol == RuneSymbol.circle) {
                const size = this.game.camera.size.x / 6;

                this.graphics.circle(this.game.camera.size.x / 2, this.game.camera.size.y / 2, size);
                this.graphics.fill({ color: color, alpha: ratio * 0.25 });
                this.graphics.stroke({ color: color, alpha: 1 - ratio, width: 5 });
            } else {
                for (const played of this.playedArray) {
                    coord = this.runeToPosition(played);
                    this.graphics.lineTo(coord.x, coord.y);
                }

                coord = this.runeToPosition(this.playedArray[0]);
                this.graphics.lineTo(coord.x, coord.y);

                this.graphics.fill({ color: color, alpha: ratio * 0.25 });
                this.graphics.stroke({ color: color, alpha: 1 - ratio, width: 5 });
            }
        }
    }

    runeToPosition(runeIndex: number) {
        const size = this.game.camera.size.x / 6;
        const rune = this.runeSetup[runeIndex];
        return new Vector(rune.x, rune.y).mult(size).add({ x: this.game.camera.size.x / 2, y: this.game.camera.size.y / 2 });
    }

    handlePlaying() {
        const size = this.game.camera.size.x / 6;

        let currentMouse = new Vector(this.game.mouse.position.x, this.game.mouse.position.y);
        if (this.game.mouse.down && this.runeColor !== undefined) {
            this.points.push(currentMouse);
        }

        let index = 0;
        for (const rune of this.runeSetup) {
            const runePosition = this.runeToPosition(index);
            this.graphics.circle(runePosition.x, runePosition.y, 0.3 * size);

            let alpha = 0;
            if (this.playedArray.includes(index)) {
                alpha = 0.5;
            }

            this.graphics.fill({ color: runeColorDictionary[rune.color], alpha: alpha });
            this.graphics.stroke({ color: runeColorDictionary[rune.color], alpha: 0.75, width: 20 });

            if (currentMouse.distance(runePosition) < 0.25 * size) {
                if (this.runeColor == undefined) {
                    this.runeColor = rune.color;
                    this.playedArray.push(index);
                    console.log(index);
                } else {
                    const lastAdded = this.playedArray[this.playedArray.length - 1];

                    if (this.playedArray.length > 1) {
                        if (this.playedArray[0] == index) {
                            this.finishSymbol();
                            return;
                        }
                    }

                    if (lastAdded != index) {
                        this.playedArray.push(index);
                    }
                }
            }
            index++;
        }

        if (this.points.length > 0) {
            this.graphics.moveTo(this.points[0].x, this.points[0].y);
            for (const point of this.points) {
                this.graphics.lineTo(point.x, point.y);
            }

            let color = 0xffffff;
            if (this.runeColor !== undefined) {
                color = runeColorDictionary[this.runeColor];
            }

            this.graphics.stroke({ color: color, alpha: 2, width: 5 });
        }
    }
}
