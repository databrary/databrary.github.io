'use strict'

# Expose (or create a new dummy) form control to scope

app.directive 'formCtrl', [
  '$parse',
  ($parse) ->
    restrict: 'A'
    require: ['^form', '?ngModel']
    link: ($scope, $element, $attrs, $ctrls) ->
      ctrl = $ctrls[1]
      unless ctrl
        ctrl =
          $untouched: true
          $touched: false
          $pristine: true
          $dirty: false
          $valid: true
          $invalid: false
          $setPristine: () ->
            @$dirty = false
            @$pristine = true
            @$$parentForm.subformControl?.$setPristine()
            return
          $setDirty: () ->
            @$dirty = true
            @$pristine = false
            @$$parentForm.$setDirty()
            return
          $setUntouched: () ->
            @$touched = false
            @$untouched = true
            return
          $setTouched: () ->
            @$untouched = false
            @$touched = true
            return
        $ctrls[0].$addControl(ctrl)

      $parse($attrs.formCtrl).assign($scope, ctrl)
      return
]
