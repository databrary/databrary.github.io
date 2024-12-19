'use strict'

app.factory 'Offset', [
  () ->
    pad = (s, n, d) ->
      if d == undefined || (p = s.indexOf(d)) == -1
        p = s.length
      while p++ < n
        s = '0' + s
      s
    multipliers = [1000,60,60,24]
    regex = /^\s*[-+]?(\d+:){0,2}\d+(\.\d*)?\s*$/

    {
      format: (o, round) ->
        return unless isFinite(o)
        i = Math.abs(o)
        s = (i%60000)/1000
        s |= 0 if round
        i = 0|i/60000
        s = (i%60) + ':' + pad((if round then s.toString() else s.toFixed(3)), 2, '.')
        i = 0|i/60
        if i
          s = (i%24) + ':' + pad(s, 2, ':')
          i = 0|i/24
          if i
            s = i + ':' + pad(s, 2, ':')
        if o < 0 then '-' + s else s
      parse: (s) ->
        return unless r = regex.exec(s)
        return parseInt(s, 10) unless r[1] || r[2]
        s = s.substr(1) if n = s.charAt(0) == '-'
        s = s.split(':')
        l = s.length
        o = 0
        _.each s, (val, i) -> o = (o + parseFloat(val))*multipliers[l-1-i]
        if n then -o else o
    }
]
