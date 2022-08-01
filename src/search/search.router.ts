import express from "express";
// import { accessLog } from "../access-log/access-log.middleware";
import * as searchController from "./search.controller";
import { paginate } from "@/post/post.middleware";
import { SEARCH_PRE_PAGE } from "@/app/app.config";

/**
 * 定义路由
 */
const router = express.Router();

/**
 * 搜索标题
 */
router.get("/search", paginate(SEARCH_PRE_PAGE), searchController.index);

/**
 * 默认导出
 */
export default router;
