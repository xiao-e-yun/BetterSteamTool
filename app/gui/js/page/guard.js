"use strict";
/// <reference path="../page.ts" />
$page.account = localStorage.getItem('guard_acc');
$("#new-account").on("click", "button", function () {
    let open = this.dataset.open;
    if (open) {
        open_page("guard$" + open);
    }
    else {
        reload_guard_account();
    }
});
var $acc = $("#Gaccount");
if (localStorage.getItem("better_steam_tool$get_account_users") === null) {
    reload_account_list();
}
else {
    let $html = "";
    $.each(account(), (sid, user) => {
        if (user["guard"]) {
            $html += /*html*/ `
            <div data-steamid="${sid}" class="account_items">
                <div class="img" style="background-image:url(${user.avatar_url})"></div>
                <div class="code">
                    <h2 class="guard_code"></h2><p class="coped">已複製</p>
                </div>
                <p>${user.persona_name}</p>
            </div>
            `;
        }
    });
    $acc.html($html).fadeIn();
}
async function reload_guard_account() {
    let $data = await eel.get_account_list()();
    $("#reload-account").attr("disabled", "");
    localStorage.setItem("better_steam_tool$get_account_users", JSON.stringify($data));
    $acc.fadeOut(400, () => {
        let $html = "";
        $.each(account(), (sid, user) => {
            if (user["guard"]) {
                $html += /*html*/ `
                <div data-steamid="${sid}" class="account_items">
                    <div class="img" style="background-image:url(${user.avatar_url})"></div>
                    <div class="code">
                        <h2 class="guard_code"></h2><p class="coped">已複製</p>
                    </div>
                    <p>${user.persona_name}</p>
                </div>
                `;
            }
        });
        $acc.html($html).fadeIn();
        get_2FA();
        console.log("reload user list");
        setTimeout(() => { $("#reload-account").removeAttr("disabled"); }, 1000);
    });
}
async function get_2FA(always = false) {
    if (now_page === "guard") {
        let data = await eel.get_2FA()();
        let time_line = $("#last_time");
        $.each(data["twoFA"], (key, val) => {
            $acc.find(`div[data-steamid="${key}"] .guard_code`).text(val);
        });
        const time = data["reload_time"];
        const next_time = time > 0 ? time : 1000 + 1000; //每三十秒刷新 30000ms
        if (always) {
            time_line.css("width", "100%").animate({ width: "0%" }, next_time, "linear");
            setTimeout(() => {
                get_2FA(true);
            }, next_time);
        }
    }
}
get_2FA(true);
main.on("click", "div.code", function () {
    const text = $(this).children(".guard_code").text();
    const coped = $(this).children(".coped");
    if (coped.css("opacity") === "0") {
        coped
            .css({ height: "0em", opacity: 0 })
            .animate({ height: '1em', opacity: 1 }, {
            done: () => {
                setTimeout(() => {
                    coped.animate({ height: '0em', opacity: 0 });
                }, 1000);
            }
        });
    }
    copy(text);
    console.log("copy:" + text);
});
console.log("guard is ready");
