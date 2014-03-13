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
    // get task(s)
    var asanaManager = new AsanaManager()
      , allAsanaTasks = asanaManager.get('tasks')
      , shuffledTasks = allAsanaTasks.shuffle()
      , selectedAsanaTasks = shuffledTasks.slice(0, 3);

    // add modal div and templates to the page; update background (can't ref files from css)
    $.ajax({
      url: chrome.extension.getURL("templates/overlay.html"),
      async: false,
      success: function(result) {
        $('body').append($.parseHTML(result));
      }
    });

    // render templates
    _.each(selectedAsanaTasks, function(asanaTask) {
      var asanaTaskView = new AsanaTaskView({model: asanaTask});
      $('.kinda-useful-modal .task-list ul').append(asanaTaskView.render().$el);
    });

    // launch modal
    $('.kinda-useful-modal').easyModal({
      autoOpen: true,
      overlayClose: false
    });
  }
};

KindaUsefulContent.init();
