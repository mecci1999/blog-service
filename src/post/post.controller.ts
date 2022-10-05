import { Request, Response, NextFunction } from "express";
import { PostModel, PostStatus } from "./post.model";
import {
  createPost,
  createPostBgImg,
  creatPostTag,
  creatPostType,
  deletePostTag,
  deletePostType,
  destory,
  findBgImgByPostId,
  getOnlyOnePost,
  getPostList,
  getPostsTotalCount,
  postHasTag,
  postHasType,
  update,
} from "./post.service";
import fs from "fs";
import _ from "lodash";
import { APP_PORT } from "../app/app.config";
import path from "path";
import { createTag, getTagByName } from "../tag/tag.service";
import { TagModel } from "../tag/tag.model";
import { TypeModel } from "../type/type.model";
import { createType, getTypeByName } from "../type/type.service";
import { collectdata } from "../collectdata/collectdata.middleware";
import { getPostAccessAmount } from "../collectdata/collectdata.service";
import { getPostCommentAmount } from "../comment/comment.service";

/**
 * 创建博客
 */
export const store = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  // 准备数据
  const {
    title,
    content,
    status = PostStatus.draft,
    description,
    wordAmount,
    readTime,
  } = request.body;
  const { id: userId } = request.user;

  const post: PostModel = {
    title,
    content,
    status,
    description,
    wordAmount,
    readTime,
    userId,
  };

  // 创建内容
  try {
    const data = (await createPost(post)) as any;

    const postId = parseInt(`${data.insertId}`, 10);

    // 埋点
    collectdata({
      action: "createPost",
      resourceType: "post",
      resourceId: postId,
      payloadParam: "body.title",
    })(request, response, next);

    // 做出响应
    response.send(data);
  } catch (error) {
    next(error);
  }
};

/**
 * 博客列表接口
 */
export const index = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  // 解构查询符
  const { status = "published" } = request.query;
  const postStatus = `${status}` as unknown as PostStatus;
  // const auditLogStatus = (`${auditStatus}` as unknown) as AuditLogStatus;

  //获得内容数量
  try {
    const totalCount = await getPostsTotalCount({
      filter: request.filter,
      postStatus,
    });

    //响应头部数据
    response.header("X-Total-Count", totalCount);
  } catch (error) {
    next(error);
  }

  try {
    // 调用获取列表方法
    const data = await getPostList({
      sort: request.sort,
      filter: request.filter,
      pagination: request.pagination,
      currentUser: request.user,
      postStatus,
    });

    data.forEach((item: any) => {
      item.created = changeTimeFormat(item.created);
      item.updated = changeTimeFormat(item.updated);
      item.bgImgUrl = `localhost:${APP_PORT}/posts/${item.id}/bgImg`;
    });

    // 埋点
    collectdata({
      action: "getPosts",
      resourceType: "post",
    })(request, response, next);

    // 做出响应
    response.send(data);
  } catch (error) {
    next(error);
  }
};

/**
 * 根据ID获取单个博客
 */
export const show = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  // 准备数据
  const { postId } = request.params;

  try {
    const data = (await getOnlyOnePost(parseInt(postId, 10))) as any;

    // 获取单篇博客的访问次数
    const accessAmount = await getPostAccessAmount(parseInt(postId, 10));

    // 获取博客的评论数量
    const commentAmount = await getPostCommentAmount(parseInt(postId, 10));

    // 对时间做处理
    const [{ created, updated }] = data;

    data[0].created = changeTimeFormat(created);
    data[0].updated = changeTimeFormat(updated);

    data[0].bgImgUrl = `localhost:${APP_PORT}/posts/${postId}/bgImg`;

    data[0].accessAmount = accessAmount.count;

    data[0].commentAmount = commentAmount.count;

    // 埋点
    collectdata({
      action: "getPostById",
      resourceType: "post",
      resourceId: parseInt(postId, 10),
    })(request, response, next);

    // 做出响应
    response.send(data[0]);
  } catch (error) {
    next(error);
  }
};

/**
 * 改变时间格式
 */
export const changeTimeFormat = (date: string) => {
  let time = new Date(date).toJSON();
  return new Date(+new Date(time) + 8 * 3600 * 1000)
    .toISOString()
    .replace(/T/g, " ")
    .replace(/\.[\d]{3}Z/, "");
};

/**
 * 上传博客封面
 */
export const uploadPostBgImg = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  // 当前用户 ID
  const { postId } = request.params;
  const id = parseInt(postId, 10);

  // 头像文件信息
  const fileInfo = _.pick(request.file, ["mimetype", "filename", "size"]);

  //准备头像数据
  const postBgImg = {
    ...fileInfo,
    postId: id,
  };

  try {
    //保存数据
    const data = await createPostBgImg(postBgImg);

    // 埋点
    collectdata({
      action: "uploadPostImg",
      resourceType: "image",
      resourceId: parseInt(postId, 10),
    })(request, response, next);

    //做出响应
    response.status(201).send(data);
  } catch (error) {
    next(error);
  }
};

/**
 * 获取博客封面接口
 */
export const serve = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  // 用户 ID
  const { postId } = request.params;

  try {
    //获取博客封面数据
    const image = await findBgImgByPostId(parseInt(postId, 10));

    if (!image) {
      throw new Error("FILE_NOT_FOUND");
    }

    //文件名和目录
    let filename = image.filename;
    let root = path.join("uploads", "postBgImg");

    // 检查文件是否存在
    const fileExist = fs.existsSync(path.join(root, `${filename}`));

    if (!fileExist) throw new Error("FILE_NOT_FOUND");

    if (fileExist) {
      filename = `${filename}`;
    }

    //做出响应
    response.sendFile(filename, {
      root,
      headers: {
        "Content-Type": image.mimetype,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 添加内容标签
 */
export const storePostTag = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  // 准备数据
  const { postId } = request.params;
  const { name } = request.body;

  let tag: TagModel;

  //判断数据仓库中有没有当前这个标签
  try {
    tag = await getTagByName(name);
  } catch (error) {
    return next(error);
  }

  //找到标签
  if (tag) {
    //验证内容标签
    try {
      const postTag = await postHasTag(parseInt(postId, 10), tag.id);
      if (postTag) return next(new Error("POST_ALREADY_HAS_THIS_TAG"));
    } catch (error) {
      return next(error);
    }
  }

  // 没有找到标签
  if (!tag) {
    try {
      const data = await createTag({ name });
      tag = { id: data.insertId };
    } catch (error) {
      return next(error);
    }
  }

  //给内容贴上标签
  try {
    await creatPostTag(parseInt(postId, 10), tag.id);

    // 埋点
    collectdata({
      action: "createPostTag",
      resourceType: "post",
      payloadParam: "body.name",
      resourceId: parseInt(postId, 10),
    })(request, response, next);

    //做出响应
    response.sendStatus(201);
  } catch (error) {
    return next(error);
  }
};

/**
 * 删除内容标签
 */
export const destroyPostTag = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  // 准备数据
  const { postId } = request.params;
  const { tagId } = request.body;

  // 移除内容标签
  try {
    await deletePostTag(parseInt(postId, 10), tagId);

    // 埋点
    collectdata({
      action: "deletePostTag",
      resourceType: "post",
      resourceId: parseInt(postId, 10),
    })(request, response, next);

    response.sendStatus(200);
  } catch (error) {
    next(error);
  }
};

/**
 * 添加内容分类
 */
export const storePostType = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  // 准备数据
  const { postId } = request.params;
  const { name } = request.body;

  let type: TypeModel;

  //判断数据仓库中有没有当前这个标签
  try {
    type = await getTypeByName(name);
  } catch (error) {
    return next(error);
  }

  //找到标签
  if (type) {
    //验证内容标签
    try {
      const postType = await postHasType(parseInt(postId, 10), type.id);
      if (postType) return next(new Error("POST_ALREADY_HAS_THIS_TYPE"));
    } catch (error) {
      return next(error);
    }
  }

  // 没有找到标签
  if (!type) {
    try {
      const data = await createType({ name });
      type = { id: data.insertId };
    } catch (error) {
      return next(error);
    }
  }

  //给内容贴上标签
  try {
    await creatPostType(parseInt(postId, 10), type.id);

    // 埋点
    collectdata({
      action: "createPostType",
      resourceType: "post",
      payloadParam: "body.name",
      resourceId: parseInt(postId, 10),
    })(request, response, next);

    //做出响应
    response.sendStatus(201);
  } catch (error) {
    return next(error);
  }
};

/**
 * 删除内容分类
 */
export const destroyPostType = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  // 准备数据
  const { postId } = request.params;
  const { typeId } = request.body;

  // 移除内容标签
  try {
    await deletePostType(parseInt(postId, 10), typeId);

    // 埋点
    collectdata({
      action: "deletePostType",
      resourceType: "post",
      resourceId: parseInt(postId, 10),
    })(request, response, next);

    response.sendStatus(200);
  } catch (error) {
    next(error);
  }
};

/**
 * 修改博客
 */
export const updatePost = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  // 准备数据
  const { postId } = request.params;
  const post = _.pick(request.body, [
    "title",
    "description",
    "status",
    "wordAmount",
    "readTime",
    "content",
  ]);

  try {
    const data = await update(parseInt(postId, 10), post);

    response.sendStatus(200).send(data);
  } catch (error) {
    next(error);
  }
};

/**
 * 删除博客
 */
export const deletePost = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  // 准备数据
  const { postId } = request.params;

  try {
    const data = await destory(parseInt(postId, 10));

    response.sendStatus(200).send(data);
  } catch (error) {
    next(error);
  }
};
