import { collectdata } from "../collectdata/collectdata.middleware";
import { changeTimeFormat } from "../post/post.controller";
import { Request, Response, NextFunction } from "express";
import { socketIoServer } from "../app/app.server";
import {
  createComment,
  deleteComment,
  getCommentById,
  getCommentReplies,
  getComments,
  getCommentsTotalCount,
  isReplyComment,
  updateComment,
} from "./comment.service";

/**
 * 发表评论
 */
export const store = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  // 准备数据
  const {
    content,
    postId,
    avatarImgUrl,
    name,
    eMail,
    os,
    browser,
    status,
    province,
    city,
  } = request.body;

  let userId = null;

  // 博主评论
  if (request.user.id) {
    userId = 1;
  }

  const socketId = request.header("X-Socket-Id");

  const comment = {
    content,
    postId,
    avatarImgUrl,
    name,
    eMail,
    os,
    browser,
    province,
    status,
    city,
    userId,
  };

  try {
    // 保存评论
    const data = await createComment(comment);

    // 调取新创建评论
    const createdComment = await getCommentById(data.insertId);

    // 触发事件
    socketIoServer.emit("commentCreated", {
      comment: createdComment,
      socketId,
    });

    // 埋点
    collectdata({
      action: "createComment",
      resourceType: "comment",
      resourceId: data.insertId,
      payloadParam: "body.content",
    })(request, response, next);

    // 做出响应
    response.status(201).send(data);
  } catch (error) {
    next(error);
  }
};

/**
 * 回复评论
 */
export const reply = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  // 准备数据
  const { commentId } = request.params;
  const parentId = parseInt(commentId, 10);
  const {
    content,
    postId,
    avatarImgUrl,
    name,
    eMail,
    os,
    browser,
    province,
    status,
    city,
  } = request.body;

  let userId = null;

  // 博主评论
  if (request.user.id) {
    userId = 1;
  }

  const socketId = request.header("X-Socket-Id");

  const comment = {
    content,
    postId,
    parentId,
    avatarImgUrl,
    name,
    eMail,
    os,
    browser,
    province,
    status,
    city,
    userId,
  };

  //判断是否审核通过
  try {
    const reply = await getCommentById(parentId);

    if (reply?.status !== "approved")
      return next(new Error("UNABLE_TO_REPLY_THIS_COMMENT"));
  } catch (error) {
    return next(error);
  }

  //保存回复评论
  try {
    const data = await createComment(comment);

    // 回复数据
    const reply = await getCommentById(data.insertId, {
      resourceType: "reply",
    });

    // 触发事件
    socketIoServer.emit("commentReplyCreated", {
      reply,
      socketId,
    });

    // 埋点
    collectdata({
      action: "createReplyComment",
      resourceType: "comment",
      resourceId: data.insertId,
      payloadParam: "body.content",
    })(request, response, next);

    // 做出响应
    response.status(201).send(data);
  } catch (error) {
    next(error);
  }
};

/**
 * 修改评论
 */
export const update = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  //准备数据
  const { commentId } = request.params;
  const { status } = request.body;
  const socketId = request.header("X-Socket-Id");

  const comment = {
    id: parseInt(commentId, 10),
    status,
  };

  //修改评论
  try {
    const data = await updateComment(comment);

    // 准备资源
    const isReply = await isReplyComment(parseInt(commentId, 10));
    const resourceType = isReply ? "reply" : "comment";
    const resource = await getCommentById(parseInt(commentId, 10), {
      resourceType,
    });

    // 触发事件
    const eventName = isReply ? "commentReplyUpdated" : "commentUpdated";

    socketIoServer.emit(eventName, {
      [resourceType]: resource,
      socketId,
    });

    // 埋点
    collectdata({
      action: "updateCommentStatus",
      resourceType: "comment",
      resourceId: parseInt(commentId, 10),
      payloadParam: "body.status",
    })(request, response, next);

    //做出响应
    response.send(data);
  } catch (error) {
    next(error);
  }
};

/**
 * 删除评论
 */
export const destroy = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  //准备数据
  const { commentId } = request.params;
  const socketId = request.header("X-Socket-Id");

  //执行删除
  try {
    // 准备资源
    const isReply = await isReplyComment(parseInt(commentId, 10));
    const resourceType = isReply ? "reply" : "comment";
    const resource = await getCommentById(parseInt(commentId, 10), {
      resourceType,
    });

    const data = await deleteComment(parseInt(commentId, 10));

    // 触发事件
    const eventName = isReply ? "commentReplyDeleted" : "commentDeleted";

    socketIoServer.emit(eventName, {
      [resourceType]: resource,
      socketId,
    });

    //做出响应
    response.send(data);
  } catch (error) {
    next(error);
  }
};

/**
 * 获取评论列表
 */
export const index = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  // 统计评论数量
  try {
    const totalCount = await getCommentsTotalCount({ filter: request.filter });

    // 做出响应
    response.header("X-Total-Count", totalCount);
  } catch (error) {
    next(error);
  }

  try {
    // 获得评论列表
    const comment = await getComments({
      filter: request.filter,
      pagination: request.pagination,
    });

    comment.forEach((item: any) => {
      item.created = changeTimeFormat(item.created);
      item.updated = changeTimeFormat(item.updated);
      if (item.replyCommentList !== null) {
        let replyCount = item.replyCommentList.reduce(
          (total: number, item: any) => {
            total = total + item.totalReplies;
            return total;
          },
          0
        );
        item.totalReplies = item.totalReplies + replyCount;
      }
    });

    // 做出响应
    response.send(comment);
  } catch (error) {
    next(error);
  }
};

/**
 * 回复评论列表
 */
export const indexReplied = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  // 准备数据
  const { commentId } = request.params;

  try {
    const replies = await getCommentReplies({
      commentId: parseInt(commentId, 10),
    });

    replies.forEach((item: any) => {
      item.created = changeTimeFormat(item.created);
      item.updated = changeTimeFormat(item.updated);
    });

    // 作出响应
    response.send(replies);
  } catch (error) {
    next(error);
  }
};
