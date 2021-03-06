/// <reference path="../page.ts" />
w = 270
h = 550
let $body = $("body")

$body
    .on("click", ".item", async function () {
        $("#loading").fadeIn()
        if (await eel.user_login(this.dataset.steamid)()) {
            opener["show_acc_items"]()
        }//done
        window.close()
    })
    .on("click", ".item>p", (event) => {
        event.stopPropagation()
    });

(async function () {
    let user_list = await eel.get_account_list()()
    $.each(user_list, (sid: string, users: { avatar_url: String, bg: String, lvl: Number, name: String, oauth: String, persona_name: String, password: String }) => {
        $body.append(`
        <div class="item" data-steamid="${sid}" style="background-image:url('${users.avatar_url}');">
            <p>${users.persona_name}</p>
        </div>
        `)
    });
})()