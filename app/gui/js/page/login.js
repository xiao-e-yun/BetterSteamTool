"use strict";
/// <reference path="../page.ts" />
var $acc = $("#account");
async function show_acc_items(reload = true) {
    let list = await eel.get_client_users()();
    let session = false;
    let Sdata = localStorage.getItem("better_steam_tool$get_client_users");
    if (Sdata !== null && reload) {
        session = true;
        Sdata = JSON.parse(Sdata);
    }
    let api_key = await eel.get_steam_web_api()(); //if err return false
    let $html = "";
    let loop = [];
    let api_org = {};
    $.each(list, async function (key, val) {
        if (session && Sdata[val.AccountID]) {
            $html += /*html*/ `
            <div class="account_items" data-username="${val.AccountName}" data-steamid="${key}" style="background-image:url('${Sdata[val.AccountID]["avatar_url"]}');order:${val.AccountID};">
                <p>${val.PersonaName}</p>
            </div>
            `;
        }
        else {
            session = false;
            val["steamid"] = key;
            if (api_key === false) { //使用 CDN
                let url = `https://steamcommunity.com/miniprofile/${val.AccountID}/json`;
                loop.push({
                    "url": url,
                    "org": val
                });
            }
            else {
                loop.push({
                    "url": key,
                });
                api_org[key] = val;
            }
        }
    });
    if (session) {
        $acc.html($html);
    }
    else {
        let $data = {};
        if (api_key === false) { //使用 CDN
            let req = await eel.get(loop)();
            for (let data of req) { //一次性請求
                let req;
                let org;
                let avatar_url;
                if (data === "") {
                    try {
                        avatar_url = JSON.parse(localStorage.getItem("better_steam_tool$get_client_users"))[org.AccountID]["avatar_url"];
                    }
                    catch (e) {
                        avatar_url = "/img/user_noimg.png";
                    }
                }
                else {
                    req = data["req"];
                    avatar_url = req.avatar_url;
                    org = data["org"];
                }
                $html += /*html*/ `
                <div class="account_items" data-username="${org.AccountName}" data-steamid="${org.steamid}" style="background-image:url('${avatar_url}');order:${org.AccountID};">
                    <p>${org.PersonaName}</p>
                </div>`;
                $data[org.AccountID] = req;
            }
            console.log("CDN call");
        }
        else { //使用 web api
            loop = group(loop, 100);
            for (const list of loop) { //一次性請求
                let ids = [];
                list.forEach((data) => {
                    ids.push(data.url);
                });
                let req = await eel.get(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${api_key}&steamids=${ids.join()}`)();
                $.each(req["response"]["players"], (i, req) => {
                    let org = api_org[req["steamid"]];
                    $html += /*html*/ `
                    <div class="account_items" data-username="${org.AccountName}" data-steamid="${org.steamid}" style="background-image:url('${req["avatarfull"]}');order:${org.AccountID};">
                        <p>${org.PersonaName}</p>
                    </div>`;
                    req["avatar_url"] = req["avatarfull"];
                    $data[org.AccountID] = req;
                });
            }
            function group(array, subGroupLength) {
                let index = 0;
                let newArray = [];
                while (index < array.length) {
                    newArray.push(array.slice(index, index += subGroupLength));
                }
                return newArray;
            }
            console.log("steam API call");
        }
        localStorage.setItem("better_steam_tool$get_client_users", JSON.stringify($data));
        $acc.html($html);
    }
}
$("#import").on("click", function () {
    open_page("login$import");
});
$("#reload").on("click", function () {
    $acc.fadeOut(100, () => {
        $acc
            .html("")
            .show();
        show_acc_items(false);
    });
    let $this = $(this);
    $this.attr("disabled", "");
    setTimeout(() => {
        $this.removeAttr("disabled");
    }, 1500);
});
$("#delete")
    .on("click", function () {
    let $this = $(this);
    let del_mode = $(".del_mode").length === 0;
    Einfo("刪除模式", "模式:" + del_mode.toString(), "console");
    let tips = $("#del_mode");
    if (del_mode) {
        tips.fadeIn();
        $acc
            .addClass("del_mode")
            .data("del", true);
    }
    else {
        tips.fadeOut();
        $acc
            .removeClass("del_mode")
            .data("del", false);
    }
    $this.attr("disabled", "");
    setTimeout(() => { $this.removeAttr("disabled"); }, 300);
});
$(".tip").hide();
$acc.on("click", ".account_items", function (event) {
    if ($acc.data("del")) {
        let $this = $(this);
        window["_del_event"] = event;
        eel.del_client_user(this.dataset.steamid)();
        $this
            .addClass("will_del")
            .fadeOut(400, () => {
            $this.remove();
        });
    }
}).on("click", ".account_items p", (event) => {
    event.stopPropagation();
});
main.on("mouseenter", ".account_items", function () {
    $acc.addClass("act");
}).on("mouseleave", ".account_items", function () {
    $acc.removeClass("act");
});
onClick();
function onClick() {
    $acc.one("click", ".account_items", async function () {
        if (!$acc.data("del")) {
            let user = this.dataset.username;
            let steamid = this.dataset.steamid;
            console.log(steamid);
            $("#loading").fadeIn();
            eel.auto_login(steamid, user)().then(() => {
                $("#loading").fadeOut();
            });
        }
        setTimeout(() => { onClick(); }, 1000);
    });
}
show_acc_items();
console.log("settings is ready");
