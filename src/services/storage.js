import { supabase } from './supabase'

export const uploadImage = async (file, userId, type = 'post') => {
  try {
    const fileExt = file.name.split('.').pop()
    const timestamp = Date.now()
    const fileName = `${type}_${timestamp}_${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `${userId}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('images1')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('images1')
      .getPublicUrl(filePath)

    return { publicUrl, filePath }
  } catch (error) {
    console.error('Error uploading image:', error)
    throw error
  }
}

export const deleteImage = async (filePath) => {
  try {
    const { error } = await supabase.storage
      .from('images1')
      .remove([filePath])

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting image:', error)
    throw error
  }
}