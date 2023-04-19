import express from "express";
import * as authController from "./auth.controller";
import * as authMidderware from "./auth.middleware";

const router = express.Router();

/**
 * 用户登录
 */
router.post("/login", authMidderware.validataLoginData, authController.login);

/**
 * 获取用户ip地址
 */
router.get("/ipaddress", authMidderware.getIpAddress);

/**
 * 默认导出路由
 */
export default router;
