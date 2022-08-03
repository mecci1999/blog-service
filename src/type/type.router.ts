import express from "express";
import * as typeController from "./type.controller";
import { authGuard } from "../auth/auth.middleware";

const router = express.Router();

/**
 * 创建标签
 */
router.post("/types", authGuard, typeController.store);

/**
 * 删除标签
 */
router.get("/types/:typeId/delete", authGuard, typeController.destory);

/**
 * 获取分类列表
 */
router.get("/types/list", typeController.index);

/**
 * 导出默认路由
 */
export default router;
