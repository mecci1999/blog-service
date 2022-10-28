import path from "path";
import fs from "fs";
import Jimp from "jimp";
import { connection } from "../app/database/mysql";
import { FileModel } from "./file.model";
import { TokenPayload } from "../auth/auth.interface";
// import { getPostById, PostStatus } from '../post/post.service';

/**
 * 存储文件信息
 */
export const uploadImage = async (file: FileModel) => {
  // 准备查询
  const statement = `
    INSERT INTO file
    SET ?
  `;

  // 执行查询
  const [data] = await connection.promise().query(statement, file);

  // 提供数据
  return data;
};

/**
 * 按ID查找文件
 */
export const findFileById = async (fileId: number) => {
  // 准备查询
  const statement = `
    SELECT * FROM file
    WHERE id = ?
  `;

  // 执行查询
  const [...data] = (await connection
    .promise()
    .query(statement, fileId)) as any;

  // 提供数据
  return data[0][0];
};

/**
 * 调整图像尺寸的功能
 */
export const ImageResizer = async (image: Jimp, file: Express.Multer.File) => {
  // 图像尺寸
  const { imageSize } = {
    imageSize: {
      height: image.bitmap.height,
      width: image.bitmap.width,
    },
  };

  // 图像文件路径
  const filePath = path.join(file.destination, "resized", file.filename);

  //大尺寸
  if (imageSize.width > 1280) {
    image.resize(1280, Jimp.AUTO).quality(85).write(`${filePath}-large`);
  }

  //中等尺寸
  if (imageSize.width > 640) {
    image.resize(640, Jimp.AUTO).quality(85).write(`${filePath}-medium`);
  }

  //缩略图尺寸
  if (imageSize.width > 320) {
    image.resize(320, Jimp.AUTO).quality(85).write(`${filePath}-thumbnail`);
  }
};

/**
 * 找出内容相关文件
 */
export const deleteFileById = async (id: number) => {
  // 准备查询
  const statement = `
    DELETE FROM file WHERE file.id = ?
  `;

  // 执行查询
  const [data] = await connection.promise().query(statement, id);

  // 提供数据
  return data as any;
};

/**
 * 根据文件Id获取文件信息
 */
export const getFileById = async (id: number) => {
  // 准备查询
  const statement = `
    SELECT
      *
    FROM
      file
    WHERE
      file.id = ?
  `;

  // 执行查询
  const [...data] = (await connection.promise().query(statement, id)) as any;

  // 提供数据
  return data[0][0] as any;
};

/**
 * 根据文件名获取文件信息
 */
export const getFileByName = async (name: string) => {
  // 准备查询
  const statement = `
    SELECT
      *
    FROM
      file
    WHERE
      file.originalname = ?
    ORDER BY file.id DESC
    LIMIT 1
  `;

  // 执行查询
  const [...data] = (await connection.promise().query(statement, name)) as any;

  // 提供数据
  return data[0][0] as any;
};

/**
 * 删除内容文件
 */
export const deletePostFiles = async (files: Array<FileModel>) => {
  const uploads = "uploads";

  files.map((file) => {
    const filePath = path.join(uploads, `${file.filename}`);

    fs.stat(filePath, (error, stats) => {
      if (stats) {
        fs.unlink(filePath, (error) => {
          if (error) throw error;
        });
      }
    });
  });
};

/**
 * 获取图片列表
 */
export const getImageIndex = async () => {
  // 准备查询
  const statement = `
    SELECT
      file.id,
      file.originalname,
      file.mimetype,
      file.size,
      file.created,
      file.updated,
      JSON_OBJECT(
        'id',post.id,
        'title',post.title
      ) AS post
    FROM 
      file
    LEFT JOIN post
      ON post.id = file.postId
  `;

  // 执行查询
  const [...index] = await connection.promise().query(statement);

  // 提供数据
  return index[0] as any;
};

/**
 * 检查文件权限
 */
// interface FileAccessControlOptions {
//   file: FileModel;
//   currentUser: TokenPayload;
// }

// export const fillAccessControl = async (options: FileAccessControlOptions) => {
//   // 解构数据
//   const { file, currentUser } = options;

//   // 调取文件所属内容的审核日志
//   const [parentPostAuditLog] = await getAuditLogByResource({
//     resourceId: file.postId,
//     resourceType: 'post',
//   });

//   // 准备数据
//   const ownFile = file.userId === currentUser.id;
//   const isAdmin = currentUser.id === 1;
//   const parentPost = await getPostById(file.postId, { currentUser });
//   const isPublished = parentPost.status === PostStatus.published;
//   const isApproved =
//     parentPostAuditLog && parentPostAuditLog.status === AuditLogStatus.approved;
//   const canAccess = isAdmin || ownFile || (isPublished && isApproved);

//   // 进行判断
//   if (!canAccess) {
//     throw new Error('FORBIDDEN');
//   }
// };
