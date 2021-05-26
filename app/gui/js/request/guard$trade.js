/// <reference path="../page.ts" />
w = 800;
h = 500;
const steamid = call_data()["steamid"].toString();
const aside = $("#trade_list");
var main = $("main");
(async () => {
    let api = await eel.test_login(call_data()["steamid"], true)();
    if (api === "account") {
        open_page("settings$create", {
            "username": (await eel.user_conf(steamid)())["name"],
            "login_2FA": async function (Sid) { return (await eel.get_2FA()())["twoFA"][Sid]; },
            "req": steamid,
            "callback": function (Sid) {
                location.reload();
            }
        });
    }
    else if (api === "api_error") {
    }
    else {
        console.log("start");
        //已設置API
        let unix_time = Math.floor((new Date().getTime()) / 1000);
        const url = `https://api.steampowered.com/IEconService/GetTradeOffers/v1/?key=${api}&get_received_offers=true&active_only=true&get_sent_offers=true&time_historical_cutoff=${unix_time}`;
        const req = (await eel.get(url)())["response"];
        let trades = [];
        if (req["trade_offers_received"] || req["trade_offers_sent"]) { //有任務
            let all_trades = [];
            if (req["trade_offers_sent"]) {
                all_trades = all_trades.concat(req["trade_offers_sent"]);
            }
            if (req["trade_offers_received"]) {
                all_trades = all_trades.concat(req["trade_offers_received"]);
            }
            const list = req["trade_offers_received"];
            list.forEach(trade => {
                console.log(trade);
                if (trade["confirmation_method"] === 2) {
                    trades.push(trade);
                }
            });
        }
        trades.forEach((data) => {
        });
    }
})();
async function post_form(val, trade_id) {
    //op 表示 YES or NO 
    //取消 cancel 同意 allow
    let queryString = "?op=" + (val ? "allow" : "cancel");
    queryString += "&" + (val ?
        /*同意*/ 'p=android:090392cb-fc03-461f-bee1-0510e7ecdf7f&a=76561198985594954&k=4hmQno8S6Ts45dYW8QplctQjpMw%3D&t=1621952871&m=android&tag=allow' :
        /*取消*/ 'p=android:090392cb-fc03-461f-bee1-0510e7ecdf7f&a=76561198985594954&k=%2BOK9Mvh3%2B%2FhPeoNGK00OJdOz%2FbU%3D&t=1621952871&m=android&tag=cancel');
    //交易ID
    queryString += "&cid=" + trade_id;
    //交易金鑰(2FA)
    let key = await eel.get_confirmation_key(steamid); //auto call
    queryString += "&ck=" + key;
    $.get("steamcommunity.com/mobileconf/ajaxop" + queryString, (req) => {
        req = JSON.parse(req);
        console.log(req);
        return req["success"];
    });
}
export {};
