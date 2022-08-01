import { connection } from "../app/database/mysql";

export const getAnnounceIndex = async () => {
  // 准备查询
  const statement = `
    SELECT
      *
    FROM 
      announce
    ORDER BY announce.id DESC
  `;

  // 执行查询
  const [...index] = await connection.promise().query(statement);

  // 提供数据
  return index[0] as any;
};

/**
 * 添加捐赠者
 */
export interface announceOption {
  content: string;
}

export const createAnnounce = async (option: announceOption) => {
  // 解构数据
  const { content } = option;

  // 准备查询
  const statement = `
    INSERT INTO announce
    SET ?
  `;

  // 执行查询
  const [data] = await connection.promise().query(statement, { content });

  // 提供数据
  return data as any;
};

/**
 * 删除相关信息
 */
export const deleteAnnounce = async (id: number) => {
  // 准备查询
  const statement = `
    DELETE FROM announce WHERE announce.id = ?
  `;

  // 执行查询
  const [data] = await connection.promise().query(statement, id);

  // 提供数据
  return data as any;
};
