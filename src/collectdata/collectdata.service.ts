import { socketIoServer } from "../app/app.server";
import { connection } from "../app/database/mysql";
import { CollectDataModel } from "./collectdata.model";

/**
 * 创建访问日志
 */
export const createAccessLog = async (collectdata: CollectDataModel) => {
  // 准备查询
  const statement = `
    INSERT INTO access_log
    SET ?
  `;

  // 执行查询
  const [data] = await connection.promise().query(statement, collectdata);

  // 触发事件
  socketIoServer.emit("accessLogCreated", collectdata.action);

  // 提供数据
  return data;
};

/**
 * 获取某个动作的总数据
 */
export const getSumData = async (action: string) => {
  let selectedActionType: string;
  let sql: string;
  let whereAccessLog: string = "";

  switch (action) {
    case "createPost":
      selectedActionType = "post";
      sql = `COUNT(${selectedActionType}.id)`;
      break;
    case "getPosts":
      selectedActionType = `access_log`;
      sql = `COUNT(${selectedActionType}.id)`;
      whereAccessLog = `WHERE access_log.action = 'getPosts'`;
      break;
    case "getPostById":
      selectedActionType = `access_log`;
      sql = `COUNT(${selectedActionType}.id)`;
      whereAccessLog = `WHERE access_log.action = 'getPostById'`;
      break;
    case "uploadPostImg":
      selectedActionType = `access_log`;
      sql = `COUNT(${selectedActionType}.id)`;
      whereAccessLog = `WHERE access_log.action = 'uploadPostImg'`;
      break;
    case "createComment":
      selectedActionType = `comment`;
      sql = `COUNT(${selectedActionType}.id)`;
      break;
    case "createReplyComment":
      selectedActionType = `comment`;
      sql = `COUNT(${selectedActionType}.id)`;
      whereAccessLog = `WHERE comment.parentId IS NOT NULL`;
      break;
    case "uploadImageFile":
      selectedActionType = `file`;
      sql = `COUNT(${selectedActionType}.id)`;
      break;
    case "updateCommentStatus":
      selectedActionType = "access_log";
      sql = `COUNT(${selectedActionType}.id)`;
      whereAccessLog = `WHERE access_log.action = 'updateCommentStatus'`;
      break;
    case "getAnnounce":
      selectedActionType = `announce`;
      sql = `COUNT(${selectedActionType}.id)`;
      break;
    case "createAnnounce":
      selectedActionType = "access_log";
      sql = `COUNT(${selectedActionType}.id)`;
      whereAccessLog = `WHERE access_log.action = 'createAnnounce'`;
      break;
    case "deleteImageFile":
      selectedActionType = "access_log";
      sql = `COUNT(${selectedActionType}.id)`;
      whereAccessLog = `WHERE access_log.action = 'deleteImageFile'`;
      break;
    case "createPostTag":
      selectedActionType = "access_log";
      sql = `COUNT(${selectedActionType}.id)`;
      whereAccessLog = `WHERE access_log.action = 'createPostTag'`;
      break;
    case "deletePostTag":
      selectedActionType = "access_log";
      sql = `COUNT(${selectedActionType}.id)`;
      whereAccessLog = `WHERE access_log.action = 'deletePostTag'`;
      break;
    case "createPostType":
      selectedActionType = "access_log";
      sql = `COUNT(${selectedActionType}.id)`;
      whereAccessLog = `WHERE access_log.action = 'createPostType'`;
      break;
    case "deletePostType":
      selectedActionType = "access_log";
      sql = `COUNT(${selectedActionType}.id)`;
      whereAccessLog = `WHERE access_log.action = 'deletePostType'`;
      break;
    case "createRewarder":
      selectedActionType = "reward";
      sql = `COUNT(${selectedActionType}.id)`;
      break;
    case "useSearch":
      selectedActionType = "access_log";
      sql = `COUNT(${selectedActionType}.id)`;
      whereAccessLog = `WHERE access_log.action = 'useSearch'`;
      break;
    case "createTag":
      selectedActionType = "tag";
      sql = `COUNT(${selectedActionType}.id)`;
      break;
    case "createType":
      selectedActionType = "type";
      sql = `COUNT(${selectedActionType}.id)`;
      break;
    case "createUpdateLog":
      selectedActionType = "access_log";
      sql = `COUNT(${selectedActionType}.id)`;
      whereAccessLog = `WHERE access_log.action = 'useSearch'`;
      break;
    default:
      return 0;
  }

  // 准备查询
  const statement = `
      SELECT
        ${sql} AS value
      FROM
        ${selectedActionType}
      ${whereAccessLog}
    `;

  // 执行查询
  const [...data] = (await connection.promise().query(statement)) as any;

  // 提供数据
  return JSON.parse(JSON.stringify(data[0][0]));
};

/**
 * 获取某篇博客的访问次数
 */
export const getPostAccessAmount = async (postId: number) => {
  // 准备查询
  const statement = `
    SELECT
      COUNT(access_log.id) as count
    FROM
      access_log
    WHERE
      access_log.action = 'getPostById' AND access_log.resourceId = ?
  `;

  // 执行查询
  const [...data] = (await connection
    .promise()
    .query(statement, postId)) as any;

  // 提供数据
  return data[0][0] as any;
};
