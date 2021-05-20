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
                <img src=${user.avatar_url}>
                <code></code>
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
                    <img src=${user.avatar_url}>
                    <code></code>
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
        $.each(data["twoFA"], (key, val) => {
            $acc.find(`div[data-steamid="${key}"]>code`).text(val);
        });
        const time = data["reload_time"];
        const next_time = time > 0 ? time : 1000 + 1000; //每三十秒刷新 30000ms
        $("#last_time").css("width", "100%").animate({ width: "0%" }, next_time, "linear");
        console.log(next_time);
        if (always) {
            setTimeout(() => { get_2FA(true); }, next_time);
        }
    }
}
get_2FA(true);
console.log("guard is ready");
