async function makeRequest(url, method = 'GET', body = null, headers = {}) {
  // All requests will be done using JSON
  headers = {
    ...headers,
    'Content-Type': 'application/json',
  };

  return (await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  })).json();
}

export default {
  makeRequest,
};
