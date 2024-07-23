document.addEventListener('DOMContentLoaded', function() {
    var year = document.getElementsByClassName('year');
    for (var i = 0; i < year.length; i++) {
        year[i].textContent = new Date().getFullYear();
    }
});