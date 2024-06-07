import { RuneSymbol, RuneType } from "./gestureRecodniser";
import { Vector } from "./types";

export interface ITargetable {
    position: Vector;
    range: number;
    onSpell(rune: RuneType): void;
    showSymbols(): Array<RuneType>;
}
