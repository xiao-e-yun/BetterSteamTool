w = 400
h = 200
main = $("main")

$("#get_mafile_input").on('change', (el) => {
    let input: any = $(el.target)
    let from = $("#get_mafile>p")
    let val: any = input.val()
    if (val === "") {
        from.text("未選取文件")
        return
    }
    from.text(val)

    const file = input[0].files[0]
    const reader = new FileReader()
    reader.onload = async () => {
        const req: any = reader.result
        const status = await eel.import_shared_secret(req)()
        if (status == true) {
            opener["reload_guard_account"]()
            close()
        } else {
            let json_req = JSON.parse(req)
            open_page("settings$create", {
                username: json_req["account_name"]
                , req: req
                , login_2FA:async (req)=>{
                    return await eel.shared_secret_to_2FA(req)()
                }
                , callback: async (req) => {
                    let status = await eel.import_shared_secret(req, true)()
                    if (status == true) {
                        opener["reload_guard_account"]()
                        close()
                    } else {
                        console.error("unknow error:" + status)
                    }
                }
            })
        }
    }
    reader.readAsText(file);
})