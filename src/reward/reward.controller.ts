import { collectdata } from "../collectdata/collectdata.middleware";
import { changeTimeFormat } from "../post/post.controller";
import { Request, Response, NextFunction } from "express";
import { create, deleteRewarder, getRewardIndex } from "./reward.service";

/**
 * 获取图片信息列表
 */
export const index = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const data = await getRewardIndex();

    // 对时间做处理
    data.forEach((item: any) => {
      item.date = changeTimeFormat(item.date).split(" ")[0];
    });

    response.send(data);
  } catch (error) {
    next(error);
  }
};

/**
 * 添加捐赠者
 */
export const store = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  // 获得数据
  const { name, amount } = request.body;

  try {
    const data = await create({ name, amount });

    // 埋点
    collectdata({
      action: "createRewarder",
      resourceType: "reward",
      resourceId: data.insertId,
      payloadParam: "body.amount",
    })(request, response, next);

    response.status(201).send(data);
  } catch (error) {
    next(error);
  }
};

/**
 * 删除
 */
export const destory = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  // 获取参数
  const { rewardId } = request.params;

  try {
    // 根据文件Id删除文件
    const data = await deleteRewarder(parseInt(`${rewardId}`, 10));

    response.status(201).send(data);
  } catch (error) {
    next(error);
  }
};
