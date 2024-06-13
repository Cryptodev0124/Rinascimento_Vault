window.onscroll = function() {myFunction()};
var header = document.getElementById("myHeader");
console.log("header", document.getElementById("myHeader"));
var sticky = header.offsetTop;
function myFunction() {
    if (window.pageYOffset > sticky) {
        header.style.position = "block";
        header.style.background = "#000000";
    } else {
        header.style.background = "#ffffff";
    }
}