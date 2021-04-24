$(() => {
    window.onresize = function () {
        window.resizeTo(300, 600);
    };
    var footer = $('footer');
    var main = $('main#main_contant');
    var page = {};
    $('#menu_toggle').on('mousedown', function () {
        footer.slideToggle();
    });
    footer.on('click', 'button', function () {
        footer.slideUp();
        load_page(this.id);
    });
    function load_page(id, href = false) {
        console.log("open \"" + id + "\" page");
        page[id] = {};
        $page = page[id];
        $.get("/page/" + id + ".html", function (data) {
            main.off(); //刪除監聽
            main.html(data);
            $.getScript("/js/page/" + id + ".js");
        });
    }
});
