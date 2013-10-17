(function ($) {

  // global throttle
  var throttled, throttleTo;
  throttled = false;
  throttleTo = 20; // throttle to 20ms (50 events/second)
  window.setTimeout(function throttle() {
    throttled = false;
    window.setTimeout(throttle, throttleTo);
  }, throttleTo);

  $.fn.extend({
    // activates inputSlider component on given element
    inputSlider: function (options) {
      var component, defaults, $body, plugin;

      // set defaults
      defaults = {
        selector: 'input-slider',
        elements: {
          rail: {
            tag: 'rail',
            selector: 'rail',
            attrs: false
          },
          handle: {
            tag: 'handle',
            selector: 'handle',
            attrs: false
          }
        }
      };

      // extend defaults with user options
      $.extend(defaults, options);

      // if undefined or jquery object, set component to defaults.selector, otherwise use this
      component = ((this == undefined) || (this.fn && this.fn.jquery)) ? defaults.selector : this;

      $body = $('body');

      // plugin object
      plugin = {
        create: function (el) {
          var $slider, $input, $rail, $handle, railattrs, handleattrs, attr, railWidth, range, min, max, lastPx, initHx, inputVal, grab, drag, release;

          // refs
          $slider = $(el);

          // create new elements
          $rail = $('<' + defaults.elements.rail.tag + ' />');
          $handle = $('<' + defaults.elements.handle.tag + ' />');

          // add attributes to new rail element
          railattrs = defaults.elements.rail.attrs;
          if ((typeof railattrs === 'object') && (railattrs.length > 0)) {
            railattrs = defaults.elements.rail.attrs;
            for (attr in railattrs) {
              if (railattrs[attr] != undefined) $rail.attr(attr, railattrs[attr]);
            }
          }

          // add attributes to new handle element
          handleattrs = defaults.elements.handle.attrs;
          if ((typeof handleattrs === 'object') && (handleattrs.length > 0)) {
            for (attr in handleattrs) {
              if (handleattrs[attr] != undefined) $handle.attr(attr, handleattrs[attr]);
            }
          }

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
            console.log('grab');
            $slider.on('mousemove', drag);
          };

          // event handler for dragging the `handle` element
          drag = function (event) {
            console.log('drag');
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
            console.log('release');
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
        },

        // register inputSlider components
        register: function () {
          $(component).each(function (i, el) {
            plugin.create(el);
          });
        }
      };

      // register unless options were passed
      if (options == undefined) plugin.register();

      // return plugin object
      return plugin;
    }
  });
  $.inputSlider = $.fn.inputSlider;
})(jQuery);
