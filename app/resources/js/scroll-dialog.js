document.addEventListener('DOMContentLoaded', function() {
  const dialog = document.querySelector('.dialog-scrolling');
  const openButton = dialog.nextElementSibling;
  const closeButton = dialog.querySelector('sl-button[slot="footer"]');

  openButton.addEventListener('click', () => dialog.show());
  closeButton.addEventListener('click', () => dialog.hide());

  const dialog2 = document.querySelector('.dialog-scrolling-2');
  const openButton2 = dialog2.nextElementSibling;
  const closeButton2 = dialog2.querySelector('sl-button[slot="footer"]');
  
  openButton2.addEventListener('click', () => dialog2.show());
  closeButton2.addEventListener('click', () => dialog2.hide());
});