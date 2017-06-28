const chai = require('chai');
const should = require('chai').should();
const app = require('../app/app');

var jsonResult = app.getJsonFromRequest(null);
var jsonObject = app.getObjectFromJsonString(jsonResult);

describe('App', function() {
  describe('getJsonFromRequest()', function() {
    it('getJsonFromRequest() returns defined', function() {
      should.not.equal(jsonResult, undefined);
    });
  });

  describe('getObjectFromJsonString()', function() {
    it('getObjectFromJsonString() returns defined', function() {
      should.not.equal(jsonResult, undefined);
    });

    it('getObjectFromJsonString() returns an object', function() {
      jsonObject.should.be.a('object');
    });

    it('getObjectFromJsonString() holds property MonitorResult', function() {
      jsonObject.should.have.property('MonitorResult');
    });

    it('getObjectFromJsonString().MonitorResult holds property OverallResult', function() {
      var result = jsonObject.MonitorResult;
      result.should.have.property('OverallResult');
    });

    it('getObjectFromJsonString().MonitorResult.OverallResult is true', function() {
      var result = jsonObject.MonitorResult.OverallResult;
      result.should.be.true();
    });

    it('getObjectFromJsonString() returns valid JSON', function() {});
  });
});
