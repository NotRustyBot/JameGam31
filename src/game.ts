import { Application, Assets, Container, Sprite } from "pixi.js";
import { Player } from "./player";
import { Camera } from "./camera";
import { GestureRecodniser, PlayState } from "./gestureRecodniser";
import { Mouse } from "./mouse";
import { TargetUI } from "./targetUi";
import { Enemy } from "./enemy";
import { Vector } from "./types";
import { HostileSpell } from "./hostileSpell";

export class Game {
    keys: Record<string, boolean> = {};
    camera!: Camera;
    player!: Player;
    worldContainer = new Container();
    playerContainer = new Container();
    gestureContainer = new Container();
    targetUIContainer = new Container();
    enemyContainer = new Container();
    spellsContainer = new Container();
    gestureRecodiniser!: GestureRecodniser;
    targetUI!: TargetUI;
    app!: Application;
    mouse!: Mouse;

    enemies = new Set<Enemy>();
    spells = new Set<HostileSpell>();
    init(app: Application, keys: Record<string, boolean>, mouse: Mouse) {
        app.ticker.add((time) => this.loop(time.deltaTime));
        this.keys = keys;
        this.mouse = mouse;
        this.camera = new Camera(this);
        this.targetUI = new TargetUI(this);
        this.player = new Player(this);
        app.stage.addChild(this.worldContainer);
        app.stage.addChild(this.gestureContainer);
        this.worldContainer.addChild(new Sprite(Assets.get("jglogo")));
        this.worldContainer.addChild(this.playerContainer);
        this.worldContainer.addChild(this.enemyContainer);
        this.worldContainer.addChild(this.spellsContainer);
        this.worldContainer.addChild(this.targetUIContainer);
        this.app = app;
        this.gestureRecodiniser = new GestureRecodniser(this);
        const e1 = new Enemy(this);
        e1.position.x = 700;
        const e2 = new Enemy(this);
        e2.position.y = -200;
    }

    loop(dt: number) {


        if(this.gestureRecodiniser.playState == PlayState.playing) {
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

        this.gestureRecodiniser.update(dt);
    }

    mouseWorldPosition(): Vector {
        return this.mouse.position.result().add(this.camera.position);
    }
}
