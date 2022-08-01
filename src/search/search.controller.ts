import { collectdata } from "@/collectdata/collectdata.middleware";
import { Request, Response, NextFunction } from "express";
import { searchPosts } from "./search.service";

/**
 * 搜素
 */
export const index = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    // 准备数据
    const { name } = request.query;
    const postTitle = `${name}`;

    // 查询标签
    const posts = await searchPosts({
      postTitle,
      pagination: request.pagination,
    });

    // 埋点
    collectdata({
      action: "useSearch",
      payloadParam: "query.name",
    });

    // 做出响应
    response.send(posts);
  } catch (error) {
    next(error);
  }
};
