const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

// Initialize JWKS client for Auth0 (lazy initialization)
let client = null;

const getJWKSClient = () => {
  if (!process.env.AUTH0_DOMAIN) {
    return null;
  }
  
  if (!client) {
    client = jwksClient({
      jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
      cache: true,
      cacheMaxEntries: 5,
      cacheMaxAge: 86400000 // 24 hours
    });
  }
  
  return client;
};

// Function to get signing key
function getKey(header, callback) {
  const jwks = getJWKSClient();
  
  if (!jwks) {
    return callback(new Error('AUTH0_DOMAIN is not configured'));
  }
  
  jwks.getSigningKey(header.kid, (err, key) => {
    if (err) {
      return callback(err);
    }
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

// Middleware to verify Auth0 JWT token
const verifyAuth0Token = (req, res, next) => {
  if (!process.env.AUTH0_DOMAIN) {
    return res.status(500).json({ message: 'Auth0 is not configured' });
  }

  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(
    token,
    getKey,
    {
      audience: process.env.AUTH0_AUDIENCE || process.env.AUTH0_CLIENT_ID,
      issuer: `https://${process.env.AUTH0_DOMAIN}/`,
      algorithms: ['RS256']
    },
    (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid or expired token', error: err.message });
      }
      req.user = decoded; // Attach decoded token to request
      next();
    }
  );
};

// Middleware to optionally authenticate (doesn't fail if no token)
const optionalAuth = (req, res, next) => {
  if (!process.env.AUTH0_DOMAIN) {
    req.user = null;
    return next();
  }

  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(
    token,
    getKey,
    {
      audience: process.env.AUTH0_AUDIENCE || process.env.AUTH0_CLIENT_ID,
      issuer: `https://${process.env.AUTH0_DOMAIN}/`,
      algorithms: ['RS256']
    },
    (err, decoded) => {
      if (err) {
        req.user = null;
      } else {
        req.user = decoded;
      }
      next();
    }
  );
};

module.exports = {
  verifyAuth0Token,
  optionalAuth
};

