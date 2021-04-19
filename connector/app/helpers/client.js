const axios = require('axios');

const client = axios.create({
  baseURL: process.env.API_BASE_URL || 'http://localhost:3000',
  timeout: 30000,
  headers: {
    'Authorization': 'Bearer xyz'
  },
  // validateStatus: () => true
});

const get = async (getInfo = {}) => {
  let response;
  try {
    response = await client.get(getInfo.endpoint, getInfo.config)
  } catch(err) {
    response = err.response;
  };

  return response;
}



module.exports = {
  client,
  get,
};
