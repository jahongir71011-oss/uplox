const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

exports.handler = async (event, context) => {
  const fileId = event.queryStringParameters.id;
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
    const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'uplox-files';

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: fileRecord, error: fetchErr } = await supabase
      .from('files')
      .select('storage_key, filename')
      .eq('id', fileId)
      .single();

    if (fetchErr || !fileRecord) throw new Error('File not found');

    const { data, error } = await supabase
      .storage
      .from(bucketName)
      .createSignedUrl(fileRecord.storage_key, 60, {
        download: fileRecord.filename
      });

    if (error) throw error;

    return {
      statusCode: 200,
      body: JSON.stringify({ downloadUrl: data.signedUrl })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
```[cite: 11]