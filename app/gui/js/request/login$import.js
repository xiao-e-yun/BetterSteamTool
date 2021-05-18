"use strict";
w = 270;
h = 550;
let $body = $("body");
$body
    .on("click", ".item", async function () {
    let TSdata = this.dataset;
    if (await eel.user_login(TSdata.name, TSdata.pwd)()) {
        //done
        opener["need_reload"]();
        window.close();
    }
})
    .on("click", ".item>p", (event) => {
    event.stopPropagation();
});
(async function () {
    let user_list = await eel.get_account_list()();
    $.each(user_list, (sid, users) => {
        $body.append(`
        <div class="item" data-name="${users.name}" data-pwd="${users.pwd}" style="background-image:url('${users.avatar_url}');">
            <p>${users.persona_name}</p>
        </div>
        `);
    });
})();
