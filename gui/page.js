window.onresize = function (){
    window.resizeTo(300, 600);
}

footer=$('footer')
main=$('main#main_contant')

$('#menu_toggle').on('click',function(){
    footer.slideToggle()
})

tmp={};
footer.on('click','button',function(){
    footer.slideUp()
    var id=this.id
    console.log("open \""+id+"\" page")
    $.get("/page/"+id+".html",function(data){
        main.off() //刪除監聽
        main.html(data) //寫入數據
        if(tmp[id]){
            $.getScript("/page/"+id+".js")
        }
        eval(id())
    })
})