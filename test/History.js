/* jshint -W079:true */
var assert = require('chai').assert;
var Imm = require('immutable');
var Map = Imm.Map;
var Util = require('../src/Util');
var Binding = require('../src/Binding')(Imm);
var History = require('../src/History')(Imm);

var initHistory = function () {
  var b = Binding.init(Map({ data: Map.empty(), history: Map.empty() }));
  var data = b.sub('data');
  var history = b.sub('history');
  History.init(data, history);
  return { data: data, history: history };
};

describe('History', function () {

  describe('#init(binding, historyBinding)', function () {
    it('should init history binding', function () {
      var bs = initHistory();
      var historyVal = bs.history.val();
      assert.isString(historyVal.get('listenerId'));
      assert.isTrue(historyVal.has('undo'));
      assert.isTrue(historyVal.has('redo'));
    });
  });

  describe('#clear(historyBinding)', function () {
    it('should reset history binding value', function () {
      var bs = initHistory();
      bs.data.set('key', 'value');
      assert.isTrue(History.hasUndo(bs.history));
      History.clear(bs.history);
      assert.isFalse(History.hasUndo(bs.history));
    });
  });

  describe('#destroy(historyBinding)', function () {
    it('should set binding value to null and remove listener', function () {
      var bs = initHistory();
      assert.isNotNull(bs.history.val());
      History.destroy(bs.history);
      assert.isNull(bs.history.val());
      bs.data.set('key', 'value');
      assert.isNull(bs.history.val());
    });
  });

  describe('#hasUndo(historyBinding)', function () {
    it ('should return false if there is no undo information', function () {
      var bs = initHistory();
      assert.isFalse(History.hasUndo(bs.history));
    });

    it('should return false on empty binding', function () {
      var history = Binding.init(Map.empty());
      assert.isFalse(History.hasUndo(history));
    });

    it ('should return true if there is undo information', function () {
      var bs = initHistory();
      bs.data.set('key', 'value');
      assert.isTrue(History.hasUndo(bs.history));
    });
  });

  describe('#hasRedo(historyBinding)', function () {
    it ('should return false if there is no redo information', function () {
      var bs = initHistory();
      assert.isFalse(History.hasRedo(bs.history));
    });

    it('should return false on empty binding', function () {
      var history = Binding.init(Map.empty());
      assert.isFalse(History.hasRedo(history));
    });

    it ('should return true if there is redo information', function () {
      var bs = initHistory();
      bs.data.set('key', 'value');
      History.undo(bs.data, bs.history);
      assert.isTrue(History.hasRedo(bs.history));
    });
  });

  describe('#undo(dataBinding, historyBinding)', function () {
    it('should do nothing and return false if there is no undo information', function () {
      var bs = initHistory();
      var initialData = bs.data.val();
      var result = History.undo(bs.data, bs.history);
      assert.isFalse(result);
      assert.strictEqual(bs.data.val(), initialData);
    });

    it('should revert to previous state and return true if there is undo information', function () {
      var bs = initHistory();
      bs.data.sub().set('key', 1);
      bs.data.sub().set('key', 2);
      var result = History.undo(bs.data, bs.history);
      assert.isTrue(result);
      assert.strictEqual(bs.data.val('key'), 1);
    });
  });

  describe('#redo(dataBinding, historyBinding)', function () {
    it('should do nothing and return false if there is no redo information', function () {
      var bs = initHistory();
      var initialData = bs.data.val();
      var result = History.redo(bs.data, bs.history);
      assert.isFalse(result);
      assert.strictEqual(bs.data.val(), initialData);
    });

    it('should revert to next state and return true if there is redo information', function () {
      var bs = initHistory();
      bs.data.sub().set('key', 1);
      bs.data.sub().set('key', 2);
      History.undo(bs.data, bs.history);
      var result = History.redo(bs.data, bs.history);
      assert.isTrue(result);
      assert.strictEqual(bs.data.val('key'), 2);
    });
  });

});
