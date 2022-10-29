import { GetPostsOptionsPagination } from "../post/post.service";
import { connection } from "../app/database/mysql";

/**
 * 搜索标签
 */
export interface searchPostsOptions {
  postTitle?: string;
  pagination?: GetPostsOptionsPagination;
}

export const searchPosts = async (options: searchPostsOptions) => {
  // 解构选项
  const { postTitle: name, pagination } = options;

  // SQL 参数
  let params: Array<any> = [pagination?.limit, pagination?.offset];

  if (name) {
    params = [`%${name}%`, ...params];
  }

  // 准备查询
  const statement = `
    SELECT
      post.id as postId,
      post.title
    FROM
        post
    WHERE
      post.status = 'published' AND post.title LIKE ?
    LIMIT ?
    OFFSET ?
  `;

  // 执行查询
  const [data] = await connection.promise().query(statement, params);

  // 提供数据
  return data as any;
};
