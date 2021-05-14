/// <reference path="../page.ts" />
main.on("click", ".items>h2", function () {
    $(this).siblings().slideToggle(1000)
})

function account(): [{ bg: boolean | string, avatar_url: string, lvl: number, name: string, oauth: string, pwd: string, persona_name: string }] { return JSON.parse(localStorage.getItem("better_steam_tool$account")) }
if (localStorage.getItem("better_steam_tool$account") === null) {
    (async () => {
        reload_account_list()
    })()
} else {
    let $html = ""
    account().forEach(user => {
        $html += `
        <div id="${user.name}" style="background:url('${user.avatar_url}')">
            <div class="acc_txt">
                <p>${user.persona_name}</p>
            </div>
        </div>
        `
    });
    $("#account").html($html).fadeIn()
}

$("#reload-account").on("click", () => {
    reload_account_list()
})

async function reload_account_list() {
    let $data = await eel.get_account_list()()
    let $acc = $("#account")
    $("#reload-account").attr("disabled", "")
    localStorage.setItem("better_steam_tool$account", JSON.stringify($data))
    $acc.fadeOut(400, () => {
        let $html = ""
        account().forEach(user => {
            $html += `
            <div id="${user.name}" style="background:url('${user.avatar_url}')">
                <div class="acc_txt">
                    <p>${user.persona_name}</p>
                </div>
            </div>
            `
        });
        $acc.html($html).fadeIn()
        console.log("reload user list")
        setTimeout(() => { $("#reload-account").removeAttr("disabled") }, 1000)
    })
}

console.log("settings is ready")