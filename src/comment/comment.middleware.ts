import { getIPAddressBySohu } from "@/collectdata/collectdata.middleware";
import axios from "axios";
import { Request, Response, NextFunction } from "express";

/**
 * 过滤器
 */
export const filter = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  // 解构查询
  const { post, action } = request.query;

  // 默认的过滤
  request.filter = {
    name: "default",
    sql: "comment.parentId IS NULL AND comment.status = 'approved'",
  };

  // 内容的评论列表
  if (post && !action) {
    request.filter = {
      name: "postComments",
      sql: "comment.parentId IS NULL AND comment.status = 'approved' AND comment.postId = ?",
      param: `${post}`,
    };
  }

  // 全部评论列表
  if (action === "all" && !post) {
    request.filter = {
      name: "postComments",
      sql: "comment.id IS NOT NULL",
    };
  }

  // 待审核评论列表
  if (action === "pending" && !post) {
    request.filter = {
      name: "postComments",
      sql: "comment.id IS NOT NULL AND comment.status = 'pending'",
    };
  }

  // 审核通过评论列表
  if (action === "approved" && !post) {
    request.filter = {
      name: "postComments",
      sql: "comment.id IS NOT NULL AND comment.status = 'approved'",
    };
  }

  // 驳回评论列表
  if (action === "denied" && !post) {
    request.filter = {
      name: "postComments",
      sql: "comment.id IS NOT NULL AND comment.status = 'denied'",
    };
  }

  // // 用户的回复评论列表
  // if (user && action == "replied" && !post) {
  //   request.filter = {
  //     name: "userReplied",
  //     sql: "comment.parentId IS NOT NULL AND comment.userId = ?",
  //     param: `${user}`,
  //   };
  // }

  //下一步
  next();
};

/**
 * 获取真实地址
 * 使用的是百度地图提供的api
 */
export const getAddressByBaiduApi = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const ip = await getIPAddressBySohu();

  await axios
    .create({ baseURL: "https://api.map.baidu.com" })
    .get(
      `/location/ip?ak=N8aHMjLP374THnPfPyB89BPKK7TImh2z&ip=${ip}&coor=bd09ll`
    )
    .then(
      (e) => {
        request.body.province = e.data.content.address_detail.province;
        request.body.city = e.data.content.address_detail.city;
      },
      (e) => {
        console.log(e);
      }
    )
    .finally(() => {
      next();
    });
};

/**
 * 获取请求的相关信息的方法
 */
export const getOSAndBrowserInfo = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const userAgent = request.headers[
    "user-agent"
  ]?.toLocaleLowerCase() as String;
  let s;
  let os;
  let browser = {
    ie: "",
    firefox: "",
    chrome: "",
    opera: "",
    safari: "",
  };
  let version = "";

  // 获取到浏览器相关信息
  (s = userAgent.match(/msie ([\d.]+)/))
    ? (browser.ie = s[1])
    : (s = userAgent.match(/firefox\/([\d.]+)/))
    ? (browser.firefox = s[1])
    : (s = userAgent.match(/chrome\/([\d.]+)/))
    ? (browser.chrome = s[1])
    : (s = userAgent.match(/opera.([\d.]+)/))
    ? (browser.opera = s[1])
    : (s = userAgent.match(/version\/([\d.]+).*safari/))
    ? (browser.safari = s[1])
    : 0;

  if (browser.ie) {
    version = "IE " + browser.ie;
  } else {
    if (browser.firefox) {
      version = "Firefox " + browser.firefox;
    } else {
      if (browser.chrome) {
        version = "Chrome " + browser.chrome;
      } else {
        if (browser.opera) {
          version = "Opera " + browser.opera;
        } else {
          if (browser.safari) {
            version = "Safari " + browser.safari;
          } else {
            version = "未知浏览器";
          }
        }
      }
    }
  }

  // 获取操作系统
  if (
    userAgent.indexOf("mac68k") !== -1 ||
    userAgent.indexOf("macppc") !== -1 ||
    userAgent.indexOf("macintosh") !== -1 ||
    userAgent.indexOf("macIntel") !== -1
  ) {
    os = "Mac";
  } else if (userAgent.indexOf("unix") !== -1) {
    os = "Unix";
  } else if (userAgent.indexOf("linux") !== -1) {
    os = "Linux";
  } else if (userAgent.indexOf("windows") !== -1) {
    os = "Windows";
  } else if (userAgent.indexOf("android") !== -1) {
    os = "Android";
  } else if (userAgent.indexOf("iphone") !== -1) {
    os = "IOS";
  }

  request.body.browser = version;
  request.body.os = os;

  next();
};
