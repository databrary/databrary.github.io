'use strict'

app.directive 'slotFilter', [
  'constantService',
  (constants) ->
    restrict: 'E'
    templateUrl: 'volume/filter.html'
    link: ($scope) ->
      filter = $scope.filter

      join = (o, op, e) ->
        if o then o + op + e else e
      ops = # these are all negated
        '': (o) -> o
        any: (o) -> o || 'false'
        true: (o) -> join(o, '&&', '!v')
        false: (o) -> join(o, '&&', 'v')
        two: (o) -> join(o, '&&', 'v!==2')
        eq: (o,x) -> join(o, '&&', if x then 'v!='+JSON.stringify(x) else 'v')
        ne: (o,x) -> join(o, '||', 'v=='+JSON.stringify(x))
        gt: (o,x) -> join(o, '||', 'v<='+JSON.stringify(x))
        ge: (o,x) -> join(o, '||', 'v<'+JSON.stringify(x))
        lt: (o,x) -> join(o, '||', 'v>='+JSON.stringify(x))
        le: (o,x) -> join(o, '||', 'v>'+JSON.stringify(x))
        contains: (o,x) -> join(o, '||', '!(v&&v.includes('+JSON.stringify(x)+'))')

      makeFilter = (key) ->
        exp = ['var v,i,c']
        cats = {slot:{}}
        ci = 0
        any = false
        for f in filter.list when f.op
          any = true
          c = f.category.id
          unless c of cats
            cats[c] =
              $index:ci++
          m = f.metric.id
          cats[c][m] = ops[f.op](cats[c][m], f.value)
        return unless any

        indicate = (mets, any) ->
          mets.indicator = ops[if any then 'two' else 'any'](mets.indicator)
          any

        record = (mets, rv, age, brk) ->
          any = false
          for m, e of mets when e && m != '$index' && m != 'indicator'
            any = true
            if m == 'age'
              exp.push('v='+age)
            else
              exp.push('v='+rv+'.measures['+m+']')
              if constants.metric[m].assumed
                exp.push('if(v==null)v='+JSON.stringify(constants.metric[m].assumed))
            exp.push('if('+e+')'+brk)
          indicate(mets, any)

        if key && key != 'slot'
          if mets = cats[key]
            exp.push('if(x){')
            exp.push('v='+(if record(mets, 'x', 'undefined', 'return') then 2 else 1))
            exp.push('}else v=0',
              'if('+mets.indicator+')return')
          if Object.keys(mets = cats.slot).length
            exp.push('c=0',
              'for(i=0;i<y.length;i++){c=1')
            any = false
            for m, e of mets when e && m != 'indicator'
              any = true
              exp.push('v=y[i].'+m,
                'if('+e+')continue')
            if indicate(mets, any)
              exp.push('c=2', 'break')
            exp.push('}',
              'v=c',
              'if('+mets.indicator+')return')
        else
          for m, e of cats.slot when e
            exp.push('v=x.'+m,
              'if('+e+')return')
          if ci
            exp.push('var r')
            exp.push('c=new Uint8Array(new ArrayBuffer('+ci+'))',
              'for(i=0;i<y.length;i++){if(!(r=y[i].record)){continue')
            for c, mets of cats when c != 'slot'
              exp.push('}else if(r.category==='+c+'){if(!c['+mets.$index+'])c['+mets.$index+']=1')
              if record(mets, 'r', 'y[i].age', 'continue')
                exp.push('c['+mets.$index+']=2')
            exp.push('}}')
            for c, mets of cats when c != 'slot'
              exp.push('v=c['+mets.$index+']',
                'if('+mets.indicator+')return')
        exp.push('return true;')
        exp = exp.join(';')
        console.log(exp) if DEBUG
        exp

      make = (f) ->
        f && new Function('x', 'y', f)

      old = undefined
      filter.make = (key) ->
        make(old = makeFilter(key || @key))

      filter.change = () ->
        f = makeFilter(@key)
        return if f == old
        old = f
        filter.update(make(f))
        return

      filter.remove = (i) ->
        @list.splice(i, 1)
        filter.change()

      $scope.filterCompleter = (f, input) ->
        i = input.toLowerCase()
        match = (o for o in f.metric.options when o.toLowerCase().startsWith(i))
        switch match.length
          when 0 then input
          when 1 then match[0]
          else for o, i in match
            text: o
            select: () ->
              f.value = this.text
              filter.change()
              this.text
            default: input && i==0

      filter.change()

      return
]
