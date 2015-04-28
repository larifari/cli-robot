"use strict";

var rewire = require("rewire");
var shasum = require("shasum");
var xlsx = require("xlsx");
var expect = require("chai").expect;

var server = require("../server");

describe("job: siwssmedic", function () {
  var job, cfg, test;

  // start server
  before(server.spinUp);
  // create test config
  before(function () {
    test = {
      cfg: {
        download: {
          url: "http://localhost:" + server.port + "/arzneimittel/00156/00221/00222/00230/index.html",
          dir: "./test_integration/tmp/data/auto",
          file: "./test_integration/tmp/data/auto/swissmedic.xlsx"
        },
        process: {
          dir: "./test_integration/tmp/data/release/swissmedic/",
          file: "./test_integration/tmp/data/release/swissmedic/swissmedic.json",
          minFile: "./test_integration/tmp/data/release/swissmedic/siwssmedic.min.json"
        }
      }
    };
  });
  // run job
  before(function (done) {
    job = rewire("../../jobs/swissmedic");
    job.__set__("cfg", test.cfg);

    job(done);
  });

  describe("XLSX-Download", function () {
    // very slow: ~20000ms
    it("should download whole xlsx-File from swissmedic", function () {
      expect(shasum(xlsx.readFile(server.cfg.swissmedic.xlsx))).to.equal(shasum(xlsx.readFile(test.cfg.download.file)));
    });
  });

  // stop server
  after(server.spinDown);
  // clean after job
  after(function (done) {
    done();
  });
});