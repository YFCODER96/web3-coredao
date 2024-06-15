"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ConcurrencyRequest {
    constructor({ maxConcurrencyCount }) {
        this.maxConcurrencyCount = maxConcurrencyCount;
        this.taskQueue = [];
        setInterval(() => {
            this._doRequest();
        }, 0);
    }
    addTask(task) {
        this.taskQueue.push(task);
    }
    _doRequest() {
        if (!this.taskQueue.length)
            return;
        const minCount = getMinCount(this.maxConcurrencyCount, this.taskQueue.length);
        for (let i = 0; i < minCount; i++) {
            const task = this.taskQueue.shift();
            this.maxConcurrencyCount--;
            if (!task)
                break;
            this._runTask(task);
        }
    }
    _runTask(task) {
        task()
            .then((response) => {
        })
            .catch((error) => {
        })
            .finally(() => {
            this.maxConcurrencyCount++;
            this._doRequest();
        });
    }
}
function getMinCount(a, b) {
    return Math.min(a, b);
}
exports.default = ConcurrencyRequest;
