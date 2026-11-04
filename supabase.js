
import { createClient } from
'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// AVIATORS JOURNAL - SUPABASE CONNECTION

const SUPABASE_URL =
'https://avcnpezttzbkzghkgzsj.supabase.co';

const SUPABASE_PUBLISHABLE_KEY =
'sb_publishable_iKsnSTHyge63y1sqSYdnkw_KvcdHKcG';

export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

console.log('Aviators Journal: Supabase initialized!');
