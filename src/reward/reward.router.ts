import { authGuard } from "../auth/auth.middleware";
import express from "express";
import { index, store, destory } from "./reward.controller";

const router = express.Router();

/**
 * 得到捐赠者名单
 */
router.get("/reward", index);

/**
 * 添加捐赠者
 */
router.post("/reward/add", authGuard, store);

/**
 * 删除捐赠者
 */
router.delete("/reward/:rewardId", authGuard, destory);

/**
 * 默认导出路由
 */
export default router;
