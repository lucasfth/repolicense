const tooltips = document.querySelectorAll('sl-tooltip');

document.addEventListener('DOMContentLoaded', function() {
    // if the user is on a mobile device, disable tooltips
    if (window.innerWidth <= 700) {
        tooltips.forEach(tooltip => {
            tooltip.disabled = true;
        });
    }
});