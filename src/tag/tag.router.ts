import express from "express";
import * as tagController from "./tag.controller";
import { authGuard } from "../auth/auth.middleware";

const router = express.Router();

/**
 * 创建标签
 */
router.post("/tags", authGuard, tagController.store);

/**
 * 删除标签
 */
router.get("/tags/:tagId/delete", authGuard, tagController.destory);

/**
 * 获取标签列表
 */
router.get("/tags/list", tagController.index);

/**
 * 导出默认路由
 */
export default router;
