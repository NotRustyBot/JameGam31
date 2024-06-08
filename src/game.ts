import { Application, Assets, Container, Sprite } from "pixi.js";
import { Player } from "./player";
import { Camera } from "./camera";
import { GestureRecodniser, PlayState } from "./gestureRecodniser";
import { Mouse } from "./mouse";
import { TargetUI } from "./targetUi";
import { Enemy } from "./enemy";
import { Vector } from "./types";
import { HostileSpell } from "./hostileSpell";
import { SoundManager } from "./musicManager";
import { Wall } from "./wall";
import { PathManager } from "./pathManager";
import { RedDust } from "./redDust";

export class Game {
    keys: Record<string, boolean> = {};
    camera!: Camera;
    player!: Player;
    worldContainer = new Container();
    playerContainer = new Container();
    gestureContainer = new Container();
    targetUIContainer = new Container();
    pathContainer = new Container();
    enemyContainer = new Container();
    spellsContainer = new Container();
    poiContainer = new Container();
    gestureRecodiniser!: GestureRecodniser;
    soundManager!: SoundManager;
    pathManager!: PathManager;
    targetUI!: TargetUI;
    app!: Application;
    mouse!: Mouse;
    redDust!: RedDust;

    walls = new Set<Wall>();
    enemies = new Set<Enemy>();
    spells = new Set<HostileSpell>();
    genericUpdatables = new Set<{ update: (dt: number) => void }>();
    init(app: Application, keys: Record<string, boolean>, mouse: Mouse) {
        app.ticker.add((time) => this.loop(time.deltaTime));
        this.keys = keys;
        this.mouse = mouse;
        this.camera = new Camera(this);
        this.targetUI = new TargetUI(this);
        this.player = new Player(this);
        app.stage.addChild(this.worldContainer);
        app.stage.addChild(this.gestureContainer);
        this.worldContainer.addChild(this.pathContainer);
        this.worldContainer.addChild(this.poiContainer);
        this.worldContainer.addChild(this.playerContainer);
        this.worldContainer.addChild(this.enemyContainer);
        this.worldContainer.addChild(this.spellsContainer);
        this.worldContainer.addChild(this.targetUIContainer);
        this.app = app;
        this.gestureRecodiniser = new GestureRecodniser(this);
        this.soundManager = new SoundManager(this);
        this.pathManager = new PathManager(this);
    }

    loop(dt: number) {
        if (this.gestureRecodiniser.playState == PlayState.playing) {
            dt *= 0.1;
        }

        this.player.update(dt);
        this.camera.update(dt);
        this.targetUI.update(dt);
        for (const enemy of this.enemies) {
            enemy.update(dt);
        }

        for (const spell of this.spells) {
            spell.update(dt);
        }

        for (const genericUpdatable of this.genericUpdatables) {
            genericUpdatable.update(dt);
        }

        this.gestureRecodiniser.update(dt);
        this.soundManager.update(dt);
    }

    mouseWorldPosition(): Vector {
        return this.mouse.position.result().add(this.camera.position);
    }
}
