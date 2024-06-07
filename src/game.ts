import { Application, Assets, Container, Sprite } from "pixi.js";
import { Player } from "./player";
import { Camera } from "./camera";
import { GestureRecodniser, PlayState } from "./gestureRecodniser";
import { Mouse } from "./mouse";
import { TargetUI } from "./targetUi";
import { Enemy } from "./enemy";
import { Vector } from "./types";
import { HostileSpell } from "./hostileSpell";
import { Totem } from "./totem";
import { SoundManager } from "./musicManager";

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
    poiContainer = new Container();
    gestureRecodiniser!: GestureRecodniser;
    soundManager!: SoundManager;
    targetUI!: TargetUI;
    app!: Application;
    mouse!: Mouse;

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
        this.worldContainer.addChild(new Sprite(Assets.get("jglogo")));
        this.worldContainer.addChild(this.playerContainer);
        this.worldContainer.addChild(this.poiContainer);
        this.worldContainer.addChild(this.enemyContainer);
        this.worldContainer.addChild(this.spellsContainer);
        this.worldContainer.addChild(this.targetUIContainer);
        this.app = app;
        this.gestureRecodiniser = new GestureRecodniser(this);
        for (let i = 0; i < 6; i++) {
            const enemy = new Enemy(this);
            enemy.maxHealth = i + 1;
            enemy.randomHealth();
            const vector = Vector.fromAngle((i / 6) * Math.PI * 2);
            enemy.position = vector.normalize(650).add({x: 1600, y: 0});
        }

        const totem = new Totem(this);

        totem.position.x = 1600;

        this.soundManager = new SoundManager(this);
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
