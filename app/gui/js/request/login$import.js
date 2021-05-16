"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
w = 270;
h = 550;
let $body = $("body");
$body
    .on("click", ".item", function () {
    return __awaiter(this, void 0, void 0, function* () {
        let TSdata = this.dataset;
        if (yield eel.user_login(TSdata.name, TSdata.pwd)()) {
            //done
            opener["need_reload"]();
            window.close();
        }
    });
})
    .on("click", ".item>p", (event) => {
    event.stopPropagation();
});
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        let user_list = yield eel.get_account_list()();
        $.each(user_list, (sid, users) => {
            $body.append(`
        <div class="item" data-name="${users.name}" data-pwd="${users.pwd}" style="background-image:url('${users.avatar_url}');">
            <p>${users.persona_name}</p>
        </div>
        `);
        });
    });
})();
