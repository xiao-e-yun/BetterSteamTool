"use strict";
let Eclose = function () { window.close(); };
eel.expose(Eclose, "close");
window["w"] = 0;
window["h"] = 0;
window["copy"] = function (text) { navigator.clipboard.writeText(text); };
window["account"] = function () { return JSON.parse(localStorage.getItem("better_steam_tool$get_account_users")); };
window["call_data"] = function () { return opener["_$Bsteam_data"]; };
if (location.pathname === "/index.html" || location.pathname === "/") {
    w = 300;
    h = 600;
}
WebSocket["onclose"] = function () {
    window.close();
};
window.onresize = function () {
    window.resizeTo(w, h);
};
$(() => {
    window["footer"] = $('footer');
    window["main"] = $('main#main_contant');
    window["$page"] = {};
    if (opener) {
        $("body").append(`
        <script type="text/javascript" src="/js${location.pathname.slice(0, -5)}.js"></script>
        <link rel="stylesheet" href="/css${location.pathname.slice(0, -5)}.css" title="main">
        `);
        let moveX = (opener.screenX + (opener["w"] / 2)) - (w / 2);
        let moveY = (opener.screenY + (opener["h"] / 2)) - (h / 2);
        moveTo(w === opener["w"] ? moveX + 10 : moveX, h === opener["h"] ? moveY + 10 : moveY);
        setInterval(() => {
            if (opener === null || !opener["waiting_screen"]) {
                window.close();
            }
        }, 500);
    }
    $("#sys_disabled").hide();
    window["open_page"] = function (href, get = false) {
        let dis = $("#sys_disabled");
        dis.fadeIn();
        window["waiting_screen"] = true;
        let win = window.open("/request/" + href + ".html", "", `app=true,width=100,height=100`);
        win.resizeTo(0, 0);
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
});
function load_page(id) {
    console.log("open \"" + id + "\" page");
    window["now_page"] = id;
    if (window["$page"][id]) {
        main.fadeOut(100, () => {
            main
                .off() //刪除監聽
                .html(window["$page"][id])
                .fadeIn(100);
            $.getScript(`/js/page/${id}.js`);
        });
    }
    else {
        main.fadeOut(100, () => {
            $.get("/page/" + id + ".html", function (data) {
                window["$page"][id] =
                    data + `<link rel="stylesheet" href="/css/page/${id}.css">`;
                main
                    .off() //刪除監聽
                    .html(window["$page"][id])
                    .fadeIn(100);
                $.getScript(`/js/page/${id}.js`);
            });
        });
    }
}
