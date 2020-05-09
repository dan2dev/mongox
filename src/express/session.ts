// import { DateHelper } from "@helper/date-helper";

import type { Request, Response, NextFunction } from "./main";
module DateHelper {
  export type ObjectDate = {
    year: number;
    month: number;
    day: number;
  }
  export function today(): number {
    var today = new Date();
    return dateToNumber(today);
  }
  export function dateToNumber(date: Date): number {
    const obj = dateToObject(date);
    return Number(String(obj.year) + String(obj.month).padStart(2, '0') + String(obj.day).padStart(2, '0'));
  }
  export function dateToObject(date: Date): ObjectDate {
    var dd = String(date.getDate()).padStart(2, '0');
    var mm = String(date.getMonth() + 1).padStart(2, '0'); // 0 is January
    var yyyy = date.getFullYear();
    return {
      year: Number(yyyy),
      month: Number(mm),
      day: Number(dd),
    }
  }
  export function numberToObject(number: number): ObjectDate {
    return dateToObject(numberToDate(number));
  }
  export function numberToDate(number: number): Date {
    const strDate = String(number);
    const year = Number(strDate.substr(0, 4));
    const month = Number(strDate.substr(4, 2)) - 1;
    const day = Number(strDate.substr(6, 2));
    return new Date(year, month, day);
  }
}
export function sessionMiddleware(
  req: import("./main").Request,
  res: import("./main").Response,
  next: import("./main").NextFunction) {
  if (req.cookies["v"] !== undefined) {
    res.locals["v"] = req.cookies["v"];
  } else {
    res.locals["v"] = "V" + Math.floor(Math.random() * 9000 + 1000) + "-" + Math.random().toString(36).substring(7).toUpperCase();
    const d = DateHelper.numberToObject(DateHelper.today());
    res.cookie("v", res.locals["v"], { secure: false, expires: new Date(d.year + 3, d.month, d.day) });
  }
  next();
}
export function getSessionId(res: import("./main").Response): string {
  return res.locals["v"] || "V0000-AAAAAA";
}
export default sessionMiddleware;
