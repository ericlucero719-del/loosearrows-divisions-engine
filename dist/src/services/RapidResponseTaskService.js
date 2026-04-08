"use strict";
// src/services/RapidResponseTaskService.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.RapidResponseTaskService = void 0;
class RapidResponseTaskService {
    constructor(dispatchEngine) {
        this.dispatchEngine = dispatchEngine;
        this.tasks = [];
    }
    async createTask(taskData) {
        const task = {
            ...taskData,
            id: "task-" + Date.now(),
            createdAt: Date.now(),
        };
        const decision = await this.dispatchEngine.dispatch(task.taskType, {
            contractPriority: task.contractPriority,
            vendorRisk: task.vendorRisk,
            operationalUrgency: task.operationalUrgency,
        });
        if (decision) {
            task.assignedOperatorId = decision.operatorId;
        }
        this.tasks.push(task);
        return task;
    }
    getTasks() {
        return this.tasks;
    }
}
exports.RapidResponseTaskService = RapidResponseTaskService;
//# sourceMappingURL=RapidResponseTaskService.js.map