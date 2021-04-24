window.onresize = function () {
    window.resizeTo(300, 600);
}

footer=$('footer')
main=$('main#main_contant')

$('#menu_toggle').on('mousedown',function(){
    footer.slideToggle()
})

tmp={};
footer.on('click','button',function(){
    footer.slideUp()
    load_page(this.id)
})

function load_page(id, href = false) {
    console.log("open \"" + id + "\" page")
    $.get("/page/" + id + ".html" , function (data) {
        main.off() //刪除監聽
        main.html(data) 
    })
}