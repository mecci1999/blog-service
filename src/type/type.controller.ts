import { collectdata } from "@/collectdata/collectdata.middleware";
import { Request, Response, NextFunction } from "express";
import * as typeService from "./type.service";

/**
 * 创建标签
 */
export const store = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  //准备数据
  const { name } = request.body;

  try {
    //查找标签
    const type = await typeService.getTypeByName(name);

    // 如果标签存在
    if (type) throw new Error("TYPE_ALREADY_EIXST");

    // 存储标签
    const data = await typeService.createType({ name });

    // 埋点
    collectdata({
      action: "createType",
      resourceType: "type",
      resourceId: data.insertId,
      payloadParam: "body.name",
    })(request, response, next);

    //做出响应
    response.status(201).send(data);
  } catch (error) {
    next(error);
  }
};

/**
 * 删除标签
 */
export const destory = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  //准备数据
  const { typeId } = request.params;

  try {
    // 删除标签
    const data = await typeService.deleteType(parseInt(typeId, 10));

    //做出响应
    response.status(201).send(data);
  } catch (error) {
    next(error);
  }
};

/**
 * 分类 列表
 */
export const index = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    // 删除标签
    const data = await typeService.getTypeList();

    //做出响应
    response.status(201).send(data);
  } catch (error) {
    next(error);
  }
};
