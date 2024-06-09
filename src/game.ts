import { Application, Assets, Container, Graphics, Matrix, RenderTexture, Sprite, Text } from "pixi.js";
import { Player } from "./player";
import { Camera } from "./camera";
import { GestureRecodniser, PlayState } from "./gestureRecodniser";
import { Mouse } from "./mouse";
import { TargetUI } from "./targetUi";
import { Vector } from "./types";
import { HostileSpell } from "./hostileSpell";
import { SoundManager } from "./musicManager";
import { Wall } from "./wall";
import { PathManager } from "./pathManager";
import { RedDust } from "./redDust";
import { EnemyBase } from "./enemyBase";
import { TimeManager } from "./timeManager";
import { Splash } from "./splash";
import { ExMahcina as ExMachina } from "./exMachina";
import { UIManager } from "./uiManager";

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
    particlesContainer = new Container();
    spellsContainer = new Container();
    poiContainer = new Container();
    overlayContainer = new Container();
    glowContainer = new Container();
    uiContainer = new Container();
    gestureRecodiniser!: GestureRecodniser;
    soundManager!: SoundManager;
    pathManager!: PathManager;
    targetUI!: TargetUI;
    app!: Application;
    mouse!: Mouse;
    redDust!: RedDust;
    timeManager!: TimeManager;

    shadowSprite!: Sprite;

    tagged = new Map<string, any>();
    walls = new Set<Wall>();
    enemies = new Set<EnemyBase>();
    spells = new Set<HostileSpell>();
    genericUpdatables = new Set<{ update: (dt: number) => void }>();
    splash!: Splash;
    exMachina!: ExMachina;
    lightRenderTexture: any;
    lightBaseDarkness!: Graphics;
    shadowGraphics!: Graphics;
    uiManager!: UIManager;
    init(app: Application, keys: Record<string, boolean>, mouse: Mouse) {
        app.ticker.add((time) => this.loop(time.deltaTime));
        this.app = app;
        this.camera = new Camera(this);
        this.lightBaseDarkness = new Graphics();
        this.lightBaseDarkness.rect(0, 0, this.camera.size.x, this.camera.size.y);
        this.lightBaseDarkness.fill({ color: 0xffffff, alpha: 1 });
        this.glowContainer.addChild(this.lightBaseDarkness);
        this.keys = keys;
        this.mouse = mouse;
        this.targetUI = new TargetUI(this);
        this.player = new Player(this);
        app.stage.addChild(this.worldContainer);
        app.stage.addChild(this.gestureContainer);
        this.lightRenderTexture = RenderTexture.create({ width: app.canvas.width, height: app.canvas.height });
        this.shadowSprite = new Sprite(this.lightRenderTexture);

        this.shadowGraphics = new Graphics();
        this.shadowGraphics.rect(0, 0, this.camera.size.x, this.camera.size.y);
        this.shadowGraphics.fill({ color: 0x000000, alpha: 1 });
        this.shadowGraphics.mask = this.shadowSprite;
        app.stage.addChild(this.uiContainer);
        app.stage.addChild(this.overlayContainer);
        this.worldContainer.addChild(this.pathContainer);
        this.worldContainer.addChild(this.poiContainer);
        this.worldContainer.addChild(this.playerContainer);
        this.worldContainer.addChild(this.enemyContainer);
        this.worldContainer.addChild(this.spellsContainer);
        this.worldContainer.addChild(this.shadowGraphics);
        this.worldContainer.addChild(this.particlesContainer);
        this.worldContainer.addChild(this.targetUIContainer);
        this.gestureRecodiniser = new GestureRecodniser(this);
        this.soundManager = new SoundManager(this);
        this.pathManager = new PathManager(this);
        this.timeManager = new TimeManager();
        this.splash = new Splash(this);
        this.exMachina = new ExMachina(this);
        this.uiManager = new UIManager(this);

        this.shadowGraphics.alpha = 0;

        app.stage.addChild(this.debugText);
        this.debugText.y = 100;

       this.player.position.x = 15000;
       this.player.position.y = 5000;
    }

    resize() {
        if (!this.app) return;
        this.lightRenderTexture = RenderTexture.create({ width: this.app.canvas.width, height: this.app.canvas.height });
        this.shadowSprite.texture = this.lightRenderTexture;
        this.shadowGraphics.clear();
        this.shadowGraphics.rect(0, 0, this.camera.size.x, this.camera.size.y);
        this.shadowGraphics.fill({ color: 0x000000, alpha: 1 });
    }

    registerTagged(tagable: any, tag: string) {
        this.tagged.set(tag, tagable);
    }

    unregisterTagged(tagable: any, tag: string) {
        this.tagged.delete(tag);
    }

    debugText = new Text("", {
        fill: 0xffffff,
        fontSize: 20,
        fontFamily: "PermanentMarker",
    });

    loop(dt: number) {
        this.timeManager.update(dt);
        if (this.gestureRecodiniser.playState == PlayState.playing) {
            this.timeManager.requestRate(0.1);
        }
        const gdt = this.timeManager.gameRate * dt;
        this.player.update(gdt);
        this.camera.update(gdt);
        this.targetUI.update(gdt);
        for (const enemy of this.enemies) {
            enemy.update(gdt);
        }

        for (const spell of this.spells) {
            spell.update(gdt);
        }

        for (const genericUpdatable of this.genericUpdatables) {
            genericUpdatable.update(gdt);
        }

        this.gestureRecodiniser.update(gdt);
        this.exMachina.update(dt);
        this.splash.update(dt);
        this.soundManager.update(gdt);

        const transform = new Matrix();
        transform.translate(this.worldContainer.x, this.worldContainer.y);
        this.lightBaseDarkness.position.set(-this.worldContainer.x, -this.worldContainer.y);
        this.shadowGraphics.position.set(-this.worldContainer.x, -this.worldContainer.y);
        this.app.renderer.render({
            container: this.glowContainer,
            transform: transform,
            target: this.lightRenderTexture,
        });

        this.debugText.text = `Game Rate: ${this.timeManager.gameRate.toFixed(2)}\nHealth: ${this.player.health}\nMusic: ${this.soundManager.music.toFixed(
            2
        )}\nDanger: ${this.soundManager.danger.toFixed(2)} -> ${this.soundManager.combatVolume.toFixed(2)}`;
    }

    mouseWorldPosition(): Vector {
        return this.mouse.position.result().add(this.camera.position);
    }
}

export function getRandom<T>(arry: T[]): T {
    return arry[Math.floor(Math.random() * arry.length)];
}
