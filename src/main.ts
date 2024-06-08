import { Application, Assets, Container, Sprite } from "pixi.js";
import "./style.css";
import { Game } from "./game";
import { Vector } from "./types";
import bundle from "./bundle.json";
import { loadLevel } from "./levelLoader";
(async () => {
    const app = new Application();

    await app.init({ background: "#334433", resizeTo: window });

    Assets.addBundle("assets", bundle);

    await Assets.loadBundle("assets");

    document.body.appendChild(app.canvas);

    let keys: Record<string, boolean> = {};
    const mouse = {
        position: new Vector(),
        down: false,
    };
    const game = new Game();

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

    await new Promise<void>((resolve) => {
        document.addEventListener("mousedown", (e) => {
            resolve();
        });
    });

    game.init(app, keys, mouse);
    loadLevel(game);
    game.pathManager.render();
})();
