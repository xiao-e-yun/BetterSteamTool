/// <reference path="../page.ts" />
main.on("click", ".items>h2", function () {
    $(this).siblings().slideToggle();
});
console.log("settings is ready");
