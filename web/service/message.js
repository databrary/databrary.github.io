'use strict';

app.factory('messageService', [
  '$sanitize', '$sce', 'constantService',
  function ($sanitize, $sce, constants) {
    var defaults = {
      type: 'blue',
      persist: false,
    };

    var sequence = 0;
    var byBody = {};

    function Message(init) {
      this.id = init.id || 'message-' + sequence++;
      angular.extend(this, defaults, init);

      if (Array.isArray(this.body))
        this.body = (this.more = this.body).shift();
      /* suppress duplicate messages */
      if (this.body in byBody)
        return;

      Message.list[this.id] = this;
      byBody[this.orig = this.body] = this;
    }

    Message.list = {};

    Message.prototype.remove = function () {
      delete Message.list[this.id];
      delete byBody[this.orig];
    };

    Message.prototype.addStorage = function () {
      sessionStorage.setItem('notification' + Math.floor(Date.now() / 1000), this.body);
    };

    Message.prototype.next = function () {
      var more;
      if (Array.isArray(this.more))
        more = this.more.shift();
      else if (typeof this.more === 'string') {
        more = this.more;
        delete this.more;
      }
      if (more)
        this.body = more;
      else
        this.remove();
    };

    Message.add = function (message) {
      return new Message(message);
    };

    /* NB: modifies message */
    Message.addError = function (message) {
      message.type = 'red';

      var body = constants.message('error.prefix') + ' ' + $sce.getTrustedHtml(message.body);

      if (message.report) {
        message.errors = message.report.data;
        message.status = message.report.status;
        if (message.report.config)
          message.url = message.report.config.url;
      }

      if (!message.errors) {
        body += ' ' + constants.message('error.suffix');
      } else if (angular.isString(message.errors)) {
        // try to guess content-type since it's not in report:
        if (message.errors.startsWith('<')) {
          message.fn = function () {
            // escape angular
            window.setTimeout(function() {
              document.open('text/html');
              document.write(message.errors); // jshint ignore:line
              document.close();
            }, 0);
          };
          body += ' <a href="">' + constants.message('error.view') + '</a>';
        } else
          body += "<br>" + $sanitize(message.errors);
      } else if (angular.isObject(message.errors)) {
        var moreBody = '';
        var messageBody = '';

        if (message.statusText)
          messageBody += 'Status:\n' + message.statusText + '\n\n';

        Message.foreachError(message.errors, function(field, error){
          moreBody += '<dl class="comma"><dt>' + (field || 'Reason') + '</dt><dd>' + error.map($sanitize).join('</dd><dd>') + '</dd></dl>';
          messageBody += (field || 'Reason') + ':\n' + error.join('\n') + '\n\n';
        });

        if (messageBody)
          body += ' ' + constants.message('error.report', encodeURIComponent(constants.message('error.mail.subject', message.status || 0, message.url || '')), encodeURIComponent(constants.message('error.mail.body', messageBody))) + moreBody;
        if (message.status == 409)
          body += "<br>" + constants.message('app.reload');
      }

      delete message.report;
      delete message.errors;
      delete message.status;
      delete message.url;
      message.body = $sce.trustAsHtml(body);

      return new Message(message);
    };

    Message.clear = function (owner) {
      _.each(Message.list, function(message){
	if (owner ? message.owner === owner : !message.persist)
          message.remove();
      });
    };

    /* convert the nested (json) structure produced by server errors into a flatter object where keys are dot-delimited and values are always arrays, or calling proc on each key, value pair. */
    Message.foreachError = function (errors, proc) {
      var out = {};
      if (!proc)
        proc = function (key, val) {
          out[key] = val;
        };
      function flatten(obj, prefix) {
        if (typeof obj === 'object' && (!Array.isArray(obj) || obj.some(function (x) { return typeof x === 'object'; })))
          for (var key in obj)
            flatten(obj[key], prefix ? prefix + '.' + key : key);
        else
          proc(prefix || '', Array.isArray(obj) ? obj : [obj]);
      }
      flatten(errors);
      return out;
    };

    return Message;
  }
]);
