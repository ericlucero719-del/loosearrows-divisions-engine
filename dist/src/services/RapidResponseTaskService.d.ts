import { RapidResponseTask } from "../models/RapidResponseTask";
import { RapidResponseDispatchEngine } from "./RapidResponseDispatchEngine";
export declare class RapidResponseTaskService {
    private dispatchEngine;
    private tasks;
    constructor(dispatchEngine: RapidResponseDispatchEngine);
    createTask(taskData: Omit<RapidResponseTask, "id" | "createdAt">): Promise<RapidResponseTask>;
    getTasks(): RapidResponseTask[];
}
//# sourceMappingURL=RapidResponseTaskService.d.ts.map