import { authGuard } from "../auth/auth.middleware";
import express from "express";
import { index, store, destory } from "./updateLog.controller";

const router = express.Router();

/**
 * 网站公告列表
 */
router.get("/updateLog", index);

/**
 * 添加公告
 */
router.post("/updateLog/add", authGuard, store);

/**
 * 删除公告
 */
router.delete("/updateLog/:updateLogId", authGuard, destory);

/**
 * 默认导出路由
 */
export default router;
