w = 800
h = 500;

(async () => {
    let url = new URL(location.href);
    let sid = (url.searchParams.get('Sid')).toString()
    console.log(`steamID = `+sid)
    let acc_list = await eel.get_account_list()()
    let acc = acc_list[sid]
    try {
        document.title = `正在編輯 ` + acc.persona_name
    } catch {
        $("#loading>p").text("無使用者")
        await sleep(15000);
        window.close()

        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
    }
    $("#loading").fadeOut()
})()