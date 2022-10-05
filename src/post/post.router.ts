import express from "express";
import { authGuard } from "../auth/auth.middleware";
import * as postController from "./post.controller";
import {
  validatePostStatus,
  postBgImgInterceptor,
  sort,
  filter,
  paginate,
} from "./post.middleware";
import { POSTS_PRE_PAGE } from "../app/app.config";

const router = express.Router();

/**
 * 创建博客接口
 */
router.post(
  "/posts/create",
  authGuard,
  validatePostStatus,
  postController.store
);

/**
 * 获取博客列表接口
 */
router.get(
  "/posts",
  sort,
  filter,
  paginate(POSTS_PRE_PAGE),
  validatePostStatus,
  postController.index
);

/**
 * 修改博客接口
 */
router.post("/posts/update/:postId", authGuard, postController.updatePost);

/**
 * 获取单个博客接口
 */
router.get("/posts/:postId", postController.show);

/**
 * 上传博客的封面图接口
 */
router.post(
  "/posts/:postId/bgImg",
  authGuard,
  postBgImgInterceptor,
  postController.uploadPostBgImg
);

/**
 * 获取博客封面
 */
router.get("/posts/:postId/bgImg", postController.serve);

/**
 * 添加内容标签
 */
router.post("/posts/:postId/tag", authGuard, postController.storePostTag);

/**
 * 移除内容标签
 */
router.delete(
  "/posts/:postId/tag",
  authGuard,
  // accessControl({ prossession: true }),
  // accessLog({
  //   action: 'deletePostTag',
  //   resourceType: 'post',
  //   resourceParamName: 'postId',
  //   payloadParam: 'body.name',
  // }),
  postController.destroyPostTag
);

/**
 * 添加内容分类
 */
router.post(
  "/posts/:postId/type",
  authGuard,
  // accessControl({ prossession: true }),
  // accessLog({
  //   action: 'createPostTag',
  //   resourceType: 'post',
  //   resourceParamName: 'postId',
  //   payloadParam: 'body.name',
  // }),
  postController.storePostType
);

/**
 * 移除内容分类
 */
router.delete(
  "/posts/:postId/type",
  authGuard,
  // accessControl({ prossession: true }),
  // accessLog({
  //   action: 'deletePostTag',
  //   resourceType: 'post',
  //   resourceParamName: 'postId',
  //   payloadParam: 'body.name',
  // }),
  postController.destroyPostType
);

/**
 * 删除博客
 */
router.delete("/posts/:postId", authGuard, postController.deletePost);

/**
 * 默认导出路由
 */
export default router;
