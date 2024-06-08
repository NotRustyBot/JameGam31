import { Assets, Graphics } from "pixi.js";
import { Game } from "./game";
import { Vector, Vectorlike } from "./types";

export enum RuneColor {
    red = "red",
    green = "green",
    blue = "blue",
}

export enum RuneSymbol {
    circle = "circle",
    square = "square",
    star = "star",
    triangle = "triangle",
    downangle = "downangle",
    eight = "eight",
}

export enum PlayState {
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
    [RuneSymbol.downangle]: [1, 3, 5],
    [RuneSymbol.square]: [1, 2, 4, 5],
    [RuneSymbol.star]: [0, 2, 5, 1, 4],
    [RuneSymbol.circle]: [0, 1, 2, 3, 4, 5],
    [RuneSymbol.eight]: [1, 2, 5, 4],
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

            case 5:
                likelyShape = RuneSymbol.star;
                break;

            case 6:
                likelyShape = RuneSymbol.circle;
                break;

            default:
                this.failSymbol();
                return;
        }

        //smallest from playedArray
        const smallest = Math.min(...this.playedArray);

        while (smallest != this.playedArray[0]) {
            let temp = this.playedArray.shift();
            this.playedArray.push(temp!);
        }

        for (const symbols in validSymbols) {
            const runeSymbol = RuneSymbol[symbols as keyof typeof RuneSymbol];
            const symbol = validSymbols[runeSymbol];
            if (symbol.length != this.playedArray.length) continue;

            let allGood = true;
            for (let i = 0; i < symbol.length; i++) {
                if (symbol[i] != this.playedArray[i]) {
                    allGood = false;
                    break;
                }
            }

            if (allGood) {
                this.successSymbol(runeSymbol);
                return;
            }

            allGood = true;

            this.playedArray.reverse();
            while (smallest != this.playedArray[0]) {
                let temp = this.playedArray.shift();
                this.playedArray.push(temp!);
            }

            for (let i = 0; i < symbol.length; i++) {
                if (symbol[i] != this.playedArray[i]) {
                    allGood = false;
                    break;
                }
            }

            if (allGood) {
                this.successSymbol(runeSymbol);
                return;
            }
        }

        this.failSymbol();
    }

    successSymbol(symbol: RuneSymbol) {
        console.log("cast", symbol);

        this.playState = PlayState.finished;
        this.playCooldown = this.successCooldown;
        this.runeSymbol = symbol;
        if (this.runeColor == undefined) {
            throw new Error("RuneColor is undefined");
        }
        this.game.player.readyRune({ color: this.runeColor, symbol: this.runeSymbol });
    }

    failSymbol() {
        this.playState = PlayState.failed;
        this.playCooldown = this.failCooldown;
    }

    isMouseNearCenter() {
        const center = new Vector(this.game.camera.size.x / 2, this.game.camera.size.y / 2);
        const distance = center.distance(this.game.mouse.position);
        return distance < 100;
    }

    update(dt: number) {
        this.graphics.clear();

        if (this.playState == PlayState.failed) {
            if (this.playCooldown > 0) {
                this.handleFailing();
                this.playCooldown -= dt;
            } else {
                if (this.isMouseNearCenter() || !this.game.mouse.down) this.playState = PlayState.idle;
            }
        } else if (this.playState == PlayState.finished) {
            if (this.playCooldown > 0) {
                this.playCooldown -= dt;
            }
            this.playCooldown = Math.max(0, this.playCooldown);
            this.handleSuccess();
            if (!this.game.mouse.down) this.playState = PlayState.idle;
        } else {
            if (this.game.mouse.down && this.playState == PlayState.idle) {
                this.playState = PlayState.playing;
                this.points = [];
                this.runeColor = undefined;
                this.playedArray = [];
            }

            if (this.playState == PlayState.playing) {
                if (!this.game.mouse.down) {
                    if (this.playedArray.length > 0) {
                        this.failSymbol();
                    } else {
                        this.playState = PlayState.idle;
                    }
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
            let alpha = 0.5;
            if (this.game.mouseWorldPosition().distanceSquared(this.game.player.position) < this.game.player.targetRange ** 2) {
                alpha = 1;
            }

            let color = 0xffffff;
            if (this.runeColor !== undefined) {
                color = runeColorDictionary[this.runeColor];
            }

            let ratio = this.playCooldown / this.successCooldown;
            const size = this.game.camera.size.x / 6;

            let coord = this.runeOffset(this.playedArray[0], size * (0.5 + ratio), this.game.mouse.position);
            this.graphics.moveTo(coord.x, coord.y);

            if (this.runeSymbol == RuneSymbol.circle) {
                this.graphics.circle(this.game.mouse.position.x, this.game.mouse.position.y, size * (0.5 + ratio));
                this.graphics.fill({ color: color, alpha: ratio * 0.25 });
                this.graphics.stroke({ color: color, alpha: alpha * (1 - ratio), width: 5 });
            } else {
                for (const played of this.playedArray) {
                    coord = this.runeOffset(played, size * (0.5 + ratio), this.game.mouse.position);
                    this.graphics.lineTo(coord.x, coord.y);
                }

                coord = this.runeOffset(this.playedArray[0], size * (0.5 + ratio), this.game.mouse.position);
                this.graphics.lineTo(coord.x, coord.y);

                this.graphics.fill({ color: color, alpha: ratio * 0.25 });
                this.graphics.stroke({ color: color, alpha: alpha * (1 - ratio), width: 5 });
            }
        }
    }

    runeToPosition(runeIndex: number) {
        const size = this.game.camera.size.x / 6;
        const rune = this.runeSetup[runeIndex];
        return new Vector(rune.x, rune.y).mult(size).add({ x: this.game.camera.size.x / 2, y: this.game.camera.size.y / 2 });
    }

    runeOffset(runeIndex: number, size: number, offset: Vector) {
        const rune = this.runeSetup[runeIndex];
        return new Vector(rune.x, rune.y).mult(size).add(offset);
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

export function areRuneTypesEqual(a: RuneType, b: RuneType) {
    if (a.color == b.color && a.symbol == b.symbol) {
        return true;
    }
    return false;
}

export function randomRuneType(useTypes?: Array<RuneSymbol>, useColors?: Array<RuneColor>): RuneType {
    if (useTypes === undefined) {
        useTypes = [...Object.values(RuneSymbol)];
    }

    if (useColors === undefined) {
        useColors = [...Object.values(RuneColor)];
    }

    const indexShape = Math.floor(Math.random() * useTypes.length);
    const indexColor = Math.floor(Math.random() * useColors.length);
    return { color: useColors[indexColor], symbol: useTypes[indexShape] };
}
