import { Application, Assets, Container, Sprite } from "pixi.js";
import "./style.css";
import { threshold } from "./shader/someFilter";
import { Howl } from "howler";
import { Game } from "./game";
import { Vector } from "./types";
(async () => {
    const app = new Application();

    await app.init({ background: "#222222", resizeTo: window });

    Assets.addBundle("assets", {
        jglogo: "jglogo.png",
        marker: "marker.png",
        sraf: "sraf.png",
    });

    await Assets.loadBundle("assets");

    document.body.appendChild(app.canvas);

    let keys: Record<string, boolean> = {};
    const mouse = {
        position: new Vector(),
        down: false,
    }
    const game = new Game();
    game.init(app, keys, mouse);
    document.addEventListener("keydown", (e) => {
        keys[e.key.toLowerCase()] = true;
    });

    document.addEventListener("keyup", (e) => {
        delete keys[e.key.toLowerCase()];
    });

    document.addEventListener("mousedown", (e) => {
        mouse.down = true;
    })

    document.addEventListener("mouseup", (e) => {
        mouse.down = false;
    })

    document.addEventListener("mousemove", (e) => {
        mouse.position.x = e.clientX;
        mouse.position.y = e.clientY;
    })
})();
