'use strict'

app.factory 'tooltipService', [
  '$rootScope', '$timeout', '$document',
  ($rootScope, $timeout, $document) ->

    delay = 500
    all = {}
    list = []

    namespace = '.tooltip'
    focusElements = {INPUT:true, SELECT:true, TEXTAREA:true}
    focusEvents = {in:'focusin'   +namespace, out:'focusout'  +namespace}
    mouseEvents = {in:'mouseenter'+namespace, out:'mouseleave'+namespace}

    events = (target) ->
      if focusElements[target.prop('tagName')]
        focusEvents
      else
        mouseEvents

    class BaseTooltip
      constructor: () ->
        if @id of all
          throw new Error('duplicate Tooltip ' + @id)
        all[@id] = @

      cancelTimeout: () ->
        return unless @timeout
        $timeout.cancel(@timeout)
        @timeout = undefined

      out: () ->
        @cancelTimeout()
        if @active
          @active = undefined
          list.remove @

      remove: () ->
        delete all[@id]

    class Tooltip extends BaseTooltip
      constructor: (@message) ->
        @target = $()
        super()

      @prototype.live = false

      Object.defineProperty @prototype, 'id',
        get: () -> @message

      add: (target) ->
        ev = events(target)
        target.on ev.in, (event) =>
          @cancelTimeout()
          @timeout = $timeout () =>
              @timeout = undefined
              list.push @ unless @active
              @active = event.target
            , delay

        target.on ev.out, $rootScope.$lift () =>
          @out()

        @target = @target.add(target)
        return

      remove: (target) ->
        ev = events(target)
        target.off(ev.in + ' ' + ev.out)
        if target.is(@active)
          @out()
        else
          @cancelTimeout()

        @target = @target.not(target)
        unless @target.length
          super()
        return

    class LiveTooltip extends BaseTooltip
      constructor: (@target, @message) ->
        $document.on mouseEvents.in, @target, (event) =>
          @cancelTimeout()
          @timeout = $timeout () =>
              @timeout = undefined
              if document.body.contains(event.target) && $(event.target).is(@target) # may have changed
                list.push @ unless @active
                @active = event.target
            , delay

        $document.on mouseEvents.out, @target, $rootScope.$lift () =>
          @out()

        super()

      @prototype.live = true

      Object.defineProperty @prototype, 'id',
        get: () -> @target

    {
      list: list
      add: (target, message) ->
        if typeof target == 'string'
          new LiveTooltip(target, message)
        else
          cur = all[message] || new Tooltip(message)
          cur.add(target)
          cur
      clear: () ->
        for i, t of all
          t.out()
        return
    }
]
