import { Assets, Sprite } from "pixi.js";
import { Game } from "./game";
import { Vector } from "./types";
import { Wizard } from "./wizard";
import { ITargetable } from "./targetable";
import { PlayState, RuneType } from "./gestureRecodniser";
import { collision } from "./collision";
import { keys, mouse } from "./editor/editorRun";
import { TimeManager } from "./timeManager";

export class Player {
    position: Vector = new Vector();
    size = new Vector(50, 50);
    game: Game;
    speed: number = 6;
    sprite: Sprite;
    glow: Sprite;
    target: ITargetable | undefined;
    health = 4;

    potentialTargets = new Set<ITargetable>();

    targetRange = 350;

    targetInRange = false;

    nearNodes = new Set<Vector>();

    respawnCoords = new Vector(0, 0);

    constructor(game: Game) {
        this.game = game;
        this.sprite = new Sprite(Assets.get("mainProfile"));
        this.sprite.scale.set(0.5);
        this.sprite.anchor.set(0.5);
        game.playerContainer.addChild(this.sprite);
        game.camera.follow(this);
        this.glow = new Sprite(Assets.get("glow"));
        this.glow.anchor.set(0.5);
        this.glow.scale.set(20);
        this.glow.tint = 0x000000;
        this.glow.alpha = 0.5;
        game.glowContainer.addChild(this.glow);
    }

    registerTarget(target: ITargetable) {
        this.potentialTargets.add(target);
    }

    unregisterTarget(target: ITargetable) {
        this.potentialTargets.delete(target);
        if (target === this.target) {
            this.target = undefined;
        }
    }

    preparedRune: RuneType | undefined = undefined;
    readyRune(type: RuneType) {
        this.preparedRune = type;
    }

    hit() {
        this.health--;
        this.game.soundManager.sound("damage", 0.5, this.position);
        if (this.health <= 0) {
            this.position = this.respawnCoords.result();
            this.health = 5;
            this.game.soundManager.sound("impact", 0.5, this.position);
        }
        this.game.uiManager.updateHealth(this.health);
    }

    walking = 0;

    fetchNodes() {
        this.nearNodes = new Set();
        for (const node of this.game.pathManager.allNodes) {
            if (node.distance(this.position) < 1000) {
                this.nearNodes.add(node);
            }
        }
    }

    nearestNode() {
        let dist = Infinity;
        let nearest = null;
        for (const node of this.nearNodes) {
            const currentDist = node.distance(this.position);
            if (currentDist == 0) continue;
            if (currentDist < dist) {
                dist = currentDist;
                nearest = node;
            }
        }
        return nearest;
    }

    allowDistance = 400;
    nodeCheckCooldown = 0;
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

        if (this.nodeCheckCooldown > 0) {
            this.nodeCheckCooldown -= dt;
        } else {
            this.fetchNodes();
            this.nodeCheckCooldown = 10;
        }

        if (controlVector.lengthSquared() > 0) {
            if (this.game.keys["shift"]) {
                controlVector.normalize(this.speed * 10);
                const nextPosition = this.position.result().add(controlVector);
                this.game.camera.moveTo(nextPosition, 10);
                this.position.set(...nextPosition.xy());
            } else {
                controlVector.normalize(this.speed * dt);
                const nextPosition = this.position.result().add(controlVector);
                this.position.set(...nextPosition.xy());
/*
                const nearest = this.nearestNode();
                if (!nearest) {
                } else {
                    const nextposdist = nearest.distanceSquared(nextPosition);
                    const currentdist = nearest.distanceSquared(this.position);
                    if (nextposdist < this.allowDistance ** 2 || nextposdist < currentdist) {
                        this.position.set(...nextPosition.xy());
                    }
                }

                for (const wall of this.game.walls) {
                    const res = collision(wall, this);
                    if (res) {
                        this.position.add(res);
                    }
                }*/
                this.walking++;
            }
        }

        this.walking *= 0.9;
        if (this.walking < 0.1) {
            this.walking = 0;
        }

        this.walking = Math.min(this.walking, 1);
        this.sprite.rotation = Math.sin(this.game.timeManager.timeElapsed * 0.3) * this.walking * 0.1;

        if (this.game.gestureRecodiniser.playState != PlayState.playing) {
            for (const target of this.potentialTargets) {
                if (this.game.mouseWorldPosition().distanceSquared(target.position) < target.range ** 2) {
                    this.target = target;
                    break;
                }
            }
        }

        this.targetInRange = false;
        if (this.target && this.target.position.distanceSquared(this.position) < this.targetRange ** 2) {
            this.targetInRange = true;
        }

        if (this.game.gestureRecodiniser.playState == PlayState.idle && this.preparedRune != undefined) {
            if (this.targetInRange) {
                this.target?.onSpell(this.preparedRune);
            }
            this.preparedRune = undefined;
        }

        this.sprite.position.x = this.position.x;
        this.sprite.position.y = this.position.y;

        this.glow.position.x = this.position.x;
        this.glow.position.y = this.position.y;
    }
}
