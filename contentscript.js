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
      , asanaTasks = asanaManager.get('tasks')
      , randomIndex = Math.floor(Math.random()*asanaTasks.length)
      , asanaTask = asanaTasks.at(randomIndex);

    // add modal div and templates to the page
    $.ajax({
      url: chrome.extension.getURL("templates/overlay.html"),
      async: false,
      success: function(result) {
        $('body').append($.parseHTML(result));
      }
    });

    // render templates
    var taskTemplate = $("#kinda-useful-task-template").html() || ""
      , taskTemplateData = {taskName: asanaTask.get('name')};
    $('.kinda-useful-modal .task-list ul').append(_.template(taskTemplate, taskTemplateData));

    // launch modal
    $('.kinda-useful-modal').easyModal().trigger('openModal');
  }
};

KindaUsefulContent.init();
