"use strict";
/// <reference path="../page.ts" />
main.on("click", ".items>h2", function () {
    $(this).siblings().slideToggle(1000);
});
function account() { return JSON.parse(localStorage.getItem("better_steam_tool$get_account_users")); }
if (localStorage.getItem("better_steam_tool$get_account_users") === null) {
    reload_account_list();
}
else {
    let $html = "";
    $.each(account(), (sid, user) => {
        $html += `
        <div id="${user.name}" style="background:url('${user.avatar_url}')">
            <div class="acc_txt">
                <p>${user.persona_name}</p>
            </div>
        </div>
        `;
    });
    $("#OPTaccount").html($html).fadeIn();
}
$("#reload-account").on("click", () => {
    reload_account_list();
});
async function reload_account_list() {
    let $data = await eel.get_account_list()();
    let $acc = $("#OPTaccount");
    $("#reload-account").attr("disabled", "");
    localStorage.setItem("better_steam_tool$get_account_users", JSON.stringify($data));
    $acc.fadeOut(400, () => {
        let $html = "";
        $.each(account(), (sid, user) => {
            $html += `
            <div id="${user.name}" style="background:url('${user.avatar_url}')">
                <div class="acc_txt">
                    <p>${user.persona_name}</p>
                </div>
            </div>
            `;
        });
        $acc.html($html).fadeIn();
        console.log("reload user list");
        setTimeout(() => { $("#reload-account").removeAttr("disabled"); }, 1000);
    });
}
(async function () {
    let config = await eel.app_get_settings()();
    $.each(config, (key, val) => {
        $("#" + key).val(val);
    });
})();
main.on("input", "input", function () {
    eel.app_chang_setting(this.id, this.value);
});
console.log("settings is ready");
