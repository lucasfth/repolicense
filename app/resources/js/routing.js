document.addEventListener('DOMContentLoaded', function() {
    const navRadioGroup = document.getElementById('nav-radio-group');
    navRadioGroup.addEventListener('sl-change', function(event) {
        if (event.target.value === '1') {
            window.location.href = 'index.html';
        } else if (event.target.value === '2') {
            window.location.href = 'info.html';
        }
    })
});