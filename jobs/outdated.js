"use strict";

var moment = require("moment");

var atc = require("./atc");
var atcCfg = require("./cfg/atc.cfg.js");
var bag = require("./bag");
var bagCfg = require("./cfg/bag.cfg.js");
var kompendium = require("./kompendium");
var kompenidumCfg = require("./cfg/kompendium.cfg.js");
var swissmedic = require("./swissmedic");
var swissmedicCfg = require("./cfg/swissmedic.cfg.js");

var defaultLog = require("../lib/index").log;
var compareFileSize = require("../lib/compare/compareFileSize");
var compareKompendiumFileSize = require("../lib/kompendium/compare/compareKompendiumFileSize");

function getDateTime() {
  return moment().format("DD.MM.YYYY HH:mm");
}

/**
 * @param {{debug: Function, error: Function, info: Function, time: Function, timeEnd: Function}} log - optional
 * @returns {Promise}
 */
function outdated(log) {

  log = log || defaultLog;

  return Promise.all([
    compareFileSize("ATC", atcCfg, log),
    compareFileSize("BAG", bagCfg, log),
    compareFileSize("Swissmedic", swissmedicCfg, log),
    compareKompendiumFileSize(kompenidumCfg, log)
  ])
    .then(function (result) {
      var refreshATC = result[0];
      var refreshBAG = result[1];
      var refreshSwissmedic = result[2];
      var refreshKompendium = result[3];
      var p = new Promise(function (resolve) {
        resolve();
      });

      if (refreshSwissmedic) {
        log.warn("Swissmedic", getDateTime() + " - Starting Update");
        p = p.then(function () {
          return swissmedic(log).then(function () {
            log.warn("Swissmedic", getDateTime() + " - Update Done");
          });
        });
      }

      if (refreshATC) {
        log.warn("ATC", getDateTime() + " - Starting Update");
        p = p.then(function () {
          return atc(log).then(function () {
            log.warn("ATC", getDateTime() + " - Update Done");
          });
        });
      }

      if (refreshBAG) {
        log.warn("ABG", getDateTime() + " - Starting Update");
         p = p.then(function () {
           return bag(log).then(function () {
             log.warn("BAG", getDateTime() + "- Update Done");
           });
         });
      }

      if (refreshKompendium) {
        log.warn("Kompendium", getDateTime() + " - Starting Update");
        p = p.then(function () {
          return kompendium(log).then(function () {
            log.warn("Kompendium", getDateTime() + " - Update Done");
          });
        });
      }

      return p;
    });
}

module.exports = outdated;