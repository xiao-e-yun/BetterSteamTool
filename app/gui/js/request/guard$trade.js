"use strict";
/// <reference path="../page.ts" />
w = 800;
h = 500;
let wait = false;
const steamid = call_data()["steamid"].toString();
const aside = $("#trade_list");
var api;
var tmp = {
    descriptions: {},
    trades: {},
    other_accinfo: {}
};
(async () => {
    var main = $("main").hide();
    document.title = (await eel.user_conf(steamid)())["name"] + " 確認頁面";
    api = await eel.test_login(call_data()["steamid"], true)();
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
        opener["Einfo"]("網路錯誤，請稍後再試");
        close();
    }
    else {
        //已設置API
        Einfo("讀取交易資料", `API已取得:${api}`, "console");
        let unix_time = Math.floor((new Date().getTime()) / 1000);
        const url = "https://api.steampowered.com/IEconService/GetTradeOffers/v1/?" +
            `key=${api}&` +
            "get_received_offers=true&" +
            "active_only=true&" +
            "get_sent_offers=true&" +
            `time_historical_cutoff=${unix_time}&` +
            "language=tchinese&" +
            "get_descriptions=true";
        const req = (await eel.get(url)())["response"];
        let trades = [];
        if (!(req["trade_offers_received"] || req["trade_offers_sent"])) {
            Einfo("無未完成交易", "全部交易皆已完成", "console");
        }
        else { //有任務
            Einfo("處理交易描述", "", "console");
            //處理描述
            const des = req["descriptions"];
            des.forEach(item => {
                window.tmp["descriptions"][item.classid + "-" + item.instanceid] = item;
            });
            Einfo("處理描述完成", `共有${des.length}項描述`, "console");
            Einfo("處理交易資料", "", "console");
            if (req["trade_offers_sent"]) {
                /*發出方*/ req["trade_offers_sent"].forEach((trade) => {
                    let status = trade.trade_offer_state;
                    if (status === 9) {
                        trades.push(trade);
                    }
                });
            }
            if (req["trade_offers_received"]) {
                /*接收方*/ req["trade_offers_received"].forEach((trade) => {
                    let status = trade.trade_offer_state;
                    if (status === 2) {
                        trades.push(trade);
                    }
                });
            }
            Einfo("資料處理完成", `共有${trades.length}項交易`, "console");
            Einfo("加載交易對象帳號資料", "", "console");
            let other_steamids = [];
            for (let data of trades) {
                data["steamid_other"] = await eel.to_steamid(data.accountid_other)();
                if ($.inArray(data["steamid"], other_steamids) === -1) {
                    other_steamids.push(data["steamid_other"]);
                }
                aside.append(/*html*/ `<div class="trade_item" data-tradeofferid=${data.tradeofferid} data-steamid_other="${data["steamid_other"]}"></div>`);
                window.tmp.trades[data.tradeofferid] = data;
            }
            let other_accinfo_req = await eel.get(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${api}&steamids=` + other_steamids.join(","))();
            let other_accinfo = other_accinfo_req["response"]["players"];
            other_accinfo.forEach(account => {
                window.tmp.other_accinfo[account.steamid] = account;
                $(`.trade_item[data-steamid_other=${account.steamid}]`).css({ "background-image": `url("${account.avatarmedium}")` });
            });
            Einfo("成功交易對象帳號資料", `共有${other_steamids.length}項對象`, "console");
        }
    }
    all_done(main);
})();
async function all_done(main) {
    let aside = $("#trade_list");
    let aside_scr;
    aside.hover(() => {
        aside.on("scroll", () => {
            aside_scr = aside.scrollTop();
        });
    }, () => {
        aside.off("scroll");
        aside.css("top", "-" + aside_scr + "px");
    });
    aside.on("click", ".trade_item:not(.checking)", function () {
        if (!wait) {
            return;
        }
        aside.children(".checking").removeClass("checking");
        let $this = $(this).addClass("checking");
        let tradeofferid = this.dataset.tradeofferid;
        let steamid_other = this.dataset.steamid_other;
        let trade = tmp.trades[tradeofferid];
        let other_accinfo = tmp.other_accinfo[steamid_other];
        Einfo("加載交易資料", `tradeofferid : ${tradeofferid}\nsteamid_other : ${steamid_other}`, "console");
        main.fadeOut(400, () => {
            let trade_items_give = "";
            let trade_items_get = "";
            if (trade.items_to_give) {
                trade.items_to_give.forEach(data => {
                    let id = data["classid"] + "-" + data["instanceid"];
                    let des = tmp.descriptions[id];
                    trade_items_give += /*html*/ `
                <div class="item" data-item="${id}"><img src='https://community.cloudflare.steamstatic.com/economy/image/${des["icon_url"]}'><p class="item_text">${des["name"]}</p></div>
                `;
                });
            }
            if (trade.items_to_receive) {
                trade.items_to_receive.forEach(data => {
                    let id = data["classid"] + "-" + data["instanceid"];
                    let des = tmp.descriptions[id];
                    trade_items_get += /*html*/ `
                    <div class="item" data-item="${id}"><img src='https://community.cloudflare.steamstatic.com/economy/image/${des["icon_url"]}'><p class="item_text">${des["name"]}</p></div>
                    `;
                });
            }
            let acc_createtime = new Date(other_accinfo.timecreated * 1000);
            main.html(/*html*/ `
            <h2 class="title">正在與<a target="_blank" href="${other_accinfo.profileurl}">${other_accinfo.personaname}</a>交易</h2>
            <p class="user_info">真實名稱:<code>${other_accinfo.realname}</code>|創建時間:${acc_createtime.getFullYear()}年${acc_createtime.getMonth() + 1}月${acc_createtime.getDate()}日</p>
            <div class="inline_btn" id="trade_btn">
                <button id="cancel">取消</button>
                <button id="accept">接受</button>
            </div>
            <div class="trade_items_root">
                <div class="trade_items trade_items_give"><h3>你會失去</h3>${trade_items_give}</div>
                <div class="trade_items trade_items_get"><h3>你會得到</h3>${trade_items_get}</div>
            </div>
            `).fadeIn();
            $("#trade_btn").one("click", "button", async function () {
                let type = this.id === "accept" ? true : false;
                let loader = $(".loader");
                loader.fadeIn();
                wait = true;
                post_form(type, tradeofferid).then((req) => {
                    loader.fadeOut();
                    wait = false;
                    Einfo("已發出交易", `交易ID:${tradeofferid}\n送出類型:${this.id}`, "console");
                    if (req.success) {
                        $(".trade_item.checking").remove();
                        let next = $(".trade_item:first");
                        if (next.length === 1) {
                            next.trigger("click");
                        }
                        else {
                            main.fadeOut(400, () => {
                                main.html(/*html*/ `<h2 class="title">全部交易皆已完成!</h2><p class="user_info">要是有新的交易，請更新頁面!</p>`).fadeIn();
                            });
                        }
                    }
                    else {
                        Einfo("確認錯誤", `錯誤類型:${req.err_type}\n詳細內容:${req.err_info}\n錯誤行數:${req.err_line})`, "console");
                    }
                });
            });
        });
    });
    let next = aside.children(":first").trigger("click");
    if (next.length === 0) {
        main.html(/*html*/ `<h2 class="title">目前尚未有交易!</h2><p class="user_info">要是有新的交易，請更新頁面!</p>`).fadeIn();
    }
    $("#loading").fadeOut();
}
async function post_form(val, trade_id) {
    return await eel.post_confirmation(steamid, api, val, trade_id)();
}
console.log("app start");
