import { Application, Assets, Container, Sprite } from "pixi.js";
import { Player } from "./player";
import { Camera } from "./camera";
import { GestureRecodniser } from "./gestureRecodniser";
import { Mouse } from "./mouse";
import { TargetUI } from "./targetUi";

export class Game {
    keys: Record<string, boolean> = {};
    camera!: Camera;
    player!: Player;
    worldContainer = new Container();
    playerContainer = new Container();
    gestureContainer = new Container();
    targetUIContainer = new Container();
    gestureRecodiniser!: GestureRecodniser;
    targetUI!: TargetUI;
    app!: Application;
    mouse!: Mouse;
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
        this.worldContainer.addChild(this.targetUIContainer);
        this.app = app;
        this.gestureRecodiniser = new GestureRecodniser(this);

    }

    loop(dt: number) {
        this.player.update(dt);
        this.camera.update(dt);
        this.gestureRecodiniser.update(dt);
    }
}
