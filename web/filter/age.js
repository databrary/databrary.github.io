'use strict';

app.filter('age', [
  'constantService', 'displayService',
  function (constants, display) {
    var AGE = constants.age;
    return function (days, outputFormat) {
      if (!isFinite(days))
        return days;

      if (days >= AGE.limit)
        return "90+ yrs";

      switch (outputFormat || display.ageMode(days)) {
        case 'year':
          return (days/AGE.year).toFixed(1) + ' yrs';

        case 'month':
          return (days/AGE.month).toFixed(1) + ' mos';

        case 'week':
          return (days/AGE.week).toFixed(1) + ' wks';

        default:
          return days.toFixed() + ' days';
      }
    };
  }
]);
