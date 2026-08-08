import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ojyolplmbpkfsjjgpaox'
const supabaseKey = 'sb_publishable_pIloIoFyTctlPP0DHZTkew_Kcr5iTMU'

export const supabase = createClient(supabaseUrl, supabaseKey)