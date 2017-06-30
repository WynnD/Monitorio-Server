const request = require('request');

let network = {
  getApiResponse(url) {
    return new Promise((resolve, reject) => {
      request(url, function(error, response, body) {
        if (error) {
          console.log(error);
          reject(error);
        } else {
          resolve(body);
        }
      });
    });
  }
};

exports.network_layer = network;
