//client id fndk5ehwtis3dcsfsqjrhhgq47hjhw

//data usually grabbed from server
var users = [
  {
    user: "MonsterCat"
  },
  {
    user: "Freecodecamp"
  },
  {
    user: "ESL_SC2"
  },
  {
    user: "OgamingSC2"
  },
  {
    user: "noobs2ninjas"
  }
];

var Channel = function(username, logo, url, game, desc, status) {
  this.user = ko.observable(username);
  this.logo = ko.observable(logo);
  this.url = ko.observable(url);
  this.game = ko.observable(game);
  this.desc = ko.observable(desc);
  this.status = ko.observable(status);
};

var ChannelViewModel = function() {
  var self = this;

  self.channels = ko.observableArray();

  self.searchChannel = function(users) {
    //first ajax call get channel info!
    for (var i = 0; i < users.length; i++) {
      var channelUrl =
        "https://api.twitch.tv/kraken/channels/" +
        users[i].user +
        "?client_id=fndk5ehwtis3dcsfsqjrhhgq47hjhw";

      var streamUrl =
        "https://api.twitch.tv/kraken/streams/" +
        users[i].user +
        "?client_id=fndk5ehwtis3dcsfsqjrhhgq47hjhw";

      function getChannels() {
        return $.get(channelUrl);
      }
      function getStreams() {
        return $.get(streamUrl);
      }

      $.when(getChannels(), getStreams())
        .done(function(r1, r2) {
          var username = r1[0].display_name;
          var logo = r1[0].logo;
          var url = r1[0].url;
          if (r2[0].stream == null) {
            var game = "";
            var desc = "";
            var status = "Offline";
          } else {
            var game = r2[0].stream.channel.game;
            var desc = r2[0].stream.channel.status;
            var status = "Online";
          }
          self.channels.push(
            new Channel(username, logo, url, game, desc, status)
          );
          //console.log(r1[0]); //[data, status, xhrObj]
          //console.log(r2[0]); //[data, status, xhrObj]
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
          console.log(jqXHR.status);
          if ((jqXHR.status == 400, 404, 422)) {
            alert("Sorry. That channel doesn't exist.");
          }
          //console.log(textStatus);
          //console.log(errorThrown);
        });
    } //end of for loop
  }; //end of searchChannel function

  //accepts array of user objects
  self.searchChannel(users);
  
  //additional function created because of deprecated default ko.startsWith doesnt work
  var stringStartsWith = function(string, filter) {
    string = string || "";
    if (filter.length > string.length) {
      return false;
    }
    return string.substring(0, filter.length) === filter;
  };

  self.filter = ko.observable("");
  //filter the items using the filter text
  self.filteredChannels = ko.computed(function() {
    var filter = self.filter().toLowerCase();
    if (!filter) {
      return self.channels();
    } else {
      return ko.utils.arrayFilter(self.channels(), function(channel) {
        return stringStartsWith(channel.user().toLowerCase(), filter);
      });
    }
  }, self);

  //press enter to add channel from input box
  self.onEnter = function(d, e) {
    if (e.keyCode === 13) {
      var search = $("#searchId").val();
      self.searchChannel([{ user: search }]);
      $("#searchId").val("");
    }
    return true;
  };

  //removing channel object from channels
  self.removeChannel = function(channel) {
    self.channels.remove(channel);
  };
}; //end of viewModel

//buttons to add and hide textbox
$("#btn-add").on("click", function() {
  $(this).addClass("hidden");
  $("#searchId").removeClass("hidden");
  $("#btn-hide").removeClass("hidden");
});

$("#btn-hide").on("click", function() {
  $(this).addClass("hidden");
  $("#searchId").addClass("hidden");
  $("#btn-add").removeClass("hidden");
});

ko.applyBindings(new ChannelViewModel());