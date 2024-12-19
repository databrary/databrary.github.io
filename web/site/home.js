'use strict';

app.controller('site/home', [
  '$scope', 'constantService', 'displayService', 'volume', 'tags', 'activity', '$location',
  function ($scope, constants, display, volume, tags, activity, $location) {
    display.title = constants.message('welcome.title');
    $scope.volume = volume;
    $scope.tags = tags;
    $scope.activity = activity.activity;
    $scope.stats = activity.stats;
    var modal = document.getElementById('loginModal');

    $('.modal-button').click(function(e) {
        e.preventDefault();
        modal.style.display = "block";
        $('input#loginEmail').focus();
    });

    $('.modal .close, .modal a[href="/user/password"], .modal a[href="/user/register"]').click(function() {
        modal.style.display = "none";
    });

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    $('.site-footer-grants').hide();

    $scope.$on('$locationChangeStart', function( event ) {
        $('.site-footer-grants').show();
    });

  }
]);
