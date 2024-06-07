import { Filter, GlProgram, defaultFilterVert } from "pixi.js";
import fr from "./threshold.frag?raw";

let header = `//header ends here`;

let frnoh = fr.substring(fr.indexOf(header));
console.log(frnoh);

export const threshold = new Filter({
    glProgram: new GlProgram({
        fragment: frnoh,
        vertex: defaultFilterVert,
    }),
    resources: {
        timeUniforms: {
            uTime: { value: 0.0, type: "f32" },
        },
    },
});
