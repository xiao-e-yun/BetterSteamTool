/// <reference path="../page.ts" />
w = 400
h = 600;
function info(text:string,callback:()=>void=()=>{}) {
    let info = $(".info")
    info
        .text(text)
        .fadeIn(300, function () {
            setTimeout(() => {
                info.fadeOut()
                callback()
            }, 3000)
        })
}


(async function () {
    console.log("start")
    let main = $(".user_list");
    let user_list = await eel.get_account_list()()
    $.each(user_list, (sid: string, user: { avatar_url: String, bg: String, lvl: Number, name: String, oauth: String, persona_name: String, password: String }) => {
        main.append(/*html*/`
        <div class="user_item" data-name="${user.name}" data-steamid="${sid}" data-oauth="${user.oauth}" style="background-image:url('${user.avatar_url}');">
            <p>${user.persona_name}</p>
        </div>
        `)
    })
    main.on("click", ".user_item", function () {
        if (main.data("disabled")) {
            return
        }
        main.data("disabled", true)
        let Sid = this.dataset.steamid
        let name = this.dataset.name
        let oauth = this.dataset.oauth
        $(".loading").fadeIn()
        eel.guard_phone("login", Sid, oauth, name)().then((test: boolean | Object) => {
            if (test == "oauth_error") {
                open_page("settings$create", {
                    "username": name,
                    "callback": function () {
                        $(this).trigger("click")
                        main.data("disabled", false)
                    },
                    "req": ""
                })
            } else if (test == 2) {//已綁定電話
                info(`已綁定驗證器`,()=>{
                    main.data("disabled", false)
                })
            } else {//尚未綁定電話
                window["main_data"] = { "steamid": Sid, "name": name, "oauth": oauth }
                let url = "/js/request/guard$create-main.js"
                $.getScript(url, () => {
                    Einfo("js主線程已切換", "", "console")
                })
            }
        })
    })
})()