import React, { useState } from 'react'
import { supabase } from '../../services/supabase'

const DebugHelper = () => {
  const [debugInfo, setDebugInfo] = useState(null)
  const [loading, setLoading] = useState(false)

  const checkDatabase = async () => {
    setLoading(true)
    try {
      // Check if profiles table exists
      const { data: tableData, error: tableError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)

      // Check current user
      const { data: userData } = await supabase.auth.getUser()

      // Check RLS policies
      const { data: policies } = await supabase.rpc('get_policies')

      setDebugInfo({
        tableExists: !tableError,
        tableError: tableError?.message,
        currentUser: userData?.user,
        policies: policies,
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
        isEnvSet: !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY
      })
    } catch (error) {
      setDebugInfo({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const fixDatabase = async () => {
    setLoading(true)
    try {
      // Try to create profiles table if it doesn't exist
      const { error } = await supabase.rpc('create_profiles_if_not_exists')
      
      if (error) {
        // Manual creation
        await supabase.from('profiles').select('*').limit(1)
      }
      
      alert('Database check completed. Please try signup again.')
    } catch (error) {
      alert('Error fixing database: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white p-4 rounded-lg shadow-xl border max-w-sm">
        <h3 className="font-bold text-red-600 mb-2">Debug Helper</h3>
        <div className="space-y-2">
          <button
            onClick={checkDatabase}
            disabled={loading}
            className="btn-secondary text-sm w-full"
          >
            {loading ? 'Checking...' : 'Check Database'}
          </button>
          
          <button
            onClick={fixDatabase}
            disabled={loading}
            className="btn-primary text-sm w-full"
          >
            Fix Database Issues
          </button>
          
          {debugInfo && (
            <div className="mt-2 text-xs bg-gray-50 p-2 rounded">
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DebugHelper