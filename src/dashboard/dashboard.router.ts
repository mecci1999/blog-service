import express from "express";
import * as dashBoardController from "./dashboard.controller";
import { authGuard } from "../auth/auth.middleware";
import { accessCountFilter } from "./dashboard.middleware";

/**
 * 定义路由
 */
const router = express.Router();

/**
 * 访问次数列表
 */
router.get(
  "/dashboard/access-counts",
  authGuard,
  accessCountFilter,
  dashBoardController.accessCountIndex
);

/**
 * 网站信息接口
 */
router.get("/dashboard/info", dashBoardController.appInfo);

// /**
//  * 按动作分时段的访问次数
//  */
// router.get(
//   "/dashboard/user/access-counts/:action",
//   authGuard,
//   accessCountFilter,
//   dashBoardController.accessCountShowUser
// );

// /**
//  * 管理员接口新增动作数据
//  */
// router.get(
//   "/dashboard/admin/access-counts",
//   accessCountFilter,
//   dashBoardController.accessCountIndexAdmin
// );

// /**
//  * 管理员获取不同时间段的数据接口
//  */
// router.get(
//   "/dashboard/admin/access-counts/:action",
//   accessCountFilter,
//   dashBoardController.accessCountShow
// );

// /**
//  * 管理员获取不同时间段的总数据接口
//  */
// router.get(
//   "/dashboard/admin/access-counts/sum/:action",
//   accessCountFilter,
//   dashBoardController.getSumDataByDatetime
// );

// /**
//  * 管理员获取新增收益和总收益接口
//  */
// router.get(
//   "/dashboard/admin/income",
//   orderDateFilter,
//   dashBoardController.getOrderData
// );

// /**
//  * 管理员获取不同时间段的新增收益和总收益接口
//  */
// router.get(
//   "/dashboard/admin/income/access-counts",
//   orderDateFilter,
//   dashBoardController.AddIncomeAccessCount
// );

/**
 * 默认导出
 */
export default router;
