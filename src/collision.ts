import { Vector, Vectorlike } from "./types";

export interface Boxlike {
    position: Vector;
    size: Vectorlike;
}

export function collision(collider: Boxlike, box: Boxlike): false | Vectorlike {
    const diff = collider.position.diff(box.position);
    const total = { x: collider.size.x + box.size.x, y: collider.size.y + box.size.y };
    if (Math.abs(diff.x) > total.x / 2 || Math.abs(diff.y) > total.y / 2) {
        return false;
    }

    let moveX = diff.x - total.x / 2;
    let moveY = diff.y - total.y / 2;

    if (diff.x < 0) moveX = diff.x + total.x / 2;
    if (diff.y < 0) moveY = diff.y + total.y / 2;

    if (Math.abs(moveX) > Math.abs(moveY)) {
        moveX = 0;
    } else {
        moveY = 0;
    }

    return { x: moveX, y: moveY };
}
