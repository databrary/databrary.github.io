'use strict';
app.directive('homeContainer', [
  '$document', function($document) {
    return {
      restrict: 'A',
      link: function($scope, $element, $attrs) {
        //arrow on click slide to the next section
        $('.arrow-container').click(function(){
          $('html, body').animate({
                scrollTop: $(this).closest('.section').next('.section').find('h2').offset().top - 50
            }, 1000);
        });
        //nyu slider
        var streamWidth = 0;
        $('.stream li').each(function(){
          streamWidth += parseInt($(this).width(), 10);
        });
        $(".stream-nav.left").click(function () { 
            var maxWidth = streamWidth + 10 - window.innerWidth;
            var windowWidth = window.innerWidth - 80;
            $('.stream li').each(function(){
              $(this).css('margin-left', Math.min((parseInt($(this).css('margin-left'), 10) + windowWidth), 0) + 'px');
              $(this).css('margin-right', Math.max((parseInt($(this).css('margin-right'), 10) - windowWidth), 0) + 'px');
            });
        });

        $(".stream-nav.right").click(function () {
          var maxWidth = streamWidth + 10 - window.innerWidth;
          var windowWidth = window.innerWidth - 80;
          $('.stream li').each(function(){
            $(this).css('margin-left', Math.max((parseInt($(this).css('margin-left'), 10) - windowWidth), -Math.abs(maxWidth)) + 'px');
            $(this).css('margin-right', Math.min((parseInt($(this).css('margin-right'), 10) + windowWidth), maxWidth) + 'px');
          });
        });

        $('.opener').click(function(e){
          e.preventDefault();
          $(this).closest('div').next('.open-panel').slideToggle();
        });

        //testimonial carousel
        var myIndex = 0;
        var slideIndex = 1;
        var stopCarousel = false;

        function carousel() {
          if (stopCarousel === false) {
            var i;
            var x = document.getElementsByClassName("testimonial");
            if(x.length > 0){
              for (i = 0; i < x.length; i++) {
                 x[i].style.opacity = "0";
                 x[i].style.zIndex = "0";
                 x[i].getElementsByTagName("a")[0].setAttribute("tabindex", "-1");
              }
              myIndex++;
              if (myIndex > x.length) {myIndex = 1}    
              x[myIndex-1].style.opacity = "1";
              x[myIndex-1].style.zIndex = "2"; 
              x[myIndex-1].getElementsByTagName("a")[0].setAttribute("tabindex", "0");
              slideIndex = myIndex;
            
              setTimeout(carousel, 8000);
            }
          }
        }

        carousel();

        function showDivs(n) {
          var i;
          var x = document.getElementsByClassName("testimonial");
          if (n > x.length) {slideIndex = 1} 
          if (n < 1) {slideIndex = x.length} ;
          for (i = 0; i < x.length; i++) {
              x[i].style.opacity = "0";
              x[i].style.zIndex = "0";
              x[i].getElementsByTagName("a")[0].setAttribute("tabindex", "-1");
          }
          x[slideIndex-1].style.opacity = "1";
          x[slideIndex-1].style.zIndex = "2";
          x[slideIndex-1].getElementsByTagName("a")[0].setAttribute("tabindex", "0");
        }

        $scope.plusDivs = function(n) {
          stopCarousel = true;
          showDivs(slideIndex += n);
        }

        $('.testimonials').mouseenter(function(){
          stopCarousel = true;
        })

        jQuery(function($) {
          // Asynchronously Load the map API 
          var script = document.createElement('script');
          script.innerHTML = "var mymap = L.map('map_canvas', { scrollWheelZoom: false }).setView([24.215527, -12.885834], 2);L.tileLayer.provider('Esri.WorldStreetMap').addTo(mymap);markers.map((place) => { L.marker([place[1], place[2]]).bindPopup(place[0]).addTo(mymap) });";
          document.getElementsByTagName("main")[0].appendChild(script);
        });

        function getUnique(count) {
          var arrayVideo = [
            ["554", "controls", "", "/slot/23424/0,41984/asset/102588/download?inline=true", "Trehub, S.E. &amp; Cirelli, L. (2017). Naturalistic Examples of Infant/Toddler Musical Engagement.", "B7.554"],
            ["46", "controls", "", "/slot/9861/-/asset/11368/download?inline=true", "Vishton, P. (2014). Different Gestalt processing for different actions? Comparing object-directed reaching and looking time measures.", "B78G6V"],
            ["595", "controls", "", "/slot/25319/0,7108/asset/112350/download?inline=true", "Adolph, K. (2018). Excerpt: The organization of exploratory behaviors in infant locomotor planning.", "B7.595"],
            ["596", "controls", "", "/slot/25322/0,12912/asset/112356/download?inline=true", "Adolph, K. &amp; Tamis-LeMonda, C. (2018). Excerpt: Learning the Designed Actions of Everyday Objects.", "B7.596"],
            ["112", "controls", "", "/slot/9860/-/asset/16631/download?inline=true", "Fausey, C.M., Smith, L.B. &amp; Jayaraman, S. (2015). From faces to hands: Changing visual input in the first two years.", "B7JS39"],
            ["38", "controls", "", "/slot/9817/-/asset/11240/download?inline=true", "Frank, M.C. (2014). The development of predictive processes in children’s discourse understanding.", "B72018"],
            ["1", "controls", "", "/slot/17886/16852000,16916503/asset/84000/download?inline=true", "Adolph, K., Gilmore, R.O. &amp; Staff (2013). Databrary sponsored workshops and events.", "B7159Q"],
            ["70", "", "/slot/11883/-/asset/45810/download?inline=true", "", "Adolph, K., Baker, D. (2014). Arnold Gesell’s Films of Infant and Child Development.", "B7.70"],
            ["27", "controls", "", "/slot/11141/0,5000/asset/37968/download?inline=true", "Wilkinson, K. (2014). Preliminary investigation of visual attention to human figures in photographs: Potential considerations for the design of aided AAC visual scene displays.", "B7G59R"],
            ["44", "controls", "", "/slot/9809/-/asset/11354/download?inline=true", "Naigles, L. (2014). Children use syntax to learn verb meanings.", "B7J01M"],
            ["326", "controls", "/slot/16668/-/asset/73157/download?inline=true", "/slot/16668/0,140984/asset/72645/download?inline=true", "Bahrick, L.E. (2017). Multisensory Attention Assessment Protocol (MAAP).", "B7.326"],
            ["336", "controls", "/slot/16670/-/asset/73158/download?inline=true", "/slot/16670/0,67110/asset/72647/download?inline=true", "Bahrick, L.E. (2017). Intersensory Processing Efficiency Protocol (IPEP).", "B7.336"],
            ["330", "controls", "", "slot/16570/51810262,51849602/asset/113441/download?inline=true", "Bergelson, E. (2017). SEEDLingS 6 Month.", "B7.330"],
          ]
          // Make a copy of the array
          var tmp = arrayVideo.slice();
          var ret = [];
          
          for (var i = 0; i < count; i++) {
            var index = Math.floor(Math.random() * tmp.length);
            var removed = tmp.splice(index, 1);
            // Since we are only removing one element
            var removedHtml = '<div class="block features full-height"><a target="_blank" href="/volume/' + removed[0][0] + '"><span class="accessible-hidden">Video for ' + removed[0][4] + '</span><div class="asset-display"><video ' + removed[0][1] + ' poster="' + removed[0][2] + '"><source type="video/mp4" src="' + removed[0][3] + '"></video></div></a><p class="citation">' + removed[0][4] + ' <em>Databrary</em>. <a href="http://doi.org/10.17910/' + removed[0][5] + '" target="_blank">http://doi.org/10.17910/' + removed[0][5] + '</a>.</p></div>';
            ret.push(removedHtml);
          }
          return ret;  
        }
        if (!sessionStorage.getItem('videolist')) {
          var videolist = getUnique(5);
          sessionStorage.setItem('videolist', JSON.stringify(videolist));
        }

        $('.ord-1').each(function(){
          if (sessionStorage.getItem('videolist')) {
            $(this).append(JSON.parse(sessionStorage.getItem('videolist'))[$('.ord-1').index($(this))]);
          } else {
            $(this).append(videolist[$('.ord-1').index($(this))]);
          }
          //stop video if the user plays another video
          $('video').each(function(){
            $(this).on('play', function(){
              $('video').not($(this)).each(function(){
                $(this).get(0).pause();
              });
            });
          });
          
        });

        //no hover for div with no a href
        $('a.ui-link').each(function(){
          if($(this).attr("href")) {
            $(this).closest('div.block').addClass('hover');
          } else {
            $(this).css('cursor', 'text');
          }
        });

        var tagFlip = setInterval(function(){
          $('.tag-flip:visible').fadeOut(function(){
            $('.tag-flip').not($(this)).fadeIn();
          });
        }, 5000);

        $scope.$on('$destroy', function(){
          if(google !== null && typeof google === 'object' && typeof google.maps === 'object'){
            google.maps = null;
          }
          var i;
          var x = document.getElementsByTagName("script");
          for (i = 0; i < x.length; i++) {
            if(x[i].src.indexOf('https://maps.googleapis.com') !== -1){
              x[i].parentNode.removeChild(x[i]);
            }
          }
          clearInterval(tagFlip);
        });
 
      }
    };
  }
]);
