import { connection } from "../app/database/mysql";

export const getRewardIndex = async () => {
  // 准备查询
  const statement = `
    SELECT
      *
    FROM 
      reward
    ORDER BY reward.id DESC
  `;

  // 执行查询
  const [...index] = await connection.promise().query(statement);

  // 提供数据
  return index[0] as any;
};

/**
 * 添加捐赠者
 */
export interface rewardOption {
  name?: string;
  amount?: string;
}

export const create = async (option: rewardOption) => {
  // 解构数据
  const { name, amount } = option;

  // 准备查询
  const statement = `
    INSERT INTO reward
    SET ?
  `;

  // 执行查询
  const [data] = await connection.promise().query(statement, { name, amount });

  // 提供数据
  return data as any;
};

/**
 * 删除相关信息
 */
export const deleteRewarder = async (id: number) => {
  // 准备查询
  const statement = `
    DELETE FROM reward WHERE reward.id = ?
  `;

  // 执行查询
  const [data] = await connection.promise().query(statement, id);

  // 提供数据
  return data as any;
};
