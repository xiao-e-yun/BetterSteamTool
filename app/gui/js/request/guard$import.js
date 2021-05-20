"use strict";
w = 400;
h = 200;
main = $("main");
$("#get_mafile_input").on('change', (el) => {
    let input = $(el.target);
    let from = $("#get_mafile>p");
    let val = input.val();
    if (val === "") {
        from.text("未選取文件");
        return;
    }
    from.text(val);
    const file = input[0].files[0];
    const reader = new FileReader();
    reader.onload = async () => {
        const req = reader.result;
        const status = await eel.import_shared_secret(req)();
        if (status === true) {
            opener["reload_guard_account"]();
            close();
        }
        else {
            switch (status) {
                case ("login_error"):
                    break;
                case ("acc_not_found"):
                    break;
            }
        }
    };
    reader.readAsText(file);
});
