"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
function reload_account_list() {
    return __awaiter(this, void 0, void 0, function* () {
        let $data = yield eel.get_account_list()();
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
    });
}
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        let config = yield eel.app_get_settings()();
        console.log(config);
        $.each(config, (key, val) => {
            $("#" + key).val(val);
        });
    });
})();
main.on("input", "input", function () {
    eel.app_chang_setting(this.id, this.value);
});
console.log("settings is ready");
