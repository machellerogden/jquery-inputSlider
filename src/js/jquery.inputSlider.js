(function ($) {
  var throttled, throttleTo;

  // throttle
  throttled = false;
  throttleTo = 10;
  window.setTimeout(function throttle() {
    throttled = false;
    window.setTimeout(throttle, throttleTo);
  }, throttleTo);

  $.fn.extend({
    // activates inputSlider component on given element
    inputSlider: function () {
      var $body, $slider, $input, $rail, $handle, railWidth, range, min, max, lastPx, initHx, inputVal, grab, drag, release;

      // refs
      $body = $('body');
      $slider = $(this);

      // create new elements
      $rail = $('<rail />');
      $handle = $('<handle />');

      // add new elements
      $rail.append($handle);
      $slider.append($rail);

      // important numbers
      min = parseInt($slider.attr('min'), 10);
      max = parseInt($slider.attr('max'), 10);
      range = max - min;
      railWidth = parseInt($rail.width(), 10);
      lastPx = false;
      inputVal = parseInt($slider.attr('value'), 10);
      initHx = parseInt((((inputVal * (range / 100)) / range) * railWidth), 10);

      // set initial handle position
      $handle.css('left', initHx + 'px');

      // create input
      $input = $('<input />');

      // config input
      $input.attr('type', 'hidden');
      $input.attr('name', $slider.attr('name'));
      $input.attr('value', inputVal);

      // add input
      $slider.prepend($input);

      // event handler for grabbing the `handle` element
      grab = function () {
        $slider.on('mousemove', drag);
      };

      // event handler for dragging the `handle` element
      drag = function (event) {
        var px, hx, dx, newHx, newInputVal;

        // if not throttled...
        if (!throttled) {

          // ensure cursor is the hand...
          // this is in CSS too but can get tripped up if your cursor leaves the handle
          $slider.css('cursor', 'pointer');

          // get page x
          px = event.pageX;
          // if last page x false, set last page x to page x and return immediately
          if (!lastPx) {
            lastPx = px;
            return;
          }

          // calc delta page x
          dx = px - lastPx;

          // get current handle x
          hx = parseInt($handle.css('left'), 10);

          // calc new handle x
          newHx = hx + dx;
          newHx = (newHx < 1) ? 0 : newHx;
          newHx = (newHx > railWidth) ? railWidth : newHx;

          // update handle position
          $handle.css('left', newHx + 'px');

          // update input value
          newInputVal = Math.round((range * (newHx / railWidth) + min));
          $slider.attr('value', newInputVal);
          $input.attr('value', newInputVal);

          // set last page x
          lastPx = px;

          // reenable to the throttle check
          throttled = true;
        }
      };

      // event handler for releasing the `handle` element
      release = function () {
        // set cursor back to auto
        $slider.css('cursor', 'auto');
        // remove all mousemove events from slider
        $slider.off('mousemove');
        // reset last page x
        lastPx = false;
      };

      // prevent select on move
      $slider.on('selectstart', function () { return false; }); // ie
      $slider.on('mousedown', function () { return false; }); // moz

      // attach event handlers
      $handle.on('mousedown', grab);
      $body.on('mouseup', release);
      $body.on('mouseleave', release);
    }
  });

  $(document).ready(function () {
    $('input-slider').each(function (i, el) {
      $(el).inputSlider();
    });
  });

})(jQuery);
