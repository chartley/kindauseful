var AsanaTask = Backbone.Model.extend({
  defaults: {
    id: null,
    name: "Undefined"
  },

  getURL: function(callback) {
    var taskId = this.get("id");
    $.ajax({
      dataType: "json",
      url: "https://app.asana.com/api/1.0/tasks/" + taskId,
      async: false,
      success: function(result) {
        if (result && result.data) {
          var project = result.data.projects[0].id
            , taskURL = "https://app.asana.com/0/" + project + "/" + taskId;
          callback(taskURL);
        } else {
          console.log("AsanaTask.getURL() failed to parse", result);
          callback(null);
        }
      },
      error: function(result) {
        console.log("AsanaTask.getURL() error", result);
        callback(null);
      }
    });
  }
});

var AsanaTaskView = Backbone.View.extend({
  tagName: 'li',
  attributes: { class: 'task-item' },
  events: {
    "click button.open:not(.disabled)":      "open",
    "click button.done:not(.disabled)":      "done",
    "click button.dismiss:not(.disabled)":   "dismiss"
  },

  render: function() {
    var template = _.template($("#kinda-useful-task-template").html());
    this.$el.html(template(this.model.attributes));
    return this;
  },

  open: function() {
    this.model.getURL(function(url) {
      window.open(url, '_blank').focus();
    });
  },
  done: function() {
    this.$el.fadeOut();
    // TODO: persist this to the server
  },
  dismiss: function() {
    // TODO: save to local storage so we don't show this again for 24 hours
    this.$el.fadeOut();
  }
});

var AsanaUser = Backbone.Model.extend({
  },
  // static
  {
    createForCurrentUser: function() {
      var asanaUser = null;
      $.ajax({
        dataType: "json",
        url: "https://app.asana.com/api/1.0/users/me",
        async: false,
        success: function(result) {
          if (result && result.data) {
            asanaUser = new AsanaUser({
              id: result.data.id,
              name: result.data.name,
              email: result.data.email,
              photo: result.data.photo,
              workspaces: result.data.workspaces
            });
          } else {
            console.log("getUserData failed", result);
          }
        },
        error: function(jqXHR, textStatus, errorThrown) {
          console.log('AsanaUser.createForCurrentUser() failure', errorThrown);
          asanaUser = new AsanaUser({
            error: errorThrown
          });
        }
      });

      return asanaUser;
    }
  }
);

var AsanaTaskCollection = Backbone.Collection.extend({
    model: AsanaTask
  },
  // static
  {
    DEFAULT_PROJECT: null,

    createForUserWorkspaces: function(asanaUser) {
      // determine the workspace; by default will take from "Personal Projects" which everyone
      // has as per https://asana.com/guide/learn/workspaces/personal
      var workspaces = asanaUser.get('workspaces')
        , personalProjectWorkspace = _.find(workspaces, function(workspace) { return workspace["name"] === "Personal Projects"; })
        , workspace = typeof(personalProjectWorkspace) !== 'undefined' ? personalProjectWorkspace : _.first(workspaces);

      // query tasks for this user / workspace as per http://developer.asana.com/documentation/#tasks
      var asanaTasks = null;
      $.ajax({
        dataType: "json",
        url: "https://app.asana.com/api/1.0/workspaces/" + workspace.id + "/tasks",
        data: {
          assignee: asanaUser.get('id'),  // required when specifying a workspace
          completed_since: "now"          // only return incomplete tasks
        },
        async: false,
        success: function(result) {
          if (result && result.data) {
            var rawTasks = result.data
              , incompletetasks = _.filter(rawTasks, function(task) { return !(task.completed); });
            asanaTasks = new AsanaTaskCollection(incompletetasks);
          } else {
            console.log("createForUserWorkspaces failed", result);
          }
        }
      });
      return asanaTasks;
    },

    createForUserProject: function(asanaUser, projectId) {
      // query tasks for this user / workspace as per http://developer.asana.com/documentation/#tasks
      var asanaTasks = null;
      $.ajax({
        dataType: "json",
        url: "https://app.asana.com/api/1.0/tasks",
        data: {
          project: projectId,
          completed_since: "now"          // only return incomplete tasks
        },
        async: false,
        success: function(result) {
          if (result && result.data) {
            var rawTasks = result.data
              , incompletetasks = _.filter(rawTasks, function(task) { return !(task.completed); });
            asanaTasks = new AsanaTaskCollection(incompletetasks);
          } else {
            console.log("createForUserProject failed", result);
          }
        }
      });
      return asanaTasks;
    }
  }
);

var AsanaManager = Backbone.Model.extend({
  initialize: function() {
    this.set('user', AsanaUser.createForCurrentUser());

    if (this.get('user').has('error')) {
      this.set('error', 'Unable to get user data: ' + this.get('user').get('error'));
      this.fakeInitialize();
    } else if (AsanaTaskCollection.DEFAULT_PROJECT !== null) {
      this.set('tasks', AsanaTaskCollection.createForUserProject(this.get('user'), AsanaTaskCollection.DEFAULT_PROJECT));
    } else {
      this.set('tasks', AsanaTaskCollection.createForUserWorkspaces(this.get('user')));
    }
  },

  // fake init for fast testing
  fakeInitialize: function() {
    this.set('tasks', new AsanaTaskCollection([
      { id: 123, name: 'Order birthday flowers for Helen' },
      { id: 124, name: 'Return call from Butch (Progressive)' },
      { id: 125, name: 'Book blood donation' }
    ]));
  }
});
