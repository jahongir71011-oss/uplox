```javascript
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

exports.handler = async (event, context) => {
  const authHeader = event.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key-uplox-2026';

  try {
    jwt.verify(token, jwtSecret);
  } catch (err) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from('files')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
```[cite: 13]