import { authGuard } from "../auth/auth.middleware";
import express from "express";
import { index, store, destory } from "./updateLog.controller";

const router = express.Router();

/**
 * 网站更新日志列表
 */
router.get("/updateLog", index);

/**
 * 添加更新日志
 */
router.post("/updateLog/add", authGuard, store);

/**
 * 删除更新日志
 */
router.delete("/updateLog/:updateLogId", authGuard, destory);

/**
 * 默认导出路由
 */
export default router;
