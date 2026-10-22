const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { filename, mimeType, username } = JSON.parse(event.body || '{}');

    if (!filename || !username) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing parameters' }) };
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'uplox-files';

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const safeFilename = filename.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const storageKey = `uploads/${Date.now()}_${safeFilename}`;

    const { data, error } = await supabase
      .storage
      .from(bucketName)
      .createSignedUploadUrl(storageKey);

    if (error) throw error;

    return {
      statusCode: 200,
      body: JSON.stringify({
        signedUrl: data.signedUrl,
        storageKey: storageKey,
        token: data.token
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
```[cite: 12]