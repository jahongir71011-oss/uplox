```javascript
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const authHeader = event.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key-uplox-2026';

  try {
    jwt.verify(token, jwtSecret);
  } catch (err) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  try {
    const { id } = JSON.parse(event.body || '{}');
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'uplox-files';

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: fileRecord, error: fetchErr } = await supabase
      .from('files')
      .select('storage_key')
      .eq('id', id)
      .single();

    if (fetchErr || !fileRecord) throw new Error('Record not found');

    const { error: storageErr } = await supabase
      .storage
      .from(bucketName)
      .remove([fileRecord.storage_key]);

    if (storageErr) console.warn('Storage deletion warning:', storageErr);

    const { error: dbErr } = await supabase
      .from('files')
      .delete()
      .eq('id', id);

    if (dbErr) throw dbErr;

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
```[cite: 10]