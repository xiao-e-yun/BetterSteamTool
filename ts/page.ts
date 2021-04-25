declare var $page:any
declare var page:any
declare var footer:JQuery<HTMLElement>
declare var main:JQuery<HTMLElement>
declare function open_page(id:string): void

$(()=>{
window.onresize = function () {
    window.resizeTo(300, 600)
}

window["footer"]=$('footer')
window["main"]=$('main#main_contant')
window["page"]={}

if(opener){
    let I=setInterval(()=>{
        if(opener===null){
            window.close()
        }
    },500)
}

$("#sys_disabled").hide()
window["open_page"] = function(id){ 
    let win=window.open("/request/"+id+".html","","app=true")
    let dis=$("#sys_disabled")
    //關閉時啟用
    let I=setInterval(()=>{
        dis.fadeIn()
        if(win.closed===true){
            dis.fadeOut()
            console.log("it was closed")
            clearInterval(I)
        }
    },100)
}

$('#menu_toggle').on('mousedown',function(){
    footer.slideToggle()
})

footer.on('click','button',function(){
    footer.slideUp()
    load_page(this.id)
})

function load_page(id:string) {
    console.log("open \"" + id + "\" page")
    page[id] = {}
    $page = page[id]
    $.get("/page/" + id + ".html" , function (data) {
        main.off() //刪除監聽
        main.html(data)
        $.getScript("/js/page/"+id+".js")
    })
}
})