var AsanaTask = Backbone.Model.extend({
  defaults: {
    id: null,
    name: "Undefined"
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
              // TODO: sort by assignee_status, etc to prioritize those which are important
            asanaTasks = new AsanaTaskCollection(incompletetasks);
          } else {
            console.log("getUserData failed", result);
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
    this.set('tasks', AsanaTaskCollection.createForUserWorkspaces(this.get('user')));
  }
});
