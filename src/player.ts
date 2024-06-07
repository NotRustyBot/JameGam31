import { Assets, Sprite } from "pixi.js";
import { Game } from "./game";
import { Vector } from "./types";
import { Enemy } from "./enemy";
import { ITargetable } from "./targetable";
import { PlayState, RuneType } from "./gestureRecodniser";

export class Player {
    position: Vector = new Vector();
    game: Game;
    speed: number = 6;
    sprite: Sprite;
    target: ITargetable | undefined;

    potentialTargets = new Set<ITargetable>();

    targetRange = 350;

    targetInRange = false;

    constructor(game: Game) {
        this.game = game;
        this.sprite = new Sprite(Assets.get("marker"));
        this.sprite.anchor.set(0.5);
        game.playerContainer.addChild(this.sprite);
        game.camera.follow(this);
    }

    registerTarget(target: ITargetable) {
        this.potentialTargets.add(target);
    }

    unregisterTarget(target: ITargetable) {
        this.potentialTargets.delete(target);
    }

    preparedRune: RuneType | undefined = undefined;
    readyRune(type: RuneType) {
        this.preparedRune = type;
    }

    hit() {

    }

    update(dt: number) {
        const controlVector = new Vector();
        if (this.game.keys["a"]) {
            controlVector.x = -1;
        }

        if (this.game.keys["d"]) {
            controlVector.x = 1;
        }

        if (this.game.keys["w"]) {
            controlVector.y = -1;
        }

        if (this.game.keys["s"]) {
            controlVector.y = 1;
        }

        if (controlVector.lengthSquared() > 0) {
            controlVector.normalize(this.speed);
            this.position.add(controlVector.mult(dt));
        }

        if (this.game.gestureRecodiniser.playState == PlayState.idle) {
            for (const target of this.potentialTargets) {
                if (this.position.distanceSquared(target.position) < this.targetRange ** 2) {
                    if (this.game.mouseWorldPosition().distanceSquared(target.position) < target.range ** 2) {
                        this.target = target;
                        this.game.targetUI.setSymbols(target.showSymbols());
                        break;
                    }
                }
            }
        }

        this.targetInRange = false;
        if (this.target && this.target.position.distanceSquared(this.position) < this.targetRange ** 2) {
            this.targetInRange = true;
        }

        if(this.game.gestureRecodiniser.playState == PlayState.idle && this.preparedRune != undefined){
            if(this.targetInRange){
                this.target?.onSpell(this.preparedRune);
            }
            this.preparedRune = undefined;
        }

        this.sprite.position.x = this.position.x;
        this.sprite.position.y = this.position.y;
    }
}
