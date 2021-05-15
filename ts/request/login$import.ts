w = 270
h = 550
let $body = $("body")

$body
    .on("click",".item",async function(){
        let TSdata = this.dataset
        if(await eel.user_login(TSdata.name,TSdata.pwd)()){
            //done
            opener["need_reload"]()
            window.close()
        }
    })
    .on("click", ".item>p", (event) => {
        event.stopPropagation()
    })

;(async function(){
    let user_list = await eel.get_account_list()()
    user_list.forEach((users:{avatar_url: String,bg: String,lvl: Number,name: String,oauth: String,persona_name: String,pwd: String})=>{
        $body.append(`
        <div class="item" data-name="${users.name}" data-pwd="${users.pwd}" style="background-image:url('${users.avatar_url}');">
            <p>${users.persona_name}</p>
        </div>
        `)
    });
})()