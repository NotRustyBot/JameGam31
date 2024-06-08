import { Game } from "./game";
import { Howl } from "howler";

export class SoundManager {
    musicTracks: Record<string, MusicTrack> = {};
    game: Game;
    danger = 0;
    masterVolume = 0.3;
    constructor(game: Game) {
        this.game = game;

        this.musicTracks["exploration"] = {
            name: "exploration",
            swap: 60 + 15,
            howlA: new Howl({
                src: ["sounds/exploration.wav"],
            }),
            howlB: new Howl({
                src: ["sounds/exploration.wav"],
            }),
        };

        this.musicTracks["exploration"].howlA.play();

        this.musicTracks["combat"] = {
            name: "combat",
            swap: 0,
            howlA: new Howl({
                src: ["sounds/combat.wav"],
            }),
            howlB: new Howl({
                src: ["sounds/combat.wav"],
            }),
        };

        this.musicTracks["combat"].howlA.play();
    }

    combatVolume = 0;

    update(dt: number) {
        const exploration = this.musicTracks["exploration"];
        const combat = this.musicTracks["combat"];
        let t = exploration.howlA.seek();

        if (t > exploration.swap) {
            exploration.howlB.play();
            combat.howlB.play();

            exploration.howlB.seek(t);
            combat.howlB.seek(t);

            exploration.howlA.seek(0);
            combat.howlA.seek(0);
        }

        exploration.howlA.volume(this.masterVolume);
        exploration.howlB.volume(this.masterVolume);

        combat.howlA.volume(this.combatVolume * this.masterVolume);
        combat.howlB.volume(this.combatVolume * this.masterVolume);

        if (this.danger > 0.5) {
            this.combatVolume += 0.01;
        } else {
            this.combatVolume -= 0.01;
        }

        this.combatVolume = Math.min(1, Math.max(0, this.combatVolume));

        this.danger /= 1.1;
    }
}

type MusicTrack = {
    name: string;
    swap: number;
    howlA: Howl;
    howlB: Howl;
};
