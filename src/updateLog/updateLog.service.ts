import { connection } from "../app/database/mysql";

export const getUpdateLogIndex = async () => {
  // 准备查询
  const statement = `
    SELECT
      *
    FROM 
      updatelog
    ORDER BY updatelog.id DESC
  `;

  // 执行查询
  const [...index] = await connection.promise().query(statement);

  // 提供数据
  return index[0] as any;
};

/**
 * 添加捐赠者
 */
export interface updateLogOption {
  content: Array<string>;
}

export const createUpdateLog = async (option: updateLogOption) => {
  // 解构数据
  const { content } = option;

  console.log(content);

  // 准备查询
  const statement = `
    INSERT INTO updatelog (updatelog.content) VALUES(?)
  `;

  // 执行查询
  const [data] = await connection.promise().query(statement, content);

  // 提供数据
  return data as any;
};

/**
 * 删除相关信息
 */
export const deleteUpdateLog = async (id: number) => {
  // 准备查询
  const statement = `
    DELETE FROM updatelog WHERE updatelog.id = ?
  `;

  // 执行查询
  const [data] = await connection.promise().query(statement, id);

  // 提供数据
  return data as any;
};
