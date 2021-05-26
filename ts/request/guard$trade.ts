/// <reference path="../page.ts" />

import { data } from "jquery";

w = 800
h = 500
const steamid: string = (call_data()["steamid"] as String).toString()
const aside = $("#trade_list")
var main = $("main");

(async () => {
    let api = await eel.test_login(call_data()["steamid"], true)()
    if (api === "account") {
        open_page("settings$create", {
            "username": (await eel.user_conf(steamid)())["name"],
            "login_2FA": async function (Sid: string) { return (await eel.get_2FA()())["twoFA"][Sid] },
            "req": steamid,
            "callback": function (Sid: string) {
                location.reload()
            }
        })
    } else if (api === "api_error") {

    } else {
        console.log("start")
        //已設置API
        let unix_time = Math.floor((new Date().getTime()) / 1000)
        const url = `https://api.steampowered.com/IEconService/GetTradeOffers/v1/?key=${api}&get_received_offers=true&active_only=true&get_sent_offers=true&time_historical_cutoff=${unix_time}`
        const req = (await eel.get(url)())["response"]

        let trades = []
        if (req["trade_offers_received"] || req["trade_offers_sent"]) {//有任務
            let all_trades = []
            if(req["trade_offers_sent"]){
                all_trades = all_trades.concat(req["trade_offers_sent"])
            }
            if(req["trade_offers_received"]){
                all_trades = all_trades.concat(req["trade_offers_received"])
            }

            const list: [{ "tradeofferid": String, "accountid_other": Number, "message": String, "expiration_time": Number, "trade_offer_state": Number, "items_to_give": [items: object], "is_our_offer": boolean, "time_created": Number, "time_updated": Number, "from_real_time_trade": boolean, "escrow_end_date": Number, "confirmation_method": Number }
                    ] = req["trade_offers_received"]
            list.forEach(trade => {
                console.log(trade)
                if (trade["confirmation_method"] === 2) {
                    trades.push(trade)
                }
            })

        }
        trades.forEach((data:{tradeofferid:string,accountid_other: number,message: string,expiration_time: number,trade_offer_state: number,items_to_give?:[{appid: number,contextid: string,assetid: string,classid: string,instanceid: string,amount: string,missing: boolean,est_usd: string,}]| null,is_our_offer: boolean,time_created: number,time_updated: number,from_real_time_trade: boolean,escrow_end_date: number,confirmation_method: number})=>{
            
        });
    }
})()

async function post_form(val, trade_id) {
    //op 表示 YES or NO 
    //取消 cancel 同意 allow
    let queryString = "?op=" + (val ? "allow" : "cancel")

    queryString += "&" + (val ?
    /*同意*/'p=android:090392cb-fc03-461f-bee1-0510e7ecdf7f&a=76561198985594954&k=4hmQno8S6Ts45dYW8QplctQjpMw%3D&t=1621952871&m=android&tag=allow' :
    /*取消*/'p=android:090392cb-fc03-461f-bee1-0510e7ecdf7f&a=76561198985594954&k=%2BOK9Mvh3%2B%2FhPeoNGK00OJdOz%2FbU%3D&t=1621952871&m=android&tag=cancel'
    )
    //交易ID
    queryString += "&cid=" + trade_id;
    //交易金鑰(2FA)
    let key = await eel.get_confirmation_key(steamid) //auto call
    queryString += "&ck=" + key;

    $.get("steamcommunity.com/mobileconf/ajaxop" + queryString, (req) => {
        req = JSON.parse(req)
        console.log(req)
        return req["success"]
    })
}