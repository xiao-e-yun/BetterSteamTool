"use strict";
let Eclose = function () { window.close(); };
eel.expose(Eclose, "close");
let Eget_req = function (a, b) { (() => { get_req(a, b); })(); };
eel.expose(Eget_req, "get_req");
window["w"] = 0;
window["h"] = 0;
if (location.pathname === "/index.html" || location.pathname === "/") {
    w = 300;
    h = 600;
}
else { //初始化設置
    let reg = /\/request\/(?<page>.*)\$(?<type>.*).html/gm;
    reg.lastIndex = 0;
    let path = reg.exec(location.pathname)["groups"];
    switch (path["page"]) {
        case "settings":
            switch (path["type"]) {
                case "create":
                    w = 1000;
                    h = 500;
                    break;
                case "import":
                    w = 300;
                    h = 600;
                    break;
            }
            break;
        case "待填":
            switch (path["type"]) {
                case "待填":
                    break;
                case "待填":
                    break;
            }
            break;
    }
}
WebSocket["onclose"] = function () {
    window.close();
};
$(() => {
    if (w !== 0 && h !== 0) {
        window.onresize = function () {
            window.resizeTo(w, h);
        };
    }
    window["footer"] = $('footer');
    window["main"] = $('main#main_contant');
    window["page"] = {};
    if (opener) {
        $("body").append(`
        <script type="text/javascript" src="/js${location.pathname.slice(0, -5)}.js"></script>
        <link rel="stylesheet" href="/css${location.pathname.slice(0, -5)}.css">
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
    window["open_page"] = function (href) {
        let dis = $("#sys_disabled");
        dis.fadeIn();
        window["waiting_screen"] = true;
        let win = window.open("/request/" + href + ".html", "", `app=true ,height=1 ,width=1`);
        //關閉時啟用
        let I = setInterval(() => {
            if (win.closed === true) {
                window["waiting_screen"] = false;
                dis.fadeOut();
                console.log("it was closed");
                clearInterval(I);
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
    });
});
function load_page(id) {
    console.log("open \"" + id + "\" page");
    page[id] = {};
    window["$page"] = page[id];
    main.fadeOut(100, () => {
        $.get("/page/" + id + ".html", function (data) {
            main
                .off() //刪除監聽
                .html(data + `
                <script type="text/javascript" src="/js/page/${id}.js"></script>
                <link rel="stylesheet" href="/css/page/${id}.css">
                `)
                .fadeIn(100);
        });
    });
}
