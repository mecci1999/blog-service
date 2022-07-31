import { Request, Response, NextFunction } from "express";
import multer, { FileFilterCallback } from "multer";

/**
 * 文件过滤器
 */
export const fileFilter = (fileTypes: Array<string>) => {
  return (
    request: Request,
    file: Express.Multer.File,
    callback: FileFilterCallback
  ) => {
    //判断上传文件类型
    const allowed = fileTypes.some((type) => type === file.mimetype);

    if (allowed) {
      //允许上传
      callback(null, true);
    } else {
      //拒绝上传
      callback(new Error("FILE_TYPE_NOT_ACCEPT"));
    }
  };
};

const fileUploadFilter = fileFilter([
  "image/png",
  "image/jpg",
  "image/jpeg",
  "text/markdown",
]);

/**
 * 创建一个Multer
 */
const fileUpload = multer({
  dest: "uploads/image",
  fileFilter: fileUploadFilter,
});

/**
 * 文件拦截器
 */
export const fileInterceptor = fileUpload.single("image");

/**
 * md文件的Multer
 */
const mdFileUpload = multer({
  dest: "uploads/markdown",
  // fileFilter: fileUploadFilter,
});

/**
 * md文件拦截器
 */
export const mdFileInterceptor = mdFileUpload.single("markdown");
