'use strict';

app.factory('Segment', [
  'constantService', 'Offset',
  function (constants, Offset) {
    function Segment() {
      this.init.apply(this, arguments);
    }

    Segment.prototype.init = function(a, u) {
      var l;
      if (arguments.length >= 2) {
        l = a;
      } else if (arguments.length < 1 || a === null || a === '') {
        l = Infinity;
        u = -Infinity;
      } else if (a === undefined) {
        l = -Infinity;
        u = Infinity;
      } else if (Array.isArray(a)) {
        l = typeof a[0] === 'number' ? a[0] : -Infinity;
        u = typeof a[1] === 'number' ? a[1] : Infinity;
      } else if (typeof a === 'number') {
        l = u = a;
      } else if (typeof a === 'object' && 'l' in a && 'u' in a) {
        l = a.l;
        u = a.u;
      } else if (typeof a === 'string') {
        /* this is not a full parser as the backend has, but just needs to be sufficient to parse the output of .format */
        var i = a.indexOf(',');
        if (i === -1) {
          i = a.indexOf('-', 1);
          if (i === -1) {
            this.l = this.u = Math.round(Offset.parse(a));
            return;
          }
        }
        l = i === 0 ? -Infinity : Offset.parse(a.substr(0,i));
        u = i === a.length-1 ? Infinity : Offset.parse(a.substr(i+1));
      } else
        throw new Error('invalid Segment construction');
      this.l = Math.round(l);
      this.u = Math.round(u);
    };

    Object.defineProperties(Segment.prototype, {
      full: {
        get: function () {
          return this.l === -Infinity && this.u === Infinity;
        }
      },
      empty: {
        get: function () {
          return this.l > this.u;
        }
      },
      length: {
        get: function () {
          return this.u >= this.l ? this.u - this.l : undefined;
        }
      },
      lBounded: {
        get: function () {
          return this.l <= this.u && isFinite(this.l);
        }
      },
      uBounded: {
        get: function () {
          return this.u >= this.l && isFinite(this.u);
        }
      },
      base: {
        get: function () {
          return isFinite(this.l) ? this.l : 0;
        }
      }
    });

    Segment.isFull = function (x) {
      return x === undefined ||
        (x instanceof Segment && x.full) ||
        x === ',' || x === '-'; // handle strings just as an optimization
    };
    Segment.full = constants.deepFreeze(new Segment(undefined));

    Segment.isEmpty = function (x) {
      return x === null ||
        (x instanceof Segment && x.empty) ||
        x === '';
    };
    Segment.empty = constants.deepFreeze(new Segment(null));

    function base(x) {
      if (x instanceof Segment)
        return x.base;
      if (Array.isArray(x))
        x = x[0];
      return isFinite(x) ? x : 0;
    }

    Segment.make = function(x) {
      return x instanceof Segment ? x : new Segment(x);
    };

    Segment.prototype.format = function () {
      if (this.full)
        return '-';
      if (this.empty)
        return '';
      var l = Math.floor(this.l);
      var u = Math.floor(this.u);
      if (l === u)
        return l.toString();
      return (isFinite(l) ? l : '') +
        ',' + (isFinite(u) ? u : '');
    };

    Segment.prototype.toString = Segment.prototype.format;

    Segment.prototype.equals = function (that) {
      if (Segment.isFull(that))
        return this.full;
      if (Segment.isEmpty(that))
        return this.empty;
      if (typeof that === 'string')
        return false;
      that = Segment.make(that);
      return this.l === that.l && this.u === that.u;
    };

    Segment.prototype.intersect = function (that) {
      if (this.empty || Segment.isFull(that))
        return this;
      if (this.full || Segment.isEmpty(that))
        return that;
      that = Segment.make(that);
      var r = new Segment(
          Math.max(this.l, that.l),
          Math.min(this.u, that.u));
      // fix ,y) && [y, => [y,y]
      if (this.l < this.u && this.u <= r.l || that.l < that.u && that.u <= r.l)
        return Segment.empty;
      return r;
    };

    /* If segments are disjoint, assume the excluded middle. */
    Segment.prototype.union = function (that) {
      if (this.empty || Segment.isFull(that))
        return that;
      if (this.full || Segment.isEmpty(that))
        return this;
      that = Segment.make(that);
      return new Segment(
          Math.min(this.l, that.l),
          Math.max(this.u, that.u));
    };

    Segment.prototype.overlaps = function (that) {
      return !this.intersect(that).empty;
    };

    Segment.prototype.contains = function (that) {
      if (typeof that === 'number')
        return that >= this.l && (that < this.u || that === this.u && this.l === this.u);
      if (Segment.isFull(that))
        return this.full;
      if (Segment.isEmpty(that))
        return !this.empty;
      that = Segment.make(that);
      if (that.l === that.u)
        return this.contains(that.l);
      return this.l <= that.l && this.u >= that.u;
    };

    Segment.prototype.shift = function (s) {
      return new Segment(this.l + s, this.u + s);
    };

    Segment.prototype.relativeTo = function (b) {
      return this.shift(-base(b));
    };

    Segment.format = function (seg) {
      if (Segment.isFull(seg))
        return '-';
      if (Segment.isEmpty(seg))
        return 'empty';
      return seg.toString();
    };

    Segment.data = function (seg) {
      if (seg instanceof Object && !(seg instanceof Segment) && !Array.isArray(seg))
        return seg;
      return Segment.format(seg);
    };

    return Segment;
  }
]);
