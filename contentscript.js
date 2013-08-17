var KindaUsefulContent = {
  init: function() {
    KindaUsefulContent.listenForMessages();
  },

  listenForMessages: function() {
    chrome.runtime.onMessage.addListener(
      function (request, sender, sendResponse) {
        if ($('.kinda-useful-top').length) return;  // possible to get duplicate webNavigation.onCompleted callbacks, so just render the first

        if (request.action === "displayTasks") {
          $('body').prepend('<div class="kinda-useful-top task-list">Tasks: ' + request.triggerUrl + '</div>');
        } else {
          $('body').prepend('<div class="kinda-useful-top error-alert"">ERROR</div>');
        }
      }
    );
  }
};

KindaUsefulContent.init();
