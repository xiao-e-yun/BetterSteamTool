/// <reference path="../page.ts" />
$page.account = localStorage.getItem('guard_acc');
$("#new-account>button").on("click", function () {
    open_page("guard$" + this.id)
})

console.log("guard is ready");