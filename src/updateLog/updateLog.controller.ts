import { collectdata } from "@/collectdata/collectdata.middleware";
import { changeTimeFormat } from "@/post/post.controller";
import { Request, Response, NextFunction } from "express";
import {
  createUpdateLog,
  deleteUpdateLog,
  getUpdateLogIndex,
} from "./updateLog.service";

/**
 * 获取公告列表
 */
export const index = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const data = await getUpdateLogIndex();

    // 对时间做处理
    data.forEach((item: any) => {
      item.date = changeTimeFormat(item.date)
        .split(" ")[0]
        .replaceAll("-", "/");
    });

    response.send(data);
  } catch (error) {
    next(error);
  }
};

/**
 * 添加公告
 */
export const store = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  // 获得数据
  const { content } = request.body;

  try {
    const data = await createUpdateLog({ content });

    // 埋点
    collectdata({
      action: "createUpdateLog",
      resourceType: "updatelog",
      resourceId: data.insertId,
      payloadParam: "body.content",
    })(request, response, next);

    response.status(201).send(data);
  } catch (error) {
    next(error);
  }
};

/**
 * 删除公告
 */
export const destory = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  // 获取参数
  const { updateLogId } = request.params;

  try {
    // 根据文件Id删除公告
    const data = await deleteUpdateLog(parseInt(`${updateLogId}`, 10));

    response.status(201).send(data);
  } catch (error) {
    next(error);
  }
};
