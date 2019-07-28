
// Test Module Description Format
// describe 'Module'(in Capital) Test
describe('Example Test', function(){
  /*
    Test Module Function Description Format
    test('ModuleName:Function:Comments', () => {...})
   */
  test('Example:add:1+1=2', ()=>{
    expect(1+1).toBe(2)
  })
});
