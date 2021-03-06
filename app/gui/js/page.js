"use strict";
var w = 1, h = 1;
if (location.pathname === "/"
    || location.pathname === "/index.html") {
    w = 300;
    h = 600;
}
else if (location.pathname === "/load.html") {
    w = 300;
    h = 600;
    window["_loading_page"] = setInterval(async () => {
        if (await eel.is_done()()) {
            Edone();
        }
    }, 500);
}
let Edone = function () {
    let url = location.pathname;
    if (url === "/load.html") {
        if (window["_loading_page"]) {
            clearInterval(window["_loading_page"]);
            $.get("/", data => {
                let reg = /(?<=<body bgcolor="#0d0c1d">).*(?=<\/body>)/gms;
                let req = reg.exec(data);
                $(req[0]).appendTo("body").hide().fadeIn();
                $("#sys_disabled,footer").hide();
                $("#loading").fadeOut(400, function () {
                    history.pushState("", "", "/");
                    location.reload();
                }); // 美觀 :3
            });
        }
    }
};
window["Einfo"] = function (title, text = "", type = "log") {
    if (type === "console") {
        if (text === "") {
            console.log(title);
        }
        else {
            console.log(title +
                `\n==============================================\n`
                + text);
        }
    }
    else {
        let info_type = {
            log: "info_log",
            error: "info_error",
        };
        $(/*html*/ `
        <div class="info_box ${info_type[type]}">
            <h2>${title}</h2>
            ${text === "" ? "" : "<p>" + text + "</p>"}
        </div>
        `).appendTo('#server_info')
            .delay(10000)
            .fadeOut(500, function () {
            $(this).remove();
        });
    }
};
eel.expose(Einfo, "info");
window["copy"] = function (text) { navigator.clipboard.writeText(text); };
window["account"] = function () { return JSON.parse(localStorage.getItem("better_steam_tool$get_account_users")); };
window["call_data"] = function () { return opener["_$Bsteam_data"]; };
WebSocket["onclose"] = function () {
    window.close();
};
window.onresize = function () {
    window.resizeTo(w, h);
};
change_app_color(false);
change_app_image();
async function change_app_color(reload = false) {
    let css = `:root{`;
    let done_i = 0;
    const color_arr = [
        "main-color",
        "side-1-color",
        "side-2-color",
        "side-3-color",
        "bg-color",
    ];
    for (let key of color_arr) {
        eel.app_setting(key)().then((color) => {
            if (color !== "BSnone") {
                const rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
                const rgb_color = `${parseInt(rgb[1], 16)}, ${parseInt(rgb[2], 16)}, ${parseInt(rgb[3], 16)}`;
                key = key.replace("-color", "");
                css += `--${key}:${rgb_color};`;
            }
            done_i++;
            if (done_i === color_arr.length) {
                done();
            }
        });
    }
    function done() {
        css += `}`;
        if (reload) {
            $("#custom-css").html(css);
        }
        else {
            $("head").append(`<style id="custom-css">${css}</style>`);
        }
    }
}
async function change_app_image() {
    //注意:這是瀏覽器config
    const file = localStorage.getItem("better_steam_tool$bg_image");
    if (file) {
        $("body").css("background-image", `url(${file})`);
    }
}
async function get_start_page() {
    change_app_image();
    //自動加載頁面
    let $start_page = await eel.app_setting("start_page")();
    if ($start_page !== "BSnone" && $start_page !== "none") {
        load_page($start_page);
    }
    else {
        eel.app_setting("dont_show_welcome")().then((dont_show_welcome) => {
            if (dont_show_welcome !== true) {
                main.append(`<link rel="stylesheet" href="/css/welcome.css">`);
                $.get("/welcome.html", (data) => {
                    main.append(data);
                    $.getScript("/js/welcome.js");
                });
            }
        });
        footer.slideDown();
        main.on("click", () => { footer.slideUp(); });
    }
}
window["now_page"] = "";
function load_page(id) {
    if (id !== now_page) {
        console.log("open \"" + id + "\" page");
        window["now_page"] = id;
        if (window["$page"][id]) {
            main.fadeOut(100, () => {
                reset(id);
            });
        }
        else {
            main.fadeOut(100, () => {
                $.get("/page/" + id + ".html", function (data) {
                    window["$page"][id] =
                        data + `<link rel="stylesheet" href="/css/page/${id}.css">`;
                    reset(id);
                });
            });
        }
        function reset(id) {
            main
                .off() //刪除監聽
                .on("click", () => { footer.slideUp(); })
                .html(window["$page"][id])
                .fadeIn(100);
            $.getScript(`/js/page/${id}.js`);
        }
    }
}
$(() => {
    if (location.pathname === "/"
        || location.pathname === "/index.html") {
        get_start_page();
        start();
    }
    else if (opener) {
        $("body").append(`
        <link rel="stylesheet" href="/css${location.pathname.slice(0, -5)}.css" title="main">
        <script src="/js${location.pathname.slice(0, -5)}.js">
        `);
        resizeTo(w, h);
        let url = new URL(location.href);
        let open = url.searchParams.get("open");
        if (open === "") {
            let moveX = ((opener.screenX + (opener["w"] / 2)) - (w / 2));
            let moveY = ((opener.screenY + (opener["h"] / 2)) - (h / 2));
            moveTo(w === opener["w"] ? moveX + 10 : moveX, h === opener["h"] ? moveY + 10 : moveY);
            history.replaceState("", "", url.pathname);
        }
        setInterval(() => {
            if (opener === null || !opener["waiting_screen"]) {
                window.close();
            }
        }, 500);
        start();
    }
});
async function start() {
    console.log("初始化");
    window["footer"] = $('footer');
    window["main"] = $('#main_contant');
    window["$page"] = {};
    $("#sys_disabled").hide();
    window["open_page"] = function (href, get = false) {
        let dis = $("#sys_disabled");
        dis.fadeIn();
        window["waiting_screen"] = true;
        let win = window.open("/request/" + href + ".html?open", "", `app=true,width=100,height=100`);
        if (get !== false) {
            window["_$Bsteam_data"] = get;
        }
        //關閉時啟用
        let I = setInterval(() => {
            if (win.closed === true) {
                window["waiting_screen"] = false;
                dis.fadeOut();
                console.log("it was closed");
                clearInterval(I);
                window["_$Bsteam_data"] = undefined;
            }
        }, 300);
    };
    $('#menu_toggle').on('mousedown', function () {
        footer.slideToggle();
    });
    footer.on('click', 'button', function () {
        footer.slideUp();
        load_page(this.dataset.$link);
    });
    $("body").on('click', '[data-link]', function () {
        open_page(this.dataset.link);
    })
        /*body*/ .on("mouseenter", "input[data-hide]", function () {
        this.setAttribute("type", "text");
    }).on("mouseleave", "input[data-hide]", function () {
        this.setAttribute("type", "password");
    });
}
