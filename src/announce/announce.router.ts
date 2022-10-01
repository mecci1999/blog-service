import { authGuard } from "../auth/auth.middleware";
import express from "express";
import { index, store, destory } from "./announce.controller";

const router = express.Router();

/**
 * 网站公告列表
 */
router.get("/announce", index);

/**
 * 添加公告
 */
router.post("/announce/add", authGuard, store);

/**
 * 删除公告
 */
router.delete("/announce/:announceId", authGuard, destory);

/**
 * 默认导出路由
 */
export default router;
