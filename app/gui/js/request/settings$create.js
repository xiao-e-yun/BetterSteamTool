"use strict";
w = 1000;
h = 500;
$("body>h1").hover(function () {
    let $this = $(this);
    window["reload_page"] = setTimeout(() => {
        $this.on("click", () => {
            location.reload();
        });
    }, 1000);
}, function () {
    clearInterval(window["reload_page"]);
    $(this).off("click");
});
$("#info").on("DOMNodeInserted", ".del", function () {
    let $this = $(this);
    $this.removeClass("del").hide().fadeIn("fast");
    setTimeout(() => {
        $this.fadeOut(1000, () => {
            $this.remove();
        });
    }, 10000);
});
$("#next_step").on("click", async function () {
    let step = this.dataset.step;
    let data = {};
    let $this = $(this);
    $this.attr('disabled', 'disabled'); //禁用按鈕
    $("#form").find("input").each(function () {
        let key = this.id;
        let val = $(this).val().toString();
        data[key] = val;
    });
    console.log(data);
    let req = await eel.create_account(step, data)();
    let stop = false;
    console.log(req);
    switch (req) { //判斷結果
        case "accpwd":
            info("帳 號 密 碼 錯 誤");
            break;
        case "HTTPError":
            info("網 路 錯 誤", "請稍後再嘗試");
            break;
        case "Captcha":
            stop = true;
            info("需 要 驗 證 碼", `此功能暫時無法使用，請稍後再嘗試<img id="captcha_url" src="">
                <script>(async ()=>{$("#captcha_url")[0].src="https://steamcommunity.com/login/rendercaptcha/?"+ await eel.captcha_url()()})()</script>`, false);
            auth_login("Captcha");
            break;
        case "email":
            stop = true;
            info("需 要 電 子 郵 件 驗 證", "", false);
            auth_login("email");
            break;
        case "2FA": //要求驗證碼
            stop = true;
            info("需 要 手 機 驗 證", "", false);
            auth_login("2FA");
            break;
        case "unknow": //未知錯誤
            info("未 知 錯 誤");
            break;
        case true: //驗證成功
            $("body").fadeOut("fast", () => {
                opener["reload_account_list"]();
                window.close();
            });
            break;
    }
    disabled(stop);
    async function auth_login(id) {
        let d = {
            "email": "電子郵件 驗證碼",
            "2FA": "手機 驗證碼",
            "Captcha": "人機 驗證"
        };
        $("#unknow>input")
            .removeAttr('disabled')
            .attr("id", id)
            .attr("placeholder", `請輸入 STEAM ${d[id]}`);
        $("#unknow>span>span").text(d[id]);
        $("#form>label:not(#unknow)").fadeOut(500, () => {
            $("#unknow").fadeIn();
            $this
                .attr("data-step", id)
                .removeAttr('disabled');
        });
    }
    function info(title, input = '', hide = true) {
        $("#info").prepend(`
        <div ${hide === true ? "class=\"del\"" : ''}>
            <h2>${title}</h2>
            ${input !== '' ? "<br><p>" + input + "</p>" : ''}
        </div>
        `);
    }
    function disabled(stop = false) {
        if (!stop) {
            setTimeout(() => {
                $this.removeAttr('disabled');
            }, 800);
        }
        else {
            $("#form input").attr("disabled", "");
            $("#form>label[id]>input").removeAttr("disabled");
        }
    }
});
