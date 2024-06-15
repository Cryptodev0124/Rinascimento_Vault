window.onscroll = function () { myFunction() };
function myFunction() {
    var header = document.getElementById("myHeader");
    var sticky = header.offsetTop;
    if (window.pageYOffset > sticky) {
        header.style.position = "fixed";
        header.style.backdropFilter = "blur(24px)"
        header.style.background = "#040f377a";
    } else {
        header.style.background = "transparent";
        header.style.backdropFilter = "none";
    }
}