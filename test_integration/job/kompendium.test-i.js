"use strict";

var path = require("path");
var fs = require("fs");

var rewire = require("rewire");
var shasum = require("shasum");
var merge = require("merge");
var expect = require("chai").expect

var server = require("../../fixtures/server");
var disk = require("../../lib/disk");

describe.only("job: Kompendium", function () {
  var job, test;

  before(function () {
    test = {
      cfg: {
        "download": {
          "url": "http://localhost:" + server.port + "/kompendium/",
          "dir": path.resolve(__dirname, "../tmp/data/auto"),
          "zip": path.resolve(__dirname, "../tmp/data/auto/kompendium.zip"),
          "xml": path.resolve(__dirname, "../tmp/data/auto/kompendium.xml"),
          "zipFiles": [{
            name: /.xml/, dest: path.resolve(__dirname, "../../test_integration/tmp/data/auto/kompendium.xml")
          }]
        },
        "process": {
          "dir": path.resolve(__dirname, "../tmp/data/release/kompendium/"),
          "de": {
            "fi": path.resolve(__dirname, "../tmp/data/release/kompendium/de/fi"),
            "pi": path.resolve(__dirname, "../tmp/data/release/kompendium/de/pi")
          },
          "fr": {
            "fi": path.resolve(__dirname, "../tmp/data/release/kompendium/fr/fi"),
            "pi": path.resolve(__dirname, "../tmp/data/release/kompendium/fr/pi")
          },
          "it": {
            "fi": path.resolve(__dirname, "../tmp/data/release/kompendium/it/fi"),
            "pi": path.resolve(__dirname, "../tmp/data/release/kompendium/it/pi")
          },
          "catalog": path.resolve(__dirname, "../tmp/data/release/kompendium/catalog.json")
        }
      }
    };
  });

  before(function (done) {
    this.timeout(240000);

    job = rewire("../../jobs/kompendium");
    job.__set__("cfg", merge.recursive(job.cfg, test.cfg));
    job(done);
  });

  describe("Download and unzip kompendium.xml", function () {
    it("should download ZIP-File and unzip it to kompendium.xml", function () {
      var fixture = shasum(fs.readFileSync(server.cfg.kompendium.xml));
      var download = shasum(fs.readFileSync(test.cfg.download.xml));
      expect(fixture).to.equal(download);
    });
  });

  describe("catalog.json", function () {
    it("should build a proper catalog.json-file", function () {
      var fixture = shasum(fs.readFileSync(path.resolve(__dirname, "../../fixtures/kompendium/catalog.json")));
      var build = shasum(fs.readFileSync(test.cfg.process.catalog));
      expect(fixture).to.equal(build);
    });
  });
});