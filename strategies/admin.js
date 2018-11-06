const ADMIN_SECRET = 'JsRoundaboutAdmin';

const adminStrategy = (requestData = {}) => {
  const { headers } = requestData;

  if (!headers || !headers.authorization) {
    return false;
  }

  const authHeader = headers.authorization;
  return authHeader === ADMIN_SECRET;
};

module.exports = adminStrategy;
