'use strict'

app.directive 'volumeEditLinksForm', [
  'constantService', 'messageService',
  (constants, messages) ->
    restrict: 'E'
    templateUrl: 'volume/editLinks.html'
    link: ($scope) ->
      volume = $scope.volume
      form = $scope.volumeEditLinksForm

      blank = () ->
        form.data.push
          head: ''
          url: ''

      update = ->
        form.data = _.map volume.links, (ref) ->
          head: ref.head
          url: ref.url
        blank()

      update()

      form.change = () -> 
        blank() unless form.data[form.data.length-1].url == ''
        form.validator.server {}

      form.remove = (ref, i) ->
        ref.removed = true
        ref.head = ''
        ref.url = ''
        $scope.removed = true

      form.save = () ->
        messages.clear(form)
        data = _.filter form.data, (ref) -> !ref.removed && (ref.head || ref.url)
        form.$setSubmitted()
        volume.saveLinks(data).then(() ->
            form.validator.server {}
            update()

            messages.add
              type: 'green'
              body: constants.message('volume.edit.success')
              owner: form

            delete $scope.removed
            form.$setPristine()
            return
          , (res) ->
            form.$setUnsubmitted()
            form.validator.server res

            messages.addError
              body: constants.message('volume.edit.error')
              report: res
              owner: form
            return
          )

      return
]
