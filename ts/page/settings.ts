/// <reference path="../page.ts" />
main.on("click", ".items>h2,.card>.title:not(.action)", function () {
    const $this = $(this)
    const content = $this.siblings()
    $this.addClass("action")
    content.fadeToggle(300,()=>{
        $this.removeClass("action")   
    })
})

if (localStorage.getItem("better_steam_tool$get_account_users") === null) {
    reload_account_list()
} else {
    let $html = ""
    $.each(account(), (sid, user) => {
        $html += `
        <div data-id="${sid}" style="background:url('${user.avatar_url}')">
            <div class="acc_txt">
                <p>${user.persona_name}</p>
            </div>
        </div>
        `
    })
    $("#OPTaccount").html($html).fadeIn()
}

$("#reload-account").on("click", () => {
    reload_account_list()
})

$("#new-account").on("click", function () {
    open_page("settings$create", { callback: () => { reload_account_list() } })
})

$("#OPTaccount").on("click", "div[data-id]", function () {
    open_page("settings$steam_user_config", { "Sid": this.dataset.id })
}).on("click", ".acc_txt", function (event) {
    event.stopPropagation()//防止誤選
})

async function reload_account_list() {
    let $data = await eel.get_account_list()()
    let $acc = $("#OPTaccount")
    $("#reload-account").attr("disabled", "")
    localStorage.setItem("better_steam_tool$get_account_users", JSON.stringify($data))
    $acc.fadeOut(400, () => {
        let $html = ""
        $.each(account(), (sid, user) => {
            $html += /*html*/`
            <div data-id="${sid}" style="background:url('${user.avatar_url}')">
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
//=============================================
//                  設置
//=============================================
(async function () {
    let config = await eel.app_setting()()
    $.each(config, (key: string, val:string|boolean) => {
        if(typeof val === "string" && key !== ""){
            const input = $(`[data-id="${key}"]`) as JQuery<HTMLInputElement>
            switch (input.attr("type")) {
                case "file":
                    input.siblings("p").html(val==="BSnone"||val===""?"點擊選擇檔案":val)
                    break
                case "color":
                    input.parent().css("background-color", val)
                    input.val(val)
                    break
                default:
                    input.val(val)
            }
        }else if(typeof val === "boolean"){
            let input = $("input[data-checkbox]")
            input
                .prop('checked',val)
                .parent()[val?"addClass":"removeClass"]("checked")
        }
    })

    //select
    let sel = $(".select")
    $.each(sel.children("input"), function () {
        let val: any = $(this).val()
        let text = $(this).siblings(".opt[data-val=" + (val === "" ? "none" : val) + "]").text()
        sel.children(".type").text(text)

        main.on("click", ".select>.type", function () {
            let $this = $(this)
            let list = $this.siblings(".opt")
            
            $this.slideUp(300,()=>{
                list.slideDown(500)
            })
            main.one("click", () => {
                list.slideUp(500,()=>{
                    $this.slideDown(300)
                })
            })
            list
                .on("click", (event) => {
                    let ethis = event.target
                    let text = $(ethis).text()
                    let val = $(ethis).data("val")
                    $(this)
                        .text(text)
                        .siblings("input")
                        .val(val)
                        .trigger("input")
                    list.off()
                })
        })
    })
})()
main.on("input", "input[data-id]", function () {
    //input應用設置
    const id = this.dataset.id
    const $this = $(this)
    const val = $this.val() as string
    console.log(id + ":" + val)
    eel.app_setting(id, val)()
    switch(this.type){
        case "color":
            //input顏色
            $(this).parent().css("background-color", val)
            break
        case "file":
            $this.siblings("p").html(val==="BSnone"||val===""?"點擊選擇檔案":val)
            break
    }
})
.on("contextmenu", "input", function (event) {
    //color 右鍵刪除
    event.preventDefault()
    const id = this.dataset.id
    const $this = $(this)
    switch(this.type){
        case "color":
            eel.app_setting(id,"BSdel")
            $this.parent().css("background-color","")
            break
        case "file":
            eel.app_setting(id,"BSdel")
            $this.siblings("p").html("點擊選擇檔案")
            break
    }
}).on("click", ".checkbox", function () {
    //checkbox應用設置
    let $this = $(this)
    let input = $this.find("input")
    let id = input.data("checkbox")
    let val = !(input.prop("checked"))

    $(this)[val?"addClass":"removeClass"]("checked")
    input.prop("checked",val)
    console.log(id + ":" + val)
    eel.app_setting(id, val)()
}).on("contextmenu input",".theme_color input",function(){
    change_app_color(true)
}).on("change","#chg_bg_img",function(event){
    const reader = new FileReader()
    reader.addEventListener("load",function(event:any){
        localStorage.setItem("better_steam_tool$bg_image",event.target.result)
        change_app_image()
    })
    reader.readAsDataURL(event.target.files[0])
}).on("contextmenu","#chg_bg_img",function(event){
    localStorage.removeItem("better_steam_tool$bg_image")
    $("body").css({"background-image":"none"})
})

console.log("settings is ready")