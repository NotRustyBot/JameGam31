import { Filter, GlProgram, defaultFilterVert } from "pixi.js";
import fr from "./threshold.frag?raw";

let header = `//header ends here`;

let frnoh = fr.substring(fr.indexOf(header));

export const threshold = new Filter({
    glProgram: new GlProgram({
        fragment: frnoh,
        vertex: defaultFilterVert
    }),
    padding: 10,
    resources: {
        timeUniforms: {
            uTime: { value: 0.0, type: "f32" },
        },
    },
});
