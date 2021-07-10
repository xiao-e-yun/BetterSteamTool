"use strict";
/// <reference path="../page.ts" />
/// <reference path="guard$create.ts" />
w = 600;
h = 400;
let list = $(".user_list");
list.fadeOut(300, async () => {
    list.remove();
    resizeTo(w, h);
    //開始
    console.log("====================================已接管=");
    document.title = `正在為 ${main_data.name} 設置驗證器`;
    $(window).on('beforeunload', async function () {
        return true;
    });
    if (await eel.guard_phone("has_phone", main_data.steamid)()) {
        set_guard();
    }
    else {
        //========================================================
        //                       設置電話號碼
        //========================================================
        $('head').append('<link rel="stylesheet" href="/css/lib/intlTelInput.min.css">');
        $.getScript('/js/lib/intlTelInput/intlTelInput.min.js').then(() => {
            let main = $(/*html*/ `
            <main id="root">
                <h2 class="title">新增電話號碼</h2>
                <input type="tel" placeholder="請輸入電話號碼" id="phone">
                <button id="submit_phone">確認</button>
            </main>
            `).appendTo("body");
            let input = document.getElementById("phone");
            window["intlTelInputGlobals"].loadUtils("/js/lib/intlTelInput/utils.js");
            let iti = window["intlTelInput"](input, {
                allowDropdown: true,
                initialCountry: "tw",
            });
            $("#submit_phone").on("click", function () {
                if (!iti.isValidNumber()) {
                    return info('無效電話');
                }
                let num = iti.getNumber();
                Einfo(num, "", "console");
                eel.guard_phone('add_phone', main_data.steamid, num)().then((can) => {
                    if (!can) {
                        return info('未知錯誤');
                    }
                    main.fadeOut(300, () => {
                        main.html(/*html*/ `
                                <h2 class="title">確認電話號碼</h2>
                                <p class="main_info">請先確認電子郵件</p>
                                <button id="next_step_mail">下一步</button>
                                `).fadeIn();
                        $('#next_step_mail').on("click", async function () {
                            let has = await eel.guard_phone('cfm_mail', main_data.steamid)();
                            if (has) {
                                return info('請先確認電子郵件');
                            }
                            main.fadeOut(300, () => {
                                main.html(/*html*/ `
                                    <h2 class="title">確認電話號碼</h2>
                                    <p class="main_info">請查看您的手機訊息</p>
                                    <input type="text" id="cfm_phone" placeholder="輸入手機訊息驗證碼">
                                    <button id="next_step_SMS">下一步</button>
                                    `).fadeIn();
                                $('#next_step_SMS').on("click", async function () {
                                    let num = $("#cfm_phone").val();
                                    let has = await eel.guard_phone('cfm_phone_num', main_data.steamid, num)();
                                    if (has) {
                                        main.fadeOut(500, () => {
                                            set_guard(main);
                                        });
                                    }
                                    else {
                                        info('請輸入正確驗證碼');
                                    }
                                });
                            });
                        });
                    });
                });
            });
        });
    }
    //========================================================
    //                       添加驗證器
    //========================================================
    function set_guard(_root = false) {
        let root = _root !== false
            ? _root.html("")
            : $(/*html*/ `<main id="root"></main>`).appendTo("body");
        Einfo("設置驗證器", main_data.name, "console");
        root.html(/*html*/ `
        <h2 class="title">將身份驗證器添加到帳戶</h2>
        <p>你的電話號碼將收到簡訊代碼</p>
        <button id="add_phone" class="enable">送出簡訊</button>
        `);
        root.on("click", "#add_phone.enable", async function () {
            let $this = $(this);
            $this.removeClass('enable');
            let bol = await eel.guard_phone('send_phone', main_data.steamid)();
            if (bol) {
                root.fadeOut(300, () => {
                    root.html(/*html*/ `
                    <h2 class="title">將身份驗證器添加到帳戶</h2>
                    <p>你的電話號碼將收到簡訊代碼<br>此時你可以同時將新增驗證器在手機</p>
                    <div id="finish_from">
                        <input id="finish_input" placeholder="請輸入簡訊代碼">
                        <button id="finish_btn">完成</button>
                    </div>
                    <button id="skip_btn">已在手機上新增驗證器</button>
                    `).fadeIn();
                    $("#finish_btn").on("click", function () {
                        info('正在驗證中');
                        eel.guard_phone('finalize', main_data.steamid, $("#finish_input").val())()
                            .then((bol) => {
                            if (bol) {
                                finish();
                            }
                        });
                    });
                    $("#skip_btn").on("click", function () {
                        finish();
                    });
                    function finish() {
                        console.log("註冊成功");
                        $(window).off("beforeunload");
                        opener["reload_guard_account"]();
                        close();
                    }
                });
            }
            else {
                info("未知錯誤", () => { $this.addClass('enable'); });
            }
        });
    }
});
