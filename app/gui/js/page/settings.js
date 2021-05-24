"use strict";
/// <reference path="../page.ts" />
main.on("click", ".items>h2", function () {
    $(this).siblings().slideToggle(1000);
});
if (localStorage.getItem("better_steam_tool$get_account_users") === null) {
    reload_account_list();
}
else {
    let $html = "";
    $.each(account(), (sid, user) => {
        $html += `
        <div data-id="${sid}" style="background:url('${user.avatar_url}')">
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
$("#new-account").on("click", function () {
    open_page("settings$create", { callback: () => { reload_account_list(); } });
});
$("#OPTaccount").on("click", "div[data-id]", function () {
    open_page("settings$steam_user_config", { "Sid": this.dataset.id });
}).on("click", ".acc_txt", function (event) {
    event.stopPropagation(); //防止誤選
});
async function reload_account_list() {
    let $data = await eel.get_account_list()();
    let $acc = $("#OPTaccount");
    $("#reload-account").attr("disabled", "");
    localStorage.setItem("better_steam_tool$get_account_users", JSON.stringify($data));
    $acc.fadeOut(400, () => {
        let $html = "";
        $.each(account(), (sid, user) => {
            $html += /*html*/ `
            <div data-id="${sid}" style="background:url('${user.avatar_url}')">
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
//=============================================
//                  設置
//=============================================
(async function () {
    let config = await eel.app_get_settings()();
    $.each(config, (key, val) => {
        $("[data-id=\"" + (key === "" ? "none" : key) + "\"]").val(val);
    });
    //select
    let sel = $(".select");
    $.each(sel.children("input"), function () {
        let val = $(this).val();
        let text = $(this).siblings(".opt[data-val=" + (val === "" ? "none" : val) + "]").text();
        sel.children(".type").text(text);
        main.on("click", ".select>.type", function () {
            let $this = $(this);
            let list = $this.siblings(".opt");
            $this.slideUp(300, () => {
                list.slideDown(500);
            });
            main.one("click", () => {
                list.slideUp(500, () => {
                    $this.slideDown(300);
                });
            });
            list
                .on("click", (event) => {
                let ethis = event.target;
                let text = $(ethis).text();
                let val = $(ethis).data("val");
                $(this)
                    .text(text)
                    .siblings("input")
                    .val(val)
                    .trigger("input");
                list.off();
            });
        });
    });
})();
main.on("input", "[data-id]", function () {
    let id = this.dataset.id;
    let val = $(this).val();
    console.log(id + ":" + val);
    eel.app_chang_setting(id, val);
});
console.log("settings is ready");
