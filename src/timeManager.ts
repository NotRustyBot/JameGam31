type PlannedTask = {
    delay: number,
    task: () => void
}

export class TimeManager {

    timeElapsed = 0;
    gameRate = 1;
    targetRate = 1;


    plannedTasks = new Set<PlannedTask>();

    requestRate(rate: number) {
        this.targetRate = Math.min(rate, this.targetRate);
    }

    update(dt: number) {
        this.gameRate = this.gameRate * 0.9 + this.targetRate * 0.1;
        this.timeElapsed += dt * this.gameRate;
        this.targetRate = 1;

        for (const plan of this.plannedTasks) {
            plan.delay -= dt * this.gameRate;
            if (plan.delay < 0) {
                plan.task();
                this.plannedTasks.delete(plan);
            }
        }

    }

    schedule(delay: number, task: () => void) {
        this.plannedTasks.add({delay, task});
    }

}