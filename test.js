const axios = require('axios')
let url =  "http://127.0.0.1:5000/test"
  const options = {
    method: 'GET',
    headers: { 'content-type': 'application/json' },
    data: JSON.stringify({   
    "URL":"/Users/k/Repos/server_1d/test.bed",
    "range":[0.5,1]
    }),
    url
  }
  axios(options)
  .then(function (response) {
      // handle success
      console.log(response.data.data);
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })
    .then(function () {
      // always executed
    });
//  axios.get( "http://localhost:5000/test",JSON.stringify({   
//    "URL":"/Users/k/Repos/server_1d/test.bed",
//    "range":[0.5,1]
//  }))
//    .then(function (response) {
//      // handle success
//      console.log(response);
//    })
//    .catch(function (error) {
//      // handle error
//      console.log(error);
//    })
//    .then(function () {
//      // always executed
//    });
//
