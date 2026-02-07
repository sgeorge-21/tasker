import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://aozeysezfndzwqozecjl.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjE4NzIzY2MxLWVmZDQtNGRkMy05NjUzLWY3OTdhM2Y1NjNkZiJ9.eyJwcm9qZWN0SWQiOiJhb3pleXNlemZuZHp3cW96ZWNqbCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzYyODY5MDU3LCJleHAiOjIwNzgyMjkwNTcsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.0aN-KfknYKX8iKVKQpmoBR5WmVaTdxTSjdR5CcugOIk';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };