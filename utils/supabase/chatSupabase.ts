import { createClient } from './client';
import { UIMessage } from 'ai';

/**
 * @typedef {Object} ChatData
 * @property {string} chat_id - El ID único del chat.
 * @property {UIMessage[]} messages - El array de mensajes del chat.
 * @property {string | null} user_id - El ID del usuario, o null si no está logueado.
 */

/**
 * Guarda los mensajes de un chat en Supabase.
 * Si el chat ya existe para el user_id y chat_id dados, lo actualiza.
 * Si no, crea un nuevo registro.
 *
 * @param {ChatData} data - Los datos del chat a guardar.
 * @returns {Promise<any | null>} Los datos del chat guardados o actualizados, o null si hay un error.
 */
export async function saveChatMessages(data: { chat_id: string; messages: UIMessage[]; user_id: string | null }) {
  const supabase = createClient();
  const { chat_id, messages, user_id } = data;

  if (!user_id) {
    console.warn('No user_id provided, skipping Supabase save.');
    return null;
  }

  // Intentar encontrar un chat existente
  const { data: existingChat, error: fetchError } = await supabase
    .from('chats')
    .select('*')
    .eq('user_id', user_id)
    .eq('chat_id', chat_id)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows found
    console.error('Error fetching existing chat:', fetchError);
    return null;
  }

  if (existingChat) {
    // Actualizar chat existente
    const { data: updatedChat, error: updateError } = await supabase
      .from('chats')
      .update({ messages: messages, updated_at: new Date().toISOString() })
      .eq('id', existingChat.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating chat messages:', updateError);
      return null;
    }
    return updatedChat;
  } else {
    // Crear nuevo chat
    const { data: newChat, error: insertError } = await supabase
      .from('chats')
      .insert({ user_id, chat_id, messages })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting new chat:', insertError);
      return null;
    }
    return newChat;
  }
}

/**
 * Carga los mensajes de un chat desde Supabase para un usuario y chat_id específicos.
 *
 * @param {string} chat_id - El ID único del chat.
 * @param {string} user_id - El ID del usuario.
 * @returns {Promise<Message[] | null>} El array de mensajes del chat, o null si no se encuentra o hay un error.
 */
export async function loadChatMessages(chat_id: string, user_id: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('chats')
    .select('messages')
    .eq('user_id', user_id)
    .eq('chat_id', chat_id)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
    console.error('Error loading chat messages:', error);
    return null;
  }

  return data ? (data.messages as UIMessage[]) : null;
}

/**
 * Elimina un chat de Supabase.
 *
 * @param {string} chat_id - El ID único del chat a eliminar.
 * @param {string} user_id - El ID del usuario propietario del chat.
 * @returns {Promise<boolean>} True si se eliminó correctamente, false en caso contrario.
 */
export async function deleteChatMessages(chat_id: string, user_id: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from('chats')
    .delete()
    .eq('user_id', user_id)
    .eq('chat_id', chat_id);

  if (error) {
    console.error('Error deleting chat messages:', error);
    return false;
  }
  return true;
}
