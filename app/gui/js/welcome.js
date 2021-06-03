"use strict";
main.on("click", "h2", function () {
    let $this = $(this);
    let content = $this.siblings();
    let other = $this.parent().siblings("div.card").children("div");
    other.slideUp();
    content.slideToggle();
});
