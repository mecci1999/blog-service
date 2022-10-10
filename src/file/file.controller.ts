import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import _ from "lodash";
import {
  deleteFileById,
  deletePostFiles,
  getFileById,
  getFileByName,
  getImageIndex,
  uploadImage,
} from "./file.service";
import { changeTimeFormat } from "../post/post.controller";
import { marked } from "marked";
import Hljs from "highlight.js";
import { collectdata } from "../collectdata/collectdata.middleware";

/**
 * 上传图片文件
 */
export const store = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const { post } = request.query;

  const postId = parseInt(`${post}`, 10);

  // 头像文件信息
  const fileInfo = _.pick(request.file, [
    "originalname",
    "mimetype",
    "filename",
    "size",
  ]);

  try {
    //保存数据
    const data = await uploadImage({
      ...fileInfo,
      postId,
    });

    // 埋点
    collectdata({
      action: "uploadImageFile",
      resourceType: "image",
      resourceId: postId,
    })(request, response, next);

    //做出响应
    response.status(201).send(data);
  } catch (error) {
    next(error);
  }
};

/**
 * 文件服务
 */
export const serve = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  // 用户 ID
  const { name } = request.query;

  try {
    // 根据文件名获取文件信息
    const file = await getFileByName(`${name}`);

    //文件名和目录
    let root = path.join("uploads", "image");

    // 检查文件是否存在
    const fileExist = fs.existsSync(path.join(root, `${file.filename}`));

    if (!fileExist) throw new Error("FILE_NOT_FOUND");

    //做出响应
    response.sendFile(`${file.filename}`, {
      root,
      headers: {
        "Content-Type": file.mimetype,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const destory = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  // 获取参数
  const { fileId } = request.params;

  try {
    // 根据文件Id删除文件
    const file = await getFileById(parseInt(`${fileId}`, 10));

    // 删除相关文件
    await deletePostFiles([file]);

    // 删除数据
    const data = await deleteFileById(parseInt(`${fileId}`, 10));

    // 埋点
    collectdata({
      action: "deleteImageFile",
      resourceType: "image",
      resourceId: parseInt(`${fileId}`, 10),
    })(request, response, next);

    response.send(data);
  } catch (error) {
    next(error);
  }
};

/**
 * 获取图片信息列表
 */
export const index = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const data = await getImageIndex();

    // 对时间做处理
    data.forEach((item: any) => {
      item.created = changeTimeFormat(item.created);
      item.updated = changeTimeFormat(item.updated);
      item.size = (item.size / 1024 / 1024).toFixed(2) + "MB";
    });

    response.send(data);
  } catch (error) {
    next(error);
  }
};

export const transformHtml = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  // 文件信息
  const fileInfo = _.pick(request.file, [
    "originalname",
    "mimetype",
    "filename",
    "size",
  ]);

  //文件名和目录
  let filePath = path.join("uploads", "markdown", `${fileInfo.filename}`);

  // 读取文件
  try {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        throw new Error("FILE_NOT_FOUND");
      } else {
        // 使用marked转换成html
        marked.setOptions({
          renderer: new marked.Renderer(),
          pedantic: false,
          gfm: true,
          breaks: false,
          sanitize: false,
          smartLists: true,
          smartypants: false,
          xhtml: false,
          highlight: function (code) {
            return Hljs.highlightAuto(code).value;
          },
        });
        const str = marked(data.toString());
        response.send({ content: str.replaceAll("\n", "<br />") });
      }
    });
  } catch (error) {
    next(error);
  }
};
