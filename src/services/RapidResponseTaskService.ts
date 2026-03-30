// src/services/RapidResponseTaskService.ts

import { RapidResponseTask } from "../models/RapidResponseTask";
import { RapidResponseDispatchEngine } from "./RapidResponseDispatchEngine";
import { RapidResponseTaskType } from "../models/RapidResponseEvent";

export class RapidResponseTaskService {
  private tasks: RapidResponseTask[] = [];

  constructor(private dispatchEngine: RapidResponseDispatchEngine) {}

  async createTask(taskData: Omit<RapidResponseTask, "id" | "createdAt">) {
    const task: RapidResponseTask = {
      ...taskData,
      id: "task-" + Date.now(),
      createdAt: Date.now(),
    };

    const decision = await this.dispatchEngine.dispatch(task.taskType as RapidResponseTaskType, {
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
