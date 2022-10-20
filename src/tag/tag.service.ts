import { connection } from "../app/database/mysql";
import { TagModel } from "./tag.model";

/**
 * 创建标签
 */
export const createTag = async (tag: TagModel) => {
  // 准备查询
  const statement = `
    INSERT INTO tag
    SET ?
  `;

  // 执行查询
  const [data] = await connection.promise().query(statement, tag);

  // 提供数据
  return data as any;
};

/**
 * 按名字查找标签
 */
export const getTagByName = async (tagName: string) => {
  //准备查询
  const statement = `
    SELECT id, name FROM tag
    WHERE name = ?
  `;

  //执行查询
  const [...data] = (await connection
    .promise()
    .query(statement, tagName)) as any;

  //提供数据
  return data[0][0];
};

/**
 * 删除标签
 */
export const deleteTag = async (tagId: number) => {
  //准备查询
  const statement = `
    DELETE FROM tag
    WHERE id = ?
  `;

  //执行查询
  const [data] = await connection.promise().query(statement, tagId);

  //提供数据
  return data;
};

/**
 * 获取标签列表
 */
export const getTagList = async () => {
  // 准备查询
  const statement = `
    SELECT
      tag.id,
      tag.name,
      (
        SELECT
          COUNT(post.id)
        FROM
          tag as taglist
        LEFT JOIN post_tag ON post_tag.tagId = tag.id
        LEFT JOIN post ON post.id = post_tag.postId
        WHERE post.status = 'published' AND taglist.id = tag.id
      ) AS amount
    FROM
      tag
    GROUP BY tag.name
  `;

  // 执行查询
  const [...data] = await connection.promise().query(statement);

  // 提供数据
  return data[0];
};

/**
 * 更新标签
 */
export const updateTag = async (name: string, tagId: number) => {
  // 准备查询
  const statement = `
  UPDATE tag
  SET name = ?
  WHERE id = ?
  `;

  // 执行查询
  const [data] = await connection.promise().query(statement, [name, tagId]);

  console.log(statement);

  return data;
};
