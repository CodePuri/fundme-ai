const { createClient } = require('@supabase/supabase-js');
const url = 'https://wduygrhtijvaevcwptnr.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkdXlncmh0aWp2YWV2Y3dwdG5yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODc1NDI2MSwiZXhwIjoyMDk0MzMwMjYxfQ.3kSbvqEdu6g8f9UCSjl6dVtKhAmdSmSL7YCB4_XigRs';
const supabase = createClient(url, key);
async function test() {
  const { data, error } = await supabase.from('onboarding_submissions').select('id').limit(1);
  console.log(error ? 'ERROR: ' + error.message : 'SUCCESS: ' + JSON.stringify(data));
}
test();
