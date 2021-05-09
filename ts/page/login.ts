/// <reference path="../page.ts" />

async function show_acc_items() {
    let list: any = await eel.get_client_users()()

    onClick()
    function onClick() {
        $("#account").one("click", ".account_items", function () {
            let user = this.dataset.username
            let btn = $(".account_items")
            console.log(user)
            eel.auto_login(user)
            setTimeout(() => { onClick() }, 1000)
        })
    }
    $("#account").on("click", ".account_items p", (event) => {
        event.stopPropagation()
    })

    let session = false
    let Sdata = localStorage.getItem("better_steam_tool$get_client_users")
    if (Sdata !== null) {
        session = true
        Sdata = JSON.parse(Sdata)
    }
    let loop = { org: [], url: [] }
    $.each(list, async function (key: string, val: { "AccountID": string, "AccountName": string, "MostRecent": string, "PersonaName": string, "RememberPassword": string, "SkipOfflineModeWarning": string, "Timestamp": string, "WantsOfflineMode": string }) {
        if (session) {
            $("#account").append(`
            <div class="account_items" data-username="${val.AccountName}" style="background-image:url('${Sdata[val.AccountID]["avatar_url"]};order:${val.AccountID};')">
                <p>${val.PersonaName}</p>
            </div>
            `)
        } else {
            loop["url"].push(`https://steamcommunity.com/miniprofile/${val.AccountID}/json`)
            loop["org"].push(val)
        }
    })
    if (!session) {
        console.log(loop)
        eel.get(loop["url"], loop["org"])
    }
}
function get_req(data: any, original: any) {
    $("#account").append(`
    <div class="account_items" data-username="${original.AccountName}" style="background-image:url('${data.avatar_url}');order:${original.AccountID};">
        <p>${original.PersonaName}</p>
    </div>
    `)
    let $data = JSON.parse(localStorage.getItem("better_steam_tool$get_client_users"))
    if ($data === null) { $data = {} }
    $data[original.AccountID] = data
    localStorage.setItem("better_steam_tool$get_client_users", JSON.stringify($data))
}

$("#reload").on("click", () => {
    let list = $("#account")
    list.fadeOut(100, () => {
        list
            .off()
            .html("")
            .show()
        localStorage.removeItem("better_steam_tool$get_client_users")
        show_acc_items()
    })
})

show_acc_items()
console.log("settings is ready")