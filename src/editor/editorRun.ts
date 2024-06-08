import { Application, Assets, Container, Graphics, Sprite } from "pixi.js";
import { Vector } from "../types";
import { ObjectTemplateData, templates } from "./templates";
export const keys: Record<string, boolean> = {};
export const mouse = {
    position: new Vector(),
    last: new Vector(),
    down: false,
    scroll: 0,
};
export const app = new Application();
const worldContainer = new Container();
const grid = new Graphics();

const camera = {
    position: new Vector(0, 0),
    zoom: 1,
};

const templateContaier = new Container();
const templateGraphics = new Graphics();
const selectGraphics = new Graphics();

let selectedTemplate: ObjectTemplateData | undefined = undefined;

let selectedObject: WorldObject | undefined = undefined;

function selectWorldObject(object: WorldObject) {
    selectedObject = object;
    propsTextArea.value = JSON.stringify(object.template, null, 2);
}

function onEdit(text: string) {
    if (selectedObject) {
        selectedObject.template = JSON.parse(text);
        selectedObject.sprite.texture = Assets.get(selectedObject.template.image);
    }
}

const templateButtons: Array<{ template: ObjectTemplateData; button: Sprite }> = [];

type WorldObject = {
    template: ObjectTemplateData;
    position: Vector;
    sprite: Sprite;
};

let objects: Array<WorldObject> = [];

let propsTextArea: HTMLTextAreaElement;

export function downloadWorld() {
    const toDownload = [];
    //remove sprites
    for (const obj of objects) {
        toDownload.push({
            template: obj.template,
            position: obj.position,
        });
    }
    const json = JSON.stringify(toDownload);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "data.json";
    link.click();
}

export function loadFile(file: string) {
    const data = JSON.parse(file);

    for (const obj of data) {
        const sprite = new Sprite(Assets.get(obj.template.image));
        sprite.scale.set( obj.template.scale ?? 1 );
        sprite.position.set(obj.position.x, obj.position.y);
        worldContainer.addChild(sprite);
        objects.push({
            template: obj.template,
            position: Vector.fromLike(obj.position),
            sprite: sprite,
        });
    }
}

function unselect() {
    for (const tbtn of templateButtons) {
        tbtn.button.tint = 0xffffff;
    }
}
export function editorInit(props: HTMLTextAreaElement) {
    propsTextArea = props;

    propsTextArea.addEventListener("input", (e) => {
        onEdit(propsTextArea.value);
    });

    app.stage.addChild(worldContainer);
    app.stage.addChild(grid);
    app.stage.addChild(templateContaier);

    const origin = new Sprite(Assets.get("marker"));
    origin.anchor.set(0.5);
    worldContainer.addChild(origin);
    worldContainer.addChild(selectGraphics);

    templateContaier.addChild(templateGraphics);
    templateGraphics.rect(0, 0, 250, app.canvas.height - 150 - 30);
    templateGraphics.fill({ color: 0xffffff, alpha: 0.5 });

    let index = 0;
    for (const template of templates) {
        const container = new Container();
        templateContaier.addChild(container);
        const btn = new Sprite(Assets.get("healthBg"));
        templateButtons.push({
            template,
            button: btn,
        });
        container.addChild(btn);
        const image = new Sprite(Assets.get(template.image));
        container.addChild(image);
        btn.width = 75;
        btn.height = 75;
        //scale image to fit button
        image.scale.set(btn.width / image.width);
        image.anchor.set(0.5);
        btn.anchor.set(0.5);
        btn.interactive = true;
        //three columns
        container.x = (index % 3) * 80 + 45;
        container.y = Math.floor(index / 3) * 80 + 45;

        btn.onclick = () => {
            selectedTemplate = template;
            unselect();
            btn.tint = 0x99ff99;
            wasDown = false;
        };

        index++;
    }
}

let click = false;
let wasDown = false;

export function editorRun() {
    if (selectedObject) {
        if (keys["delete"]) {
            selectedObject.sprite.destroy();
            objects = objects.filter((o) => o !== selectedObject);
            selectedObject = undefined;
        }
    }

    if (propsTextArea === document.activeElement) {
        mouse.last = mouse.position.result();
        return;
    }
    let unzoom = 1 / camera.zoom;
    grid.clear();
    const gridskip = 100;
    for (let x = worldContainer.position.x % (gridskip / camera.zoom); x < app.canvas.width; x += gridskip / camera.zoom) {
        grid.moveTo(x, 0);
        grid.lineTo(x, app.canvas.height);
        grid.stroke({ color: 0xff0000, alpha: 1 / camera.zoom, width: 1 });
    }

    for (let y = worldContainer.position.y % (gridskip / camera.zoom); y < app.canvas.height; y += gridskip / camera.zoom) {
        grid.moveTo(0, y);
        grid.lineTo(app.canvas.width, y);
        grid.stroke({ color: 0xff0000, alpha: 1 / camera.zoom, width: 1 });
    }

    if (mouse.down) {
        const diff = mouse.last.diff(mouse.position).mult(camera.zoom);
        camera.position.sub(diff);
        if (!wasDown && diff.length() <= 1) {
            click = true;
        }

        if (diff.length() > 1) {
            click = false;
        }
    } else {
        if (wasDown && click) {
            if (mouse.position.x < 250) {
                selectedTemplate = undefined;
                unselect();
            } else {
                const midscreen = new Vector(app.canvas.width / 2, app.canvas.height / 2);
                const position = mouse.position.result().sub(midscreen).mult(camera.zoom).add(camera.position.result().mult(-1));

                let newSelected: WorldObject | undefined = undefined;

                for (const obj of objects) {
                    if (obj.position.distanceSquared(position) < 50 ** 2) {
                        newSelected = obj;
                        break;
                    }
                }

                if (newSelected) {
                    selectWorldObject(newSelected);
                } else {
                    if (selectedTemplate) {
                        const sprite = new Sprite(Assets.get(selectedTemplate.image));
                        sprite.scale.set( selectedTemplate.scale ?? 1 );
                        const obj = {
                            template: { ...selectedTemplate },
                            position: position,
                            sprite: sprite,
                        };
                        objects.push(obj);
                        selectWorldObject(obj);
                        sprite.position.set(...position.xy());
                        console.log(sprite.position);
                        sprite.anchor.set(0.5);
                        worldContainer.addChild(sprite);
                    }
                }
            }
        }
    }

    if (mouse.scroll != 0) {
        const scroll = mouse.scroll > 0 ? 1 : -1;
        camera.zoom += scroll * 0.15;
    }

    if (camera.zoom < 1) {
        camera.zoom = 1;
    }
    if (camera.zoom > 5) {
        camera.zoom = 5;
    }

    worldContainer.scale.set(unzoom);
    worldContainer.position.set(camera.position.x * unzoom + app.canvas.width / 2, camera.position.y * unzoom + app.canvas.height / 2);

    mouse.last = mouse.position.result();
    mouse.scroll = 0;
    wasDown = mouse.down;
}
