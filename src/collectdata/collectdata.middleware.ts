import axios from "axios";
import { Request, Response, NextFunction } from "express";
import _ from "lodash";
import { createAccessLog, getSumData } from "./collectdata.service";

/**
 * 访问日志
 */
interface AccessLogOptions {
  action: string;
  resourceType?: string;
  resourceParamName?: string;
  payloadParam?: string;
  resourceId?: number;
}

interface SumDataOptions {
  value: number;
}

export const collectdata =
  (options: AccessLogOptions) =>
  async (request: Request, response: Response, next: NextFunction) => {
    // 解构选项
    const {
      action,
      resourceType,
      resourceParamName,
      payloadParam,
      resourceId,
    } = options;

    let payload = null;

    if (payloadParam) {
      payload = _.get(request, payloadParam, null);
    }

    // 资源 ID
    // if (resourceParamName) {
    //   if (resourceType === "comment") {
    //     resourceId = _.get(request, resourceParamName, null);
    //   } else {
    //     resourceId = resourceParamName
    //       ? parseInt(request.params[resourceParamName], 10)
    //       : null;
    //   }
    // }

    // 头部数据
    const {
      referer,
      origin,
      "user-agent": agent,
      "access-language": language,
    } = request.headers;

    // 请求
    const {
      originalUrl,
      method,
      query,
      params,
      route: { path },
    } = request;

    const ip = await getIPAddressBySohu();

    const data = (await getSumData(action)) as SumDataOptions;

    // 日志数据
    const accessLog = {
      action,
      resourceType,
      resourceId,
      payload,
      ip,
      origin,
      referer,
      agent,
      language,
      originalUrl,
      method,
      query: Object.keys(query).length ? JSON.stringify(query) : null,
      params: Object.keys(params).length ? JSON.stringify(params) : null,
      path,
      sumData: data.value,
    };

    // 创建日志
    createAccessLog(accessLog);

    // 下一步
    next();
  };

// 获取ip地址
export const getIPAddressBySohu = async () => {
  let ip: string = "";

  await axios
    .create({ baseURL: "http://pv.sohu.com" })
    .get(`/cityjson?ie=utf-8`)
    .then(
      (e) => {
        const object = e.data.split("=")[1].trim().slice(0, -1);

        const { cip } = JSON.parse(object);

        ip = cip;
      },
      (e) => {
        console.log(e);
      }
    );

  return ip;
};
