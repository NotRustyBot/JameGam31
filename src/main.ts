import { Application, Assets, Container, Sprite, Text } from "pixi.js";
import "./style.css";
import { Game } from "./game";
import { Vector } from "./types";
import bundle from "./bundle.json";
import { loadLevel } from "./levelLoader";
const text = new Text("Loading graphics", { fill: 0xffffff });

(async () => {
    const app = new Application();
    const game = new Game();

    const PermanentMarker = new FontFace("PermanentMarker", "url('PermanentMarker-Regular.ttf')");
    await PermanentMarker.load();
    document.fonts.add(PermanentMarker);


    text.style.fontFamily = "PermanentMarker";

    window.addEventListener("resize", () => {
        game.resize();
        text.position.set(app.screen.width / 2, app.screen.height - 200);
    });

    await app.init({ background: "#334433", resizeTo: window, antialias: true });
    document.body.appendChild(app.canvas);
    app.stage.addChild(text);
    text.anchor.set(0.5);
    text.position.set(app.screen.width / 2, app.screen.height - 200);

    Assets.addBundle("assets", bundle);

    await Assets.loadBundle("assets");
    text.text = "Loading sounds";
    let soundsToPreload = [
        "sounds/exploration.wav",
        "sounds/combat.wav",
        "sounds/voice/1.wav",
        "sounds/voice/2.wav",
        "sounds/voice/3.wav",
        "sounds/voice/4.wav",
        "sounds/voice/5.wav",
        "sounds/voice/6.wav",
        "sounds/voice/7.wav",
        "sounds/voice/8.wav",
        "sounds/voice/9.wav",
        "sounds/voice/10.wav",
        "sounds/voice/11.wav",
        "sounds/voice/12.wav",
        "sounds/voice/13.wav",
        "sounds/voice/14.wav",
        "sounds/voice/15.wav",
        "sounds/voice/16.wav",
        "sounds/voice/17.wav",
        "sounds/voice/18.wav",
        "sounds/voice/19.wav",

        "sounds/campfireLoop.wav",
        "sounds/damage.wav",
        "sounds/fireballHit.wav",
        "sounds/ghostDies.wav",
        "sounds/impact.wav",
        "sounds/missileCast.wav",
        "sounds/missileHit.wav",
        "sounds/oozeDies.wav",
        "sounds/spellCast.wav",
        "sounds/spellFail.wav",
        "sounds/spellSustain.wav",
        "sounds/spellTouch.wav",
    ];

    const promises = [];

    for (const sound of soundsToPreload) {
        const howl = new Howl({ src: [sound] });
        promises.push(
            new Promise<void>((resolve) => {
                howl.on("load", () => {
                    resolve();
                });
            })
        );
    }

    await Promise.all(promises);

    let keys: Record<string, boolean> = {};
    const mouse = {
        position: new Vector(),
        down: false,
    };

    document.addEventListener("keydown", (e) => {
        keys[e.key.toLowerCase()] = true;
    });

    document.addEventListener("keyup", (e) => {
        delete keys[e.key.toLowerCase()];
    });

    document.addEventListener("mousedown", (e) => {
        mouse.down = true;
    });

    document.addEventListener("mouseup", (e) => {
        mouse.down = false;
    });

    document.addEventListener("mousemove", (e) => {
        mouse.position.x = e.clientX;
        mouse.position.y = e.clientY;
    });

    text.text = "Click to start";

    await new Promise<void>((resolve) => {
        document.addEventListener("mousedown", (e) => {
            resolve();
        });
    });

    text.visible = false;

    game.init(app, keys, mouse);
    loadLevel(game);
    game.pathManager.render();
})();
