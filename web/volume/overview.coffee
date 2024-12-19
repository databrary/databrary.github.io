'use strict'

app.directive 'volumeOverview', [
  'constantService',
  (constants) ->
    generateSummary = (volume) ->
      volume.summary = summary =
        sessions: 0
        shared: 0
        agemin: Infinity
        agemax: -Infinity
        agesum: 0
        ages: 0
        participants: 0

      Participant = constants.categoryName.participant
      Gender = Participant.metricName.gender.id
      Participant = Participant.id
      for ci, c of volume.containers when !c.top
        summary.sessions++
        summary.shared++ if c.release >= constants.release.SHARED
        for r in c.records when 'age' of r and volume.records[r.id].category == Participant
          if r.age < summary.agemin
            summary.agemin = r.age
          if r.age > summary.agemax
            summary.agemax = r.age
          summary.agesum += r.age
          summary.ages++
      summary.agemean = summary.agesum / summary.ages

      for ri, r of volume.records
        if r.category == Participant
          summary.participants++
          if g = r.measures[Gender]
            summary.genders ||= {}
            if summary.genders[g]
              summary.genders[g]++
            else
              summary.genders[g] = 1

    generateReleasesummary = (volume) ->
      volume.releasesummary = summary =
        'sessions':
          unreleased: 0
          private: 0
          shared: 0
          excerpts: 0
          public: 0
        'materials':
          unreleased: 0
          private: 0
          shared: 0
          excerpts: 0
          public: 0
      fileArrSess = []
      fileArrMat = []
      generateArray = (obj, array) ->
        for k, v of obj
          if constants.release[v.classification] == undefined
            if constants.release[v.container.release] == undefined
              array.push('private')
            else
              array.push((constants.release[v.container.release]).toLowerCase())
          else
            array.push((constants.release[v.classification]).toLowerCase())
      combineArray = (array, string) ->
        for x of array
          summary[string][array[x]]++
      for key, value of volume.containers
        if Object.keys(value.assets).length > 0
          if value.top == true
            generateArray(value.assets, fileArrMat)
          else
            generateArray(value.assets, fileArrSess)
      combineArray(fileArrMat, 'materials')
      combineArray(fileArrSess, 'sessions')
      for key, value of summary
        for k, v of value
          if v == 0
            delete summary[key][k]

    generateAssetcount = (volume) ->
      volume.assetCount = Object.keys(volume.assets).length
      return volume.assetCount

    {
    restrict: 'E'
    templateUrl: 'volume/overview.html'
    scope: false
    link:
      pre: ($scope) ->
        generateSummary($scope.volume) unless $scope.volume.summary
        generateReleasesummary($scope.volume)
        generateAssetcount($scope.volume)
        return
    }
]

app.directive 'releaseTable', [
  () ->
    restrict: 'E'
    link: ($scope, $elem) ->
      table = angular.element($elem[0])
      table.append('<thead><tr><th>File Type</th><th>Release Level</th><th># of Files</th></tr></thead><tbody></tbody>')
      tbody = table.find('tbody')
      for key, value of $scope.volume.releasesummary
        if Object.keys(value).length > 0
          for k, v of value 
            if k == Object.keys(value)[0]
              if k == 'excerpts'
                k = 'learning audiences'
              if k == 'shared'
                k = 'authorized users'
              th = '<tr><th rowspan="' + Object.keys(value).length + '">' + key + '</th><th>' + k + '</th><td>' + v + '</td></tr>'
              tbody.append(th)
            else if Object.keys(value).length > 1
              if k == 'excerpts'
                k = 'learning audiences'
              if k == 'shared'
                k = 'authorized users'
              trow = '<tr><th>' + k + '</th><td>' + v + '</td></tr>'
              tbody.append(trow)
            else 
              trow = ''
      return

]
