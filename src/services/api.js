import { supabase } from './supabase'

export const likePost = async (postId) => {
  try {
    const response = await supabase.functions.invoke('like-post', {
      body: { post_id: postId }
    })
    
    if (response.error) throw response.error
    return response.data
  } catch (error) {
    console.error('Error in likePost:', error)
    throw error
  }
}

export const addComment = async (postId, comment, postOwnerId) => {
  try {
    const response = await supabase.functions.invoke('notify-comment', {
      body: { 
        post_id: postId, 
        comment,
        post_owner_id: postOwnerId
      }
    })
    
    if (response.error) throw response.error
    return response.data
  } catch (error) {
    console.error('Error in addComment:', error)
    throw error
  }
}

export const followUser = async (followingId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    const { data, error } = await supabase
      .from('followers1')
      .insert({ follower_id: user.id, following_id: followingId })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error in followUser:', error)
    throw error
  }
}

export const unfollowUser = async (followingId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    const { data, error } = await supabase
      .from('followers1')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', followingId)

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error in unfollowUser:', error)
    throw error
  }
}