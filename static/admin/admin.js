document.addEventListener('DOMContentLoaded', function () {
  document.querySelector("#title").addEventListener('input', autoResize, false);

  function autoResize() {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
  }

  // Trigger the resize on page load in case there is pre-filled content
  setTimeout(function() {
    var titleElement = document.querySelector("#title");
    titleElement.style.height = 'auto';
    titleElement.style.height = titleElement.scrollHeight + 'px';
  }, 100);
});
