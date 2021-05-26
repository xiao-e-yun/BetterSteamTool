declare var eel: any
declare var $page: any, page: any
declare var w: number, h: number
declare var footer: JQuery<HTMLElement>, main: JQuery<HTMLElement>
declare let now_page: String
declare var _$Bsteam_data: Object
declare function copy(content: string): void
declare function call_data(): object | null
declare function open_page(href: string, get?: object | boolean): void
declare function account(): { any: { "bg": boolean | string, "avatar_url": string, "lvl": number, "name": string, "oauth": string, "password": string, "persona_name": string, "shared_secret"?: string } } | null
declare function Einfo(title:string,text:string,type:"console"|"log"|"error"):void

var w = 1, h = 1;

if (location.pathname === "/"
    || location.pathname === "/index.html"
    || location.pathname === "/load.html") {
    w = 300
    h = 600
}

let Edone = function () {
    let url = location.pathname
    if (url === "/load.html") {
            $.get("/", data => {
                let reg = /(?<=<body bgcolor="#0d0c1d">).*(?=<\/body>)/gms
                let req = reg.exec(data)
                $(req[0]).appendTo("body").hide().fadeIn()
                $("#sys_disabled,footer").hide()
                $("#loading").fadeOut(400, function () {
                    history.pushState("", "", "/");
                    location.reload()
                }) // 美觀 :3
            })
    }
}
eel.expose(Edone, "done")

window["Einfo"] = function (title, text = "", type = "log") {
    if (type === "console") {
        if (text === "") {
            console.log(title)
        } else {
            console.log(
                title +
                `\n==============================================\n`
                + text)
        }
    } else {
        let info_type = {
            log: "info_log",
            error: "info_error",
        }
        $(/*html*/`
        <div class="info_box ${info_type[type]}">
            <h2>${title}</h2>
            ${text === "" ? "" : "<p>" + text + "</p>"}
        </div>
        `).appendTo('#server_info')
            .delay(10000)
            .fadeOut(500, function () {
                $(this).remove()
            })
    }
}
eel.expose(Einfo, "info")

window["copy"] = function (text) { navigator.clipboard.writeText(text) }
window["account"] = function () { return JSON.parse(localStorage.getItem("better_steam_tool$get_account_users")) }
window["call_data"] = function () { return opener["_$Bsteam_data"] }

WebSocket["onclose"] = function () {
    window.close()
};

window.onresize = function () {
    window.resizeTo(w, h)
}

async function get_start_page() {
    //自動加載頁面
    let $start_page = await eel.app_setting("start_page")()
    if ($start_page !== "BSnone" && $start_page !== undefined) {
        load_page($start_page)
    } else {
        footer.slideDown()
    }
}

window["now_page"] = ""
function load_page(id: string) {
    if(id !== now_page){
        console.log("open \"" + id + "\" page")
        window["now_page"] = id
        if (window["$page"][id]) {
            main.fadeOut(100, () => {
                main
                    .off() //刪除監聽
                    .html(window["$page"][id])
                    .fadeIn(100)
                $.getScript(`/js/page/${id}.js`)
            })
        } else {
            main.fadeOut(100, () => {
                $.get("/page/" + id + ".html", function (data) {
                    window["$page"][id] =
                        data + `<link rel="stylesheet" href="/css/page/${id}.css">`
                    main
                        .off() //刪除監聽
                        .html(window["$page"][id])
                        .fadeIn(100)
                    $.getScript(`/js/page/${id}.js`)
                })
            })
        }
    }
}

$(()=>{
    if (location.pathname === "/"
        || location.pathname === "/index.html") {
        start()
    }else if (opener) {
        $("body").append(`
        <script type="text/javascript" src="/js${location.pathname.slice(0, -5)}.js"></script>
        <link rel="stylesheet" href="/css${location.pathname.slice(0, -5)}.css" title="main">
        `)
        let moveX = (opener.screenX + (opener["w"] / 2)) - (w / 2)
        let moveY = (opener.screenY + (opener["h"] / 2)) - (h / 2)
        moveTo(
            w === opener["w"] ? moveX + 10 : moveX,
            h === opener["h"] ? moveY + 10 : moveY
        )
        setInterval(() => {
            if (opener === null || !opener["waiting_screen"]) {
                window.close()
            }
        }, 500)
        start()
    }
})

async function start() {
    console.log("初始化")
    window["footer"] = $('footer')
    window["main"] = $('main#main_contant')
    window["$page"] = {}

    get_start_page()

    $("#sys_disabled").hide()
    window["open_page"] = function (href, get: object | boolean = false) {
        let dis = $("#sys_disabled")
        dis.fadeIn()
        window["waiting_screen"] = true

        let win = window.open("/request/" + href + ".html", "", `app=true,width=100,height=100`)
        win.resizeTo(1, 1)
        if (get !== false) {
            window["_$Bsteam_data"] = get
        }
        //關閉時啟用
        let I = setInterval(() => {
            if (win.closed === true) {
                window["waiting_screen"] = false
                dis.fadeOut()
                console.log("it was closed")
                clearInterval(I)
                window["_$Bsteam_data"] = undefined
            }
        }, 300)
    }

    $('#menu_toggle').on('mousedown', function () {
        footer.slideToggle()
    })

    footer.on('click', 'button', function () {
        footer.slideUp()
        load_page(this.dataset.$link)
    })

    $("body").on('click', '[data-link]', function () {
        open_page(this.dataset.link)
    })

    /*body*/.on("mouseenter", "input[data-hide]", function () {
        this.setAttribute("type", "text")
    }).on("mouseleave", "input[data-hide]", function () {
        this.setAttribute("type", "password")
    })
}