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
let account = JSON.parse(localStorage.getItem("account"));
if (localStorage.getItem("account") === null) {
    (() => __awaiter(void 0, void 0, void 0, function* () {
        reload_account_list();
    }))();
}
else {
    let $html = "";
    account.forEach(user => {
        $html += `
        <div id="${user.name}" style="background:url('${user.avatar_url}')">
            <p>
                ${user.persona_name}
            </p>
        </div>
        `;
    });
    $("#account").html($html).fadeIn();
}
$("#reload-account").on("click", () => {
    reload_account_list();
});
function reload_account_list() {
    return __awaiter(this, void 0, void 0, function* () {
        let $data = yield eel.get_account_list()();
        let $acc = $("#account");
        $("#reload-account").attr("disabled", "");
        localStorage.setItem("account", JSON.stringify($data));
        $acc.fadeOut(400, () => {
            let $html = "";
            account.forEach(user => {
                $html += `
            <div id="${user.name}" style="background:url('${user.avatar_url}')">
                ${user.persona_name}
            </div>
            `;
            });
            $acc.html($html).fadeIn();
        });
        console.log("reload user list");
        setTimeout(() => { $("#reload-account").removeAttr("disabled"); }, 1000);
    });
}
console.log("settings is ready");
