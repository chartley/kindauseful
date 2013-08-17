var KindaUsefulBackground = {
  init: function() {
    KindaUsefulBackground.loadTasksFromAsana();
    KindaUsefulBackground.subscribeToNavigation();
  },

  loadTasksFromAsana: function() {
    KindaUsefulBackground.tasks = [
      {
        'title': 'Update Detail',
        'url': 'https://app.asana.com/0/5596143442092/7323792783802'
      }
    ];
  },

  listenForNavMessages: function() {
    chrome.runtime.onMessage.addListener(
      function (request, sender, sendResponse) {
        if (request.action === 'nav') {
          sendResponse({tasks: KindaUsefulBackground.tasks});
        }
      }
    );
  },

  subscribeToNavigation: function() {
    // listen for nav event: http://developer.chrome.com/extensions/webNavigation.html#event-onCompleted
    chrome.webNavigation.onCompleted.addListener(function (details) {
      if (details.frameId > 0) return; // ignore subframe navs, eg Facebook widgets on other sites
      var tasksData = {
        action: 'displayTasks',
        tasks: KindaUsefulBackground.tasks,
        triggerUrl: details.url
      };
      chrome.tabs.sendMessage(details.tabId, tasksData, function(response) {

      });
    }, { // now filter for URLs to listen on
      url: [
        {hostSuffix: '9gag.com'},
        {hostSuffix: 'facebook.com'}
      ]
    });
  }
};

KindaUsefulBackground.init();
