"use strict";
/// <reference path="../page.ts" />
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function show_acc_items() {
    return __awaiter(this, void 0, void 0, function* () {
        let list = yield eel.get_client_users()();
        onClick();
        function onClick() {
            $("#account").one("click", ".account_items", function () {
                let user = this.dataset.username;
                let btn = $(".account_items");
                console.log(user);
                eel.auto_login(user);
                setTimeout(() => { onClick(); }, 1000);
            });
        }
        $("#account").on("click", ".account_items p", (event) => {
            event.stopPropagation();
        });
        let session = false;
        let Sdata = sessionStorage.getItem("better_steam_tool$get_client_users");
        if (Sdata !== null) {
            session = true;
            Sdata = JSON.parse(Sdata);
        }
        let loop = { org: [], url: [] };
        $.each(list, function (key, val) {
            return __awaiter(this, void 0, void 0, function* () {
                if (session) {
                    $("#account").append(`
            <div class="account_items" data-username="${val.AccountName}" style="background-image:url('${Sdata[val.AccountID]["avatar_url"]};order:${val.AccountID};')">
                <p>${val.PersonaName}</p>
            </div>
            `);
                }
                else {
                    loop["url"].push(`https://steamcommunity.com/miniprofile/${val.AccountID}/json`);
                    loop["org"].push(val);
                }
            });
        });
        if (!session) {
            console.log(loop);
            eel.get(loop["url"], loop["org"]);
        }
    });
}
function get_req(data, original) {
    $("#account").append(`
    <div class="account_items" data-username="${original.AccountName}" style="background-image:url('${data.avatar_url}');order:${original.AccountID};">
        <p>${original.PersonaName}</p>
    </div>
    `);
    let $data = JSON.parse(sessionStorage.getItem("better_steam_tool$get_client_users"));
    if ($data === null) {
        $data = {};
    }
    $data[original.AccountID] = data;
    sessionStorage.setItem("better_steam_tool$get_client_users", JSON.stringify($data));
}
$("#reload").on("click", () => {
    let list = $("#account");
    list.fadeOut(100, () => {
        list
            .off()
            .html("")
            .show();
        sessionStorage.removeItem("better_steam_tool$get_client_users");
        show_acc_items();
    });
});
show_acc_items();
console.log("settings is ready");
