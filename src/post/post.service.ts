import { TokenPayload } from "@/auth/auth.interface";
import { connection } from "../app/database/mysql";
import { PostBgImgModel, PostModel, PostStatus } from "./post.model";

export interface GetPostsOptionsFilter {
  name: string;
  sql?: string | null;
  param?: string | Array<string | number> | null;
  params?: Array<string>;
}

export interface GetPostsOptionsPagination {
  limit: number;
  offset: number;
}

export interface GetPostsOptions {
  sort?: string;
  filter?: GetPostsOptionsFilter;
  pagination?: GetPostsOptionsPagination;
  currentUser?: TokenPayload;
  postStatus?: PostStatus;
  // auditLogStatus?: AuditLogStatus;
}

/**
 * 创建博客
 */
export const createPost = async (post: PostModel) => {
  //准备查询
  const statement = `
    INSERT INTO post
    SET ?
  `;

  //执行查询
  const [...data] = await connection.promise().query(statement, post);

  //提供数据
  return data[0];
};

/**
 * 获取博客列表
 */
export const getPostList = async (options: GetPostsOptions) => {
  // 解构数据
  const {
    sort,
    filter,
    pagination,
    currentUser,
    postStatus: status,
    // auditLogStatus: auditStatus,
  } = options;

  // SQL 参数
  let params: Array<any> = [pagination?.limit, pagination?.offset];

  // 设置 SQL 参数
  if (filter?.param) {
    params = [filter?.param, ...params];
  }

  if (filter?.params) {
    params = [...filter?.params, ...params];
  }

  // if (currentUser) {
  //   // 当前用户
  //   var { id: userId, name: userName } = currentUser;
  // }

  // 发布状态
  const whereStatus = status
    ? `post.status = '${status}'`
    : "post.status IS NOT NULL";

  // // 审核状态
  // const whereAuditStatus = auditStatus
  //   ? `AND audit.status = '${auditStatus}'`
  //   : "";

  //准备查询
  const statement = `
    SELECT
      post.id,
      post.title,
      post.description,
      post.content,
      post.status,
      post.wordAmount,
      post.readTime,
      JSON_OBJECT(
        'id',user.id,
        'name',user.name
      ) AS user,
      post.created,
      post.updated,
      postbgimage.filename AS filename,
      CAST(
        IF(
          COUNT(type.id),
          CONCAT(
            '[',
              GROUP_CONCAT(
                DISTINCT JSON_OBJECT(
                  'id',type.id,
                  'name',type.name
                )
              ),
            ']'
          ),
          NULL
        ) AS JSON
      ) AS types,
      CAST(
        IF(
          COUNT(tag.id),
          CONCAT(
            '[',
              GROUP_CONCAT(
                DISTINCT JSON_OBJECT(
                  'id',tag.id,
                  'name',tag.name
                )
              ),
            ']'
          ),
          NULL
        ) AS JSON
      ) AS tags
    FROM
      post
    LEFT JOIN user
    ON user.id = post.userId
    LEFT JOIN postbgimage
      ON post.id = postbgimage.postId
    LEFT JOIN post_tag
      ON post.id = post_tag.postId
    LEFT JOIN
      tag ON post_tag.tagId = tag.id
    LEFT JOIN post_type
      ON post.id = post_type.postId
    LEFT JOIN
      type ON post_type.typeId = type.id
    WHERE ${filter?.sql}  AND ${whereStatus}
    GROUP BY post.id 
    ORDER BY ${sort}
    LIMIT ?
    OFFSET ?
  `;

  // 执行查询
  const [data] = await connection.promise().query(statement, params);

  // 提供数据
  return data as any;
};

/**
 * 单个博客的内容
 */
export const getOnlyOnePost = async (postId: number) => {
  // 准备查询
  const statement = `
    SELECT
      post.id,
      post.title,
      post.description,
      post.content,
      post.status,
      post.wordAmount,
      post.readTime,
      JSON_OBJECT(
        'id',user.id,
        'name',user.name
      ) AS user,
      post.created,
      post.updated,
      postbgimage.filename AS filename,
      CAST(
        IF(
          COUNT(type.id),
          CONCAT(
            '[',
              GROUP_CONCAT(
                DISTINCT JSON_OBJECT(
                  'id',type.id,
                  'name',type.name
                )
              ),
            ']'
          ),
          NULL
        ) AS JSON
      ) AS types,
      CAST(
        IF(
          COUNT(tag.id),
          CONCAT(
            '[',
              GROUP_CONCAT(
                DISTINCT JSON_OBJECT(
                  'id',tag.id,
                  'name',tag.name
                )
              ),
            ']'
          ),
          NULL
        ) AS JSON
      ) AS tags
    FROM
      post
    LEFT JOIN user
      ON user.id = post.userId
    LEFT JOIN postbgimage
      ON post.id = postbgimage.postId
    LEFT JOIN post_tag
      ON post.id = post_tag.postId
    LEFT JOIN
      tag ON post_tag.tagId = tag.id
    LEFT JOIN post_type
      ON post.id = post_type.postId
    LEFT JOIN
      type ON post_type.typeId = type.id
    WHERE
      post.id = ?
  `;

  // 执行查询
  const [...data] = await connection.promise().query(statement, postId);

  // 提供数据
  return data[0];
};

/**
 * 上传博客封面方法
 */
export const createPostBgImg = async (image: PostBgImgModel) => {
  // 准备查询
  const statement = `
    INSERT INTO postbgimage
    SET ?
  `;

  // 执行查询
  const [data] = await connection.promise().query(statement, image);

  // 提供数据
  return data;
};

/**
 * 根据 postId 获取封面
 */
export const findBgImgByPostId = async (postId: number) => {
  // 准备查询
  const statement = `
    SELECT *
    FROM postbgimage
    WHERE postId = ?
    ORDER BY postbgimage.id DESC
    LIMIT 1
  `;

  // 执行查询
  const [...data] = await connection.promise().query(statement, postId);

  // 返回数据
  return data[0][0];
};

/**
 * 检查内容标签
 */
export const postHasTag = async (postId: number, tagId?: number) => {
  // 准备查询
  const statement = `
    SELECT * FROM post_tag
    WHERE postId=? AND tagId=?
  `;

  // 执行查询
  const [...data] = await connection
    .promise()
    .query(statement, [postId, tagId]);

  // 提供数据
  return data[0][0] ? true : false;
};

/**
 * 保存内容标签
 */
export const creatPostTag = async (postId: number, tagId?: number) => {
  // 准备查询
  const statement = `
    INSERT INTO post_tag (postId, tagId)
    VALUES(?, ?)
  `;

  // 执行查询
  const [data] = await connection.promise().query(statement, [postId, tagId]);

  // 提供数据
  return data;
};

/**
 * 删除内容标签
 */
export const deletePostTag = async (postId: number, tagId?: number) => {
  //准备查询
  const statement = `
    DELETE FROM post_tag
    WHERE postId=? AND tagId=?
  `;

  // 执行查询
  const [data] = await connection.promise().query(statement, [postId, tagId]);

  // 提供数据
  return data;
};

/**
 * 检查内容分类
 */
export const postHasType = async (postId: number, typeId?: number) => {
  // 准备查询
  const statement = `
    SELECT * FROM post_type
    WHERE postId=? AND typeId=?
  `;

  // 执行查询
  const [...data] = await connection
    .promise()
    .query(statement, [postId, typeId]);

  // 提供数据
  return data[0][0] ? true : false;
};

/**
 * 保存内容分类
 */
export const creatPostType = async (postId: number, typeId?: number) => {
  // 准备查询
  const statement = `
    INSERT INTO post_type (postId, typeId)
    VALUES(?, ?)
  `;

  // 执行查询
  const [data] = await connection.promise().query(statement, [postId, typeId]);

  // 提供数据
  return data;
};

/**
 * 删除内容分类
 */
export const deletePostType = async (postId: number, typeId?: number) => {
  //准备查询
  const statement = `
    DELETE FROM post_type
    WHERE postId=? AND typeId=?
  `;

  // 执行查询
  const [data] = await connection.promise().query(statement, [postId, typeId]);

  // 提供数据
  return data;
};

/**
 * 统计内容数量
 */
export const getPostsTotalCount = async (options: GetPostsOptions) => {
  // 准备数据
  const { filter, postStatus: status } = options;

  // SQL 参数
  let params = [filter?.param];

  if (filter?.params) {
    params = [...filter?.params, ...params];
  }

  // 发布状态
  const whereStatus = status
    ? `post.status = '${status}'`
    : `post.status IS NOT NULL`;

  // 审核状态
  // const whereAuditStatus = auditStatus
  //   ? `AND audit.status = '${auditStatus}'`
  //   : "";

  // 准备查询
  const statement = `
    SELECT
      COUNT(DISTINCT post.id) AS total
    FROM post
    LEFT JOIN user
      ON user.id = post.userId
    LEFT JOIN postbgimage
      ON post.id = postbgimage.postId
    LEFT JOIN post_tag
      ON post.id = post_tag.postId
    LEFT JOIN
      tag ON post_tag.tagId = tag.id
    LEFT JOIN post_type
      ON post.id = post_type.postId
    LEFT JOIN
      type ON post_type.typeId = type.id
    WHERE ${filter?.sql} AND ${whereStatus}
  `;

  //执行查询
  const [...data] = await connection.promise().query(statement, params);

  //提供数据
  return data[0][0].total;
};
