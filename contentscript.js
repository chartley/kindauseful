var KindaUsefulContent = {
  init: function() {
    KindaUsefulContent.listenForMessages();
  },

  listenForMessages: function() {
    chrome.runtime.onMessage.addListener(
      function (request, sender, sendResponse) {
        if ($('.kinda-useful-top').length) return;  // possible to get duplicate webNavigation.onCompleted callbacks, so just render the first

        if (request.action === "displayTasks") {
          KindaUsefulContent.displayTasks();
        } else {
          $('body').prepend('<div class="kinda-useful-top error-alert"">ERROR</div>');
        }
      }
    );
  },

  displayTasks: function() {
    var asanaManager = new AsanaManager()
      , asanaTasks = asanaManager.get('tasks')
      , randomIndex = Math.floor(Math.random()*asanaTasks.length)
      , asanaTask = asanaTasks.at(randomIndex);
    $('body').prepend('<div class="kinda-useful-top task-list">Task: ' + asanaTask.get('name') + '</div>');
  }
};

KindaUsefulContent.init();
