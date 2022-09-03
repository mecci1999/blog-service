/**
 * 查询片断
 */
export const sqlFragment = {
  leftJoinPost: `
    LEFT JOIN post
    ON post.id = comment.postId
  `,
  post: `
    JSON_OBJECT(
      'id', post.id,
      'title', post.title
    ) AS post
  `,
  repliedComment: `
    (
      SELECT
        JSON_OBJECT(
        'id', repliedComment.id,
        'content', repliedComment.content,
        'name', repliedComment.name,
        'eMail', repliedComment.eMail,
        'avatarImgUrl', repliedComment.avatarImgUrl,
        'os',repliedComment.os,
        'browser',repliedComment.browser,
        'province',repliedComment.province,
        'status', repliedComment.status,
        'created', repliedComment.created,
        'updated', repliedComment.updated,
        'userId', repliedComment.userId
      )
      FROM
        comment repliedComment
      WHERE comment.parentId = repliedComment.id
      ) AS repliedComment
  `,
  totalReplies: `
    (
      SELECT
      IF(
        COUNT(reply.id),
        COUNT(reply.id),
        0
      )
      FROM
        comment reply
      WHERE
        reply.parentId = comment.id
    ) AS totalReplies
  `,

  replyCommentList: `
  (
    SELECT
        CAST(
          IF(
            COUNT(repliedComment.id),
            CONCAT(
              '[',
              GROUP_CONCAT(
                DISTINCT JSON_OBJECT(
                  'id', repliedComment.id,
                  'content', repliedComment.content,
                  'name', repliedComment.name,
                  'eMail', repliedComment.eMail,
                  'avatarImgUrl', repliedComment.avatarImgUrl,
                  'os',repliedComment.os,
                  'browser',repliedComment.browser,
                  'province',repliedComment.province,
                  'status', repliedComment.status,
                  'created', repliedComment.created,
                  'updated', repliedComment.updated,
                  'userId', repliedComment.userId,
                  'totalReplies', (SELECT
                      IF(COUNT(reply.id),COUNT(reply.id),0)
                    FROM
                      comment reply
                    WHERE
                      reply.parentId = repliedComment.id
                  )
                ) ORDER BY repliedComment.id DESC
              ),
              ']'
            ),
            NULL
          ) AS JSON
        )
    FROM
      comment repliedComment
    WHERE comment.id = repliedComment.parentId
    ) AS replyCommentList
  `,
};
