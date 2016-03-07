/**
 * Created by pyrrhus on 2016/3/1.
 */
describe('basic tests', function () {
  var bubbleSort;

  beforeEach(function () {
    bubbleSort = new BubbleSort();
  });

  it('test sample', function () {
    expect(bubbleSort.BubbleSort([42, 75, 84, 63, 13])).toEqual([13, 42, 63, 75, 84]);
  });
});

