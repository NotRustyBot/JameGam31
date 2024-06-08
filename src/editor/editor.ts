import { Application, Assets, Container, Sprite } from "pixi.js";
import "../style.css";
import { Vector } from "../types";
import bundle from "../bundle.json";
import { app, downloadWorld, editorInit, editorRun, keys, loadFile, mouse } from "./editorRun";

(async () => {
    await app.init({ background: "#221122", resizeTo: window });

    Assets.addBundle("assets", bundle);

    await Assets.loadBundle("assets");

    document.body.appendChild(app.canvas);

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

    document.addEventListener("wheel", (e) => {
        mouse.scroll = e.deltaY;
    });

    document.addEventListener("mousemove", (e) => {
        mouse.position.x = e.clientX;
        mouse.position.y = e.clientY;
    });
    app.ticker.add(editorRun);
    const props = document.createElement("textarea");
    document.body.appendChild(props);
    props.style.position = "absolute";
    props.style.bottom = "30px";
    props.style.left = "0";
    props.style.width = "250px";
    props.style.height = "150px";
    props.style.backgroundColor = "rgba(0,0,0,0.5)";
    props.style.color = "white";
    props.style.boxSizing = "border-box";
    props.style.fontSize = "16px";
    props.style.resize = "none";

    //download button
    const download = document.createElement("button");
    document.body.appendChild(download);
    download.innerText = "download";
    download.style.position = "absolute";
    download.style.bottom = "0px";
    download.style.left = "0";
    download.style.width = "125px";
    download.style.height = "30px";
    download.style.backgroundColor = "rgba(0,0,0,0.5)";
    download.style.color = "white";
    download.style.boxSizing = "border-box";
    download.style.fontSize = "16px";
    download.addEventListener("click", downloadWorld);

    //load file button
    const load = document.createElement("input");
    document.body.appendChild(load);
    load.type = "file";
    load.style.position = "absolute";
    load.style.bottom = "0px";
    load.style.left = "125px";
    load.style.width = "125px";
    load.style.height = "30px";
    load.style.backgroundColor = "rgba(0,0,0,0.5)";
    load.style.color = "white";
    load.style.boxSizing = "border-box";
    load.style.fontSize = "16px";
    load.addEventListener("change", (e) => {
        //@ts-ignore
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            loadFile(reader.result as string);
        };
        reader.readAsText(file);
    })

    editorInit(props);
})();
