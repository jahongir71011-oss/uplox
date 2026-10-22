```javascript
const jwt = require('jsonwebtoken');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { username, password } = JSON.parse(event.body || '{}');

    const expectedUser = process.env.ADMIN_USERNAME || 'bot';
    const expectedPass = process.env.ADMIN_PASSWORD || '1011';
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key-uplox-2026';

    if (username !== expectedUser || password !== expectedPass) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid administrative credentials' })
      };
    }

    const token = jwt.sign(
      { role: 'admin', user: username },
      jwtSecret,
      { expiresIn: '8h' }
    );

    return {
      statusCode: 200,
      headers: {
        'Set-Cookie': `uplox_admin_session=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800`
      },
      body: JSON.stringify({ success: true, token })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Authentication Error' })
    };
  }
};
```[cite: 9]