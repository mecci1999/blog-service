import { connection } from "../app/database/mysql";

/**
 * 获取博主相关信息
 */
export const getUserInfo = async () => {
  // 准备查询
  const statement = `
    SELECT
      name,
      introduction,
      info,
      (
        SELECT
          COUNT(post.id)
        FROM
          post
      ) AS blogAmount,
      (
        SELECT
          COUNT(type.id)
        FROM
          type
      ) AS typeAmount,
      (
        SELECT
          COUNT(tag.id)
        FROM
          tag
      ) AS tagAmount,
      (
        SELECT
          COUNT(post.id)
        FROM
          post
      ) AS blogAmount,
      IF (
        COUNT(avatar.id), 1, NULL
      ) AS avatar
    FROM
      user
    LEFT JOIN avatar
    ON avatar.userId = user.id
    WHERE user.id = 1
  `;

  // 执行查询
  const [...data] = (await connection.promise().query(statement)) as any;

  // 提供数据
  return data[0][0];
};

/**
 * 根据用户名获取用户信息
 */
export const userIsExistByName = async (name: string) => {
  // 准备查询
  const statement = `
    SELECT
      *
    FROM
      user
    WHERE user.name = ?
  `;

  // 执行查询
  const [...data] = (await connection.promise().query(statement, name)) as any;

  // 提供数据
  return data[0][0];
};
