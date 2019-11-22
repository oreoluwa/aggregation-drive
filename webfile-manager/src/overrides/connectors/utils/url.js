const isUuid = uuid => {
  if (typeof uuid !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
};

const base64Encode = str => {
  const uri = decodeURIComponent(str);
  return btoa(uri).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export const getId = id => {
  if ( isUuid(id) ) return id;
  return base64Encode(id);
}

export const parseQueryString = ( queryString ) => {
  const params = {};

  if (queryString.startsWith('?')) queryString = queryString.substr(1);
  const queries = queryString.split("&");

  for (let i = 0; i < queries.length; i++) {
    const temp = queries[i].split('=');
    params[temp[0]] = temp[1];
  };

  return params;
};
