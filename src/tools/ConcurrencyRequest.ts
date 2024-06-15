class ConcurrencyRequest {
  maxConcurrencyCount: number;
  taskQueue: Function[];
  // responses: Object[];
  constructor({ maxConcurrencyCount }: { maxConcurrencyCount: number }) {
    this.maxConcurrencyCount = maxConcurrencyCount;
    this.taskQueue = [];
    // this.responses = [];
    setInterval(() => {
      this._doRequest();
    }, 0);
  }

  addTask(task: Function) {
    this.taskQueue.push(task);
  }

  _doRequest() {
    if (!this.taskQueue.length) return;

    const minCount = getMinCount(
      this.maxConcurrencyCount,
      this.taskQueue.length
    );

    for (let i = 0; i < minCount; i++) {
      const task = this.taskQueue.shift();
      this.maxConcurrencyCount--;

      if (!task) break;
      this._runTask(task);
    }
  }

  _runTask(task: Function) {
    task()
      .then((response: any) => {
        // this.responses.push({ result: response, error: null });
      })
      .catch((error: any) => {
        // this.responses.push({ result: null, error: error });
      })
      .finally(() => {
        this.maxConcurrencyCount++;
        this._doRequest();
      });
  }
}
function getMinCount(a: number, b: number) {
  return Math.min(a, b);
}
export default ConcurrencyRequest;
