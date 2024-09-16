import * as assert from 'assert';
import * as httpMocks from 'node-mocks-http';
import { dummy, savePoll, resetForTesting, listPoll, loadPoll, voteInPoll } from './routes';


describe('routes', function() {

  // TODO: remove the tests for the dummy route

  it('dummy', function() {
    const req1 = httpMocks.createRequest(
        {method: 'GET', url: '/api/dummy', query: {name: 'Bob'} });
    const res1 = httpMocks.createResponse();
    dummy(req1, res1);
    assert.strictEqual(res1._getStatusCode(), 200);
    assert.deepStrictEqual(res1._getData(), {msg: "Hi, Bob!"});
  });


  //Test cases for savePoll function

  it('savePoll', function() {

    // Separate domain for each branch:
    // 1. Missing name
    const req1 = httpMocks.createRequest(
        {method: 'POST', url: '/api/savePoll', body: {}});
    const res1 = httpMocks.createResponse();
    savePoll(req1, res1);
    assert.strictEqual(res1._getStatusCode(), 400);
    assert.deepStrictEqual(res1._getData(),
        "invalid 'name' parameter");

    // 2. Missing/Invalid endTime
    const req2 = httpMocks.createRequest(
        {method: 'POST', url: '/api/savePoll', 
        body: {name: "couch", endTime: null, options: "hello"}});
    const res2 = httpMocks.createResponse();
    savePoll(req2, res2);
    assert.strictEqual(res2._getStatusCode(), 400);
    assert.deepStrictEqual(res2._getData(),
        "invalid 'endTime' parameter");
 
    const req3 = httpMocks.createRequest(
      {method: 'POST', url: '/api/savePoll',
       body: {name: "couch", endTime: 0, options: "hello"}});
  const res3 = httpMocks.createResponse();
  savePoll(req3, res3);
  assert.strictEqual(res3._getStatusCode(), 400);
  assert.deepStrictEqual(res3._getData(),
      "invalid 'endTime' parameter");

  // 3. Missing/Invalid option
  const req4 = httpMocks.createRequest(
      {method: 'POST', url: '/api/savePoll',
       body: {name: "couch", endTime: 31, options: ""}});
  const res4 = httpMocks.createResponse();
  savePoll(req4, res4);
  assert.strictEqual(res4._getStatusCode(), 400);
  assert.deepStrictEqual(res4._getData(),
  "invalid 'options' parameter");

  const req5 = httpMocks.createRequest(
      {method: 'POST', url: '/api/savePoll',
       body: {name: "couch", endTime: 32, options: null}});
  const res5 = httpMocks.createResponse();
  savePoll(req5, res5);
  assert.strictEqual(res5._getStatusCode(), 400);
  assert.deepStrictEqual(res5._getData(),
  "invalid 'options' parameter");

  
  // 4. Correctly added
  const req10 = httpMocks.createRequest(
      {method: 'POST', url: '/api/savePoll',
       body: {name: "couch", endTime: 32, options: ["1231","12312","fsdfds"]}});
  const res10 = httpMocks.createResponse();
  savePoll(req10, res10);
  assert.strictEqual(res10._getStatusCode(), 200);

  const req11 = httpMocks.createRequest(
    {method: 'POST', url: '/api/savePoll',
     body: {name: "hello", endTime: 43, options: ["1231","12312","fsdfds"]}});
  const res11 = httpMocks.createResponse();
  savePoll(req11, res11);
  assert.strictEqual(res11._getStatusCode(), 200);


  resetForTesting();

  })


  // Test cases for loadPoll function
  it('loadPoll', function() {

    const req1 = httpMocks.createRequest(
        {method: 'GET', url: '/api/savePoll', query: {}});
    const res1 = httpMocks.createResponse();
    listPoll(req1, res1);
    assert.strictEqual(res1._getStatusCode(), 200);
    assert.deepStrictEqual(res1._getData(), {polls: []});

      
    const req2 = httpMocks.createRequest({
        method: 'GET',
        url: '/api/loadPoll',
        query: {name: "", endTime : 34, options: "hello"}
      });
      
      const res2 = httpMocks.createResponse();
      loadPoll(req2, res2);
      
      assert.strictEqual(res2._getStatusCode(), 400);
      assert.deepStrictEqual(res2._getData(), "missing or invalid parameters");

      const req3 = httpMocks.createRequest({
        method: 'GET',
        url: '/api/loadPoll',
        query: {name: "couch", endTime : 0, options: "hello"}
      });
      
      const res3 = httpMocks.createResponse();
      loadPoll(req3, res3);
      
      assert.strictEqual(res3._getStatusCode(), 400);
      assert.deepStrictEqual(res3._getData(), "missing or invalid parameters");

      const req4 = httpMocks.createRequest({
        method: 'GET',
        url: '/api/loadPoll',
        query: {name: "couch", endTime : 32, options: ""}
      });
      
      const res4 = httpMocks.createResponse();
      loadPoll(req4, res4);
      
      assert.strictEqual(res4._getStatusCode(), 400);
      assert.deepStrictEqual(res4._getData(), "missing or invalid parameters");

      const req5 = httpMocks.createRequest({
        method: 'GET',
        url: '/api/loadPoll',
        query: {name: "couch", endTime : 32, options: undefined}
      });
      
      const res5 = httpMocks.createResponse();
      loadPoll(req5, res5);
      
      assert.strictEqual(res5._getStatusCode(), 400);
      assert.deepStrictEqual(res5._getData(), "missing or invalid parameters");

      
    resetForTesting();

  });

  // Test cases for listPoll function
  it('listPoll', function() {

    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    const samplePoll1 = { name: 'Poll1', endTime: 32, 
    options: ['Taco', 'Pizza', 'Salad'],};
    const samplePoll2 = { name: 'Poll2', endTime: 30,
    options: ['Beef', 'Chicken', 'Pork', 'Lamb'], };

    const pollsMap = new Map();
    pollsMap.set('Poll1', samplePoll1);
    pollsMap.set('Poll2', samplePoll2);


    const polls1 = new Map();
    polls1.set('Poll2', samplePoll2);
    polls1.set('Poll1', samplePoll1);
    listPoll(req, res);
    assert.strictEqual(res._getStatusCode(), 200);
    assert.deepStrictEqual(res._getData(), { polls: [] });

    const samplePoll3 = { name: 'Poll3', endTime: 21, options: ['B', 'A', 'N', 'A', 'N', 'A'] };

    const polls4 = new Map();
    polls4.set('Poll3', samplePoll3);

    listPoll(req, res);
    assert.strictEqual(res._getStatusCode(), 200);
    assert.deepStrictEqual(res._getData(), {polls: []});

    resetForTesting();

  });

  // Test cases for voteInPoll function
  it('voteInPoll', function() { 
      
    const req1 = httpMocks.createRequest({
        method: 'POST',
        url: '/api/voteInPoll',
        body: {
          voter: 'Bleh',
          name: 'TestPoll1',
          option: 'Option1',
        },
      });
      const res1 = httpMocks.createResponse();
      voteInPoll(req1, res1);
      assert.strictEqual(res1._getStatusCode(), 400);
      assert.deepStrictEqual(res1._getData(), "no poll with name 'TestPoll1'");
      
      const req2 = httpMocks.createRequest({
        method: 'POST',
        url: '/api/voteInPoll',
        body: {
          name: 'TestPoll2',
          option: 'Hola',
        },
      });
      const res2 = httpMocks.createResponse();
      voteInPoll(req2, res2);
      assert.strictEqual(res2._getStatusCode(), 400);
      assert.strictEqual(res2._getData(), "missing or invalid 'voter' parameter");
    
      const req3 = httpMocks.createRequest({
        method: 'POST',
        url: '/api/voteInPoll',
        body: {
          voter: 'Bob',
          name: 'TestPoll3',
          option: 'Howdy',
        },
      });

      const res3 = httpMocks.createResponse();
      voteInPoll(req3, res3);
      assert.strictEqual(res3._getStatusCode(), 400);
      assert.strictEqual(res3._getData(), "no poll with name 'TestPoll3'");

      resetForTesting();

  })

});
