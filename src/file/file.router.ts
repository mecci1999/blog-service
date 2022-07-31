import express from "express";
import * as fileController from "./file.controller";
import { authGuard } from "../auth/auth.middleware";
import { fileInterceptor, mdFileInterceptor } from "./file.middleware";

const router = express.Router();

/**
 * 上传图片
 */
router.post("/images/upload", authGuard, fileInterceptor, fileController.store);

/**
 * 图片服务
 */
router.get("/images/serve", fileController.serve);

/**
 * 删除图片
 */
router.delete("/images/:fileId", authGuard, fileController.destory);

/**
 * 获取图片列表
 */
router.get("/images", authGuard, fileController.index);

/**
 * 将md文件装换HTML标签接口,该接口用来预览或将md文件转换的html内容存储到数据库中
 */
router.post(
  "/getHtml",
  authGuard,
  mdFileInterceptor,
  fileController.transformHtml
);

/**
 * 默认导出接口
 */
export default router;
