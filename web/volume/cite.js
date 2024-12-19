'use strict';

app.directive('citeVolume', [
  '$location',
  function ($location) {
    var link = function ($scope) {
      var volume = $scope.volume;

      var authors = _.map(volume.owners, function (owner) {
        var name = owner.name;
        var author;

        var i = name.lastIndexOf(', '); // could equally incorrectly be indexOf
        if (i < 0)
          author = name;
        else {
          i += 2;
          author = name.substr(0, i);
          do {
            while (name.charAt(i) == ' ')
              i++;
            author += name.charAt(i) + '.';
          } while ((i = name.indexOf(' ', i)+1) > 0);
        }
        return author;
      });

      authors.push(authors.splice(-2, 2).join(' & '));
      $scope.authors = authors.join(', ');
      $scope.today = new Date();
      $scope.permalink = (volume.doi ? 'http://doi.org/' + volume.doi : $location.absUrl());
    };

    return {
      restrict: 'E',
      templateUrl: 'volume/cite.html',
      scope: false,
      replace: true,
      link: link
    };
  }
]);
