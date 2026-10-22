javascript
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { filename, storageKey, username, fileSize, mimeType } = JSON.parse(event.body || '{}');

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from('files')
      .insert([
        {
          filename,
          storage_key: storageKey,
          username,
          file_size: fileSize,
          mime_type: mimeType,
          created_at: new Date().toISOString()
        }
      ]);

    if (error) throw error;

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
```[cite: 14]