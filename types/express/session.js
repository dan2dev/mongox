// import { DateHelper } from "@helper/date-helper";
var DateHelper;
(function (DateHelper) {
    function today() {
        var today = new Date();
        return dateToNumber(today);
    }
    DateHelper.today = today;
    function dateToNumber(date) {
        const obj = dateToObject(date);
        return Number(String(obj.year) + String(obj.month).padStart(2, '0') + String(obj.day).padStart(2, '0'));
    }
    DateHelper.dateToNumber = dateToNumber;
    function dateToObject(date) {
        var dd = String(date.getDate()).padStart(2, '0');
        var mm = String(date.getMonth() + 1).padStart(2, '0'); // 0 is January
        var yyyy = date.getFullYear();
        return {
            year: Number(yyyy),
            month: Number(mm),
            day: Number(dd),
        };
    }
    DateHelper.dateToObject = dateToObject;
    function numberToObject(number) {
        return dateToObject(numberToDate(number));
    }
    DateHelper.numberToObject = numberToObject;
    function numberToDate(number) {
        const strDate = String(number);
        const year = Number(strDate.substr(0, 4));
        const month = Number(strDate.substr(4, 2)) - 1;
        const day = Number(strDate.substr(6, 2));
        return new Date(year, month, day);
    }
    DateHelper.numberToDate = numberToDate;
})(DateHelper || (DateHelper = {}));
export function sessionMiddleware(req, res, next) {
    if (req.cookies["v"] !== undefined) {
        res.locals["v"] = req.cookies["v"];
    }
    else {
        res.locals["v"] = "V" + Math.floor(Math.random() * 9000 + 1000) + "-" + Math.random().toString(36).substring(7).toUpperCase();
        const d = DateHelper.numberToObject(DateHelper.today());
        res.cookie("v", res.locals["v"], { secure: false, expires: new Date(d.year + 3, d.month, d.day) });
    }
    next();
}
export function getSessionId(res) {
    return res.locals["v"] || "V0000-AAAAAA";
}
export default sessionMiddleware;
//# sourceMappingURL=session.js.map