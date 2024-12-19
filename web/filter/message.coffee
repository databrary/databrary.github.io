'use strict'

app.filter('message', [
  'constantService', (constants) -> constants.message
])
