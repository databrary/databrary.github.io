'use strict'

app.factory 'styleService', [
  () ->
    styles = document.head.appendChild(document.createElement('style')).sheet
    styles.set = (css, i) ->
      if i >= 0
        styles.deleteRule(i)
      else
        i = styles.cssRules.length
      if css
        styles.insertRule(css, i)
        i
    styles.clear = () ->
      i = styles.cssRules.length
      while i-- > 0
        styles.deleteRule(i)
      return

    styles
]
