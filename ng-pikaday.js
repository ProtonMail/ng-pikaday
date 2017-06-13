(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['angular', 'pikaday'], factory);
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('angular'), require('pikaday'));
  } else {
    // Browser globals (root is window)
    root.returnExports = factory(root.angular, root.Pikaday);
  }
}(this, function (angular, Pikaday) {

  angular.module('pikaday', [])
    .provider('pikadayConfig', function pikadayProviderFn() {

      // Create provider with getter and setter methods, allows setting of global configs

      var config = {};

      this.$get = function() {
        return config;
      };

      this.setConfig = function setConfig(configs) {
        config = configs;
      };
    })
    .directive('pikaday', ['pikadayConfig', pikadayDirectiveFn]);

  function pikadayDirectiveFn(pikadayConfig) {

    return {
      restrict: 'A',
      scope: {
        pikaday: '=',
        minDate: '=',
        maxDate: '=',
        onSelect: '&',
        onOpen: '&',
        onClose: '&',
        onDraw: '&',
        disableDayFn: '&'
      },
      require: '?ngModel',
      link: function (scope, elem, attrs, modelCtrl) {

        // Init config Object

        var config = { field: elem[0] };


        // instantiate pikaday with config, bind to scope, add destroy event callback
        var picker = new Pikaday(config);
        if (attrs.pikaday) {
          scope.pikaday = picker;
        }

        if (modelCtrl) {
          modelCtrl.$formatters.push(function (modelValue) {
            if (!modelValue) {
              return modelValue
            }
            var date = new Date(Date.parse(modelValue));
            if (date == "Invalid Date") {
              modelCtrl.$setValidity('date', false);
              return modelValue;
            }
            picker.setDate(date);
            return hasMoment? moment(date).format(picker._o.format) : date.toDateString();
          });

          modelCtrl.$parsers.push(function (viewValue) {
            console.log("push pikaday > ng-model"  + (new Date()).toISOString());
            console.log(picker.getDate().toString());
            return picker.getDate();
          });


            elem[0].addEventListener('blur', () => { modelCtrl.$setViewValue(picker.getDate().toString()); });

        }

        scope.$on('$destroy', function () {
          picker.destroy();
        });
      }
    };
  }

}));
