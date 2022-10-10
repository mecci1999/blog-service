import express from "express";
import * as typeController from "./type.controller";
import { authGuard } from "../auth/auth.middleware";

const router = express.Router();

/**
 * 创建分类
 */
router.post("/types", authGuard, typeController.store);

/**
 * 更新分类
 */
router.post("/types/update", authGuard, typeController.update);

/**
 * 删除分类
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
