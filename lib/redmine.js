/*!
 * node-redmine
 * A nodejs library which supports 100% features of Redmine's REST API.
 * Author: zanran <wayne@zanran.me>
 * Reference: http://www.redmine.org/projects/redmine/wiki/Rest_api
 */

 'use strict()';

/**
 * Module dependencies
 */
var http = require('http');
var debug = require('debug')('node-redmine');
var querystring = require('querystring');

////////////////////////////////////////////////////////////////////////////////////
/**
 * Redmine
 *
 * @param {String} host, Redmine hostname
 * @param {Object} config
 *  - {String} apiKey, API access key for Redmine, if apiKey occured, username and password will be ignored.
 *  - {String} username, username to login Redmine.
 *  - {String} password, password for login Redmine.
 *  - {String} format, REST API formats, xml or json.
 */
function Redmine(host, config) {
  if (!host) throw new Error('Invalidate hostname !');

  if (typeof host !== 'string') throw new Error('hostname should be a String !');

  if (!(config.apiKey || (config.username && config.password))) {
    throw new Error('You should provide an API key or username & password !');
  }

  if (config.format) {
    if ('json' !== config.format && 'xml' !== config.format) throw new Error('Redmine REST API only supports json and xml !');
  }

  this.config = config;
  this.config.host = host;

  if (!this.config.format) this.config.format = 'json';
}

Redmine.prototype = {
  // get & set property
  get apiKey() {
      return this.config.apiKey;
  },
  set apiKey(apiKey) {
      this.config.apiKey = apiKey;
  },
  get host() {
      return this.config.host;
  },
  set host(host) {
      this.config.host = host;
  },
  get username() {
      return this.config.username;
  },
  set username(username) {
      this.config.username = username;
  }
};

/**
 * encodeURL
 */
Redmine.prototype.encodeURL = function(path, params) {
  if (path.slice(0, 1) != '/') path = '/' + path;

  var query = querystring.stringify(params);
  if (query) path = path + '?' + query;

  return path;
};

/**
 * request - request url from Redmine
 */
Redmine.prototype.request = function(method, path, params, callback) {
  var opts = {
    host: this.config.host,
    path: method == 'GET' ? this.encodeURL(path, params) : path,
    method: method,
    headers: {
      'X-Redmine-API-Key': this.config.apiKey
    }
  };

  var req = http.request(opts, function(res) {
    if (res.statusCode != 200 && res.statusCode != 201) {
      callback('Server returns : ' + res.statusMessage + ' (' + String(res.statusCode) + ')', null);
      callback = null;
      return ;
    }

    var body = "";
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      body += chunk;
    });

    res.on('end', function(e) {
      var data;
      if (body) {
        data = JSON.parse(body);
      } else {
        data = {statusCode: res.statusCode, statusMessage: res.statusMessage };
      }
      callback(null, data);
      callback = null;
      return ;
    });
  });

  req.on('error', function(err) {
    callback(err, null);
    callback = null;
    return ;
  });

  if (method != 'GET') {
    var body = JSON.stringify(params);
    req.setHeader('Content-Length', body.length);
    req.setHeader('Content-Type', this.config.format == 'json' ? 'application/json' : 'application/xml');
    req.write(body);
  }

  req.end();
};


/////////////////////////////////////// REST API for issues (Stable) ///////////////////////////////////////
/**
 * Listing issues
 *    Returns a paginated list of issues. By default, it returns open issues only.
 * http://www.redmine.org/projects/redmine/wiki/Rest_Issues#Listing-issues
 */
Redmine.prototype.get_issue_by_id = function(id, params, callback) {
  if (typeof id !== 'number') throw new Error('Issue ID must be an integer above 0 !');

  this.request('GET', '/issues/' + id + '.' + this.config.format, params, callback);
};

/**
 * Showing an issue
 * http://www.redmine.org/projects/redmine/wiki/Rest_Issues#Showing-an-issue
 */
Redmine.prototype.issues = function(params, callback) {
  this.request('GET', '/issues' + '.' + this.config.format, params, callback);
};

/**
 * Creating an issue
 * http://www.redmine.org/projects/redmine/wiki/Rest_Issues#Creating-an-issue
 */
Redmine.prototype.create_issue = function(issue, callback) {
  this.request('POST', '/issues.' + this.config.format, issue, callback);
};

/**
 * Updating an issue
 * http://www.redmine.org/projects/redmine/wiki/Rest_Issues#Updating-an-issue
 */
Redmine.prototype.update_issue = function(id, issue, callback) {
  this.request('PUT', '/issues/' + id + '.' + this.config.format, issue, callback);
};

/**
 * Deleting an issue
 * http://www.redmine.org/projects/redmine/wiki/Rest_Issues#Deleting-an-issue
 */
Redmine.prototype.delete_issue = function(id, callback) {
  this.request('DELETE', '/issues/' + id + '.' + this.config.format, {}, callback);
};

/**
 * Adding a watcher
 * http://www.redmine.org/projects/redmine/wiki/Rest_Issues#Adding-a-watcher
 */
Redmine.prototype.add_watcher = function(id, params, callback) {
  if (!params.user_id) throw new Error('user_id (required): id of the user to add as a watcher !');

  this.request('POST', '/issues/' + id + '/watchers.' + this.config.format, params, callback);
};

/**
 * Removing a watcher
 * http://www.redmine.org/projects/redmine/wiki/Rest_Issues#Removing-a-watcher
 */
Redmine.prototype.remove_watcher = function(issue_id, user_id, callback) {
  this.request('DELETE', '/issues/' + issue_id + '/watchers/' + user_id + '.' + this.config.format, {}, callback);
};


/////////////////////////////////////// REST API for Projects (Stable) ///////////////////////////////////////
/**
 * REST API for Projects (Stable)
 *//*
 Redmine.prototype.projects = function(id, callback) {
   this.request('GET', '/issues/' + id + '.' + this.config.format, {}, callback);
 };

 Redmine.prototype.get_project_by_id = function(id, callback) {
   this.request('GET', '/issues/' + id + '.' + this.config.format, {}, callback);
 };

 Redmine.prototype.create_project = function(id, callback) {
   this.request('GET', '/issues/' + id + '.' + this.config.format, {}, callback);
 };

 Redmine.prototype.update_project = function(id, callback) {
   this.request('GET', '/issues/' + id + '.' + this.config.format, {}, callback);
 };

 Redmine.prototype.delete_project = function(id, callback) {
   this.request('GET', '/issues/' + id + '.' + this.config.format, {}, callback);
 };*/


/////////////////////////////////////// REST API for Users (Stable) ///////////////////////////////////////
 /**
  * REST API for Project Users (Stable)
  */
  /*
 Redmine.prototype.users = function(id, callback) {
   this.request('GET', '/issues/' + id + '.' + this.config.format, {}, callback);
 };

 Redmine.prototype.get_user_by_id = function(id, callback) {
   this.request('GET', '/issues/' + id + '.' + this.config.format, {}, callback);
 };

 Redmine.prototype.create_user = function(id, callback) {
   this.request('GET', '/issues/' + id + '.' + this.config.format, {}, callback);
 };

 Redmine.prototype.update_user = function(id, callback) {
   this.request('GET', '/issues/' + id + '.' + this.config.format, {}, callback);
 };

 Redmine.prototype.delete_user = function(id, callback) {
   this.request('GET', '/issues/' + id + '.' + this.config.format, {}, callback);
 };
*/

/////////////////////////////////////// REST API for Time Entries (Stable) ///////////////////////////////////////
 /**
  * REST API for Project Users (Stable)
  */
  /*
 Redmine.prototype.time_entries = function(id, callback) {
   this.request('GET', '/issues/' + id + '.' + this.config.format, {}, callback);
 };

 Redmine.prototype.get_time_entry_by_id = function(id, callback) {
   this.request('GET', '/issues/' + id + '.' + this.config.format, {}, callback);
 };

 Redmine.prototype.create_time_entry = function(id, callback) {
   this.request('GET', '/issues/' + id + '.' + this.config.format, {}, callback);
 };

 Redmine.prototype.update_time_entry = function(id, callback) {
   this.request('GET', '/issues/' + id + '.' + this.config.format, {}, callback);
 };

 Redmine.prototype.delete_time_entry = function(id, callback) {
   this.request('GET', '/issues/' + id + '.' + this.config.format, {}, callback);
 };
*/


/////////////////////////////////////// REST API for Project Memberships (Alpha) ///////////////////////////////////////
/////////////////////////////////////// REST API for News (Prototype) ///////////////////////////////////////
/////////////////////////////////////// REST API for Issue Relations (Alpha) ///////////////////////////////////////
/////////////////////////////////////// REST API for Versions (Alpha) ///////////////////////////////////////
/////////////////////////////////////// REST API for Wiki Pages (Alpha) ///////////////////////////////////////
/////////////////////////////////////// REST API for Queries (Alpha) ///////////////////////////////////////
/////////////////////////////////////// REST API for Attachments (Beta) ///////////////////////////////////////
/////////////////////////////////////// REST API for Issue Statuses (Alpha) ///////////////////////////////////////
/////////////////////////////////////// REST API for Trackers (Alpha) ///////////////////////////////////////
/////////////////////////////////////// REST API for Enumerations (Alpha) ///////////////////////////////////////
/////////////////////////////////////// REST API for Issue Categories (Alpha) ///////////////////////////////////////
/////////////////////////////////////// REST API for Roles (Alpha) ///////////////////////////////////////
/////////////////////////////////////// REST API for Groups (Alpha) ///////////////////////////////////////
/////////////////////////////////////// REST API for Custom Fields (Alpha) ///////////////////////////////////////
/////////////////////////////////////// REST API for Search (Alpha) ///////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////////////
module.exports = Redmine;
