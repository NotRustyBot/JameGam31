export type ObjectTemplateData = {
    name: string;
    image: string;
    scale?: number;
} & any;

export const templates: ObjectTemplateData[] = [
    {
        name: "totem",
        image: "totem",
    },
    {
        name: "enemy",
        image: "triangle",
        health: 5,
        family: "default",
    },
    {
        name: "campfire",
        image: "campfire",
        scale: 0.5,
    },
    {
        name: "candle",
        image: "candle",
        scale: 0.1,
    },
    {
        name: "wall",
        image: "square",
        size: {
            x: 100,
            y: 100,
        },
    },
    {
        name: "path",
        image: "path",
    },
    {
        name: "redDust",
        image: "redDust",
    },
];
