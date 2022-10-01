import express from "express";
import cors from "cors";
import { ALLOW_ORIGIN } from "./app.config";
import UserRouter from "../user/user.router";
import PostRouter from "../post/post.router";
import authRouter from "../auth/auth.router";
import avatarRouter from "../avatar/avatar.router";
import tagRouter from "../tag/tag.router";
import typeRouter from "../type/type.router";
import fileRouter from "../file/file.router";
import commentRouter from "../comment/comment.router";
import rewardRouter from "../reward/reward.router";
import announceRouter from "../announce/announce.router";
import updateLogRouter from "../updateLog/updateLog.router";
import searchRouter from "../search/search.router";
import dashboardRouter from "../dashboard/dashboard.router";
import { defaultErrorHandler } from "./app.middleware";
import { currentUser } from "../auth/auth.middleware";

/**
 * 创建应用
 */
const app = express();

/**
 * 跨域资源共享
 */
app.use(
  cors({
    origin: ALLOW_ORIGIN,
    exposedHeaders: "X-Total-Count",
  })
);

/**
 * 处理 JSON 文件
 */
app.use(express.json());

/**
 * 当前用户
 */
app.use(currentUser);

/**
 * 应用路由
 */
app.use(
  UserRouter,
  PostRouter,
  authRouter,
  avatarRouter,
  tagRouter,
  typeRouter,
  commentRouter,
  fileRouter,
  rewardRouter,
  announceRouter,
  updateLogRouter,
  searchRouter,
  dashboardRouter
);

/**
 * 默认异常处理器
 */
app.use(defaultErrorHandler);

/**
 * 默认导出
 */
export default app;
