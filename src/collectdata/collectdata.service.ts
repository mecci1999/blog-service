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
    case "createComment":
      selectedActionType = `comment`;
      sql = `COUNT(${selectedActionType}.id)`;
      break;
    case "createFile":
      selectedActionType = `file`;
      sql = `COUNT(${selectedActionType}.id)`;
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
  const [...data] = await connection.promise().query(statement);

  // 提供数据
  return JSON.parse(JSON.stringify(data[0][0]));
};
