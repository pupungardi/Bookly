'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, MessageCircle, Send } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type SupportMessage = {
  id: string
  conversation_id: string
  sender_id: string | null
  sender_role: 'user' | 'agent'
  body: string
  created_at: string
}

export default function LiveChatPage() {
  const router = useRouter()
  const supabase = React.useMemo(() => createClient(), [])
  const [userId, setUserId] = React.useState<string | null>(null)
  const [conversationId, setConversationId] = React.useState<string | null>(null)
  const [messages, setMessages] = React.useState<SupportMessage[]>([])
  const [message, setMessage] = React.useState('')
  const [loading, setLoading] = React.useState(true)
  const [sending, setSending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let active = true
    let channel: ReturnType<typeof supabase.channel> | null = null

    const loadChat = async () => {
      const { data: authData, error: authError } = await supabase.auth.getUser()
      if (!active) return
      if (authError || !authData.user) {
        setError('Silakan masuk terlebih dahulu untuk menghubungi Customer Support.')
        setLoading(false)
        return
      }

      setUserId(authData.user.id)
      const { data: existing, error: conversationError } = await supabase
        .from('support_conversations')
        .select('id')
        .eq('user_id', authData.user.id)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (conversationError) {
        setError('Percakapan belum dapat dimuat. Coba lagi sebentar.')
        setLoading(false)
        return
      }

      let activeConversationId = existing?.id ?? null
      if (!activeConversationId) {
        const { data: created, error: createError } = await supabase
          .from('support_conversations')
          .insert({ user_id: authData.user.id })
          .select('id')
          .single()
        if (createError) {
          setError('Percakapan belum dapat dibuat. Coba lagi sebentar.')
          setLoading(false)
          return
        }
        activeConversationId = created.id
      }

      const { data: loadedMessages, error: messagesError } = await supabase
        .from('support_messages')
        .select('id, conversation_id, sender_id, sender_role, body, created_at')
        .eq('conversation_id', activeConversationId)
        .order('created_at', { ascending: true })

      if (!active || messagesError) {
        setError('Pesan belum dapat dimuat. Coba lagi sebentar.')
        setLoading(false)
        return
      }

      setConversationId(activeConversationId)
      setMessages(loadedMessages ?? [])
      setLoading(false)

      channel = supabase
        .channel(`support-conversation-${activeConversationId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
          filter: `conversation_id=eq.${activeConversationId}`,
        }, (payload) => {
          const incoming = payload.new as SupportMessage
          setMessages((current) => current.some((item) => item.id === incoming.id) ? current : [...current, incoming])
        })
        .subscribe()
    }

    void loadChat()
    return () => {
      active = false
      if (channel) void supabase.removeChannel(channel)
    }
  }, [supabase])

  const sendMessage = async (event: React.FormEvent) => {
    event.preventDefault()
    const body = message.trim()
    if (!body || !conversationId || !userId || sending) return

    setSending(true)
    setError(null)
    const { error: sendError } = await supabase.from('support_messages').insert({
      conversation_id: conversationId,
      sender_id: userId,
      sender_role: 'user',
      body,
    })
    if (sendError) setError('Pesan belum terkirim. Silakan coba lagi.')
    else setMessage('')
    setSending(false)
  }

  return (
    <div className="min-h-screen h-dvh bg-stone-50 flex flex-col">
      <header className="bg-white border-b border-stone-100 px-4 sm:px-6 py-4 flex items-center gap-4 shrink-0">
        <button aria-label="Kembali" onClick={() => router.back()} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600"><MessageCircle size={20} /></div>
          <div>
            <h1 className="text-sm font-bold text-stone-900 leading-none">Customer Support</h1>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />Live</span>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4">
        {loading && <p className="text-center text-sm text-stone-400">Menghubungkan ke Customer Support...</p>}
        {!loading && !error && messages.length === 0 && <div className="self-start bg-white p-4 rounded-2xl rounded-tl-none max-w-[80%] shadow-sm border border-stone-100"><p className="text-sm text-stone-800">Halo! Ada yang bisa kami bantu hari ini?</p></div>}
        {messages.map((item) => <div key={item.id} className={`p-4 rounded-2xl max-w-[80%] shadow-sm ${item.sender_role === 'user' ? 'self-end bg-emerald-600 text-white rounded-br-none' : 'self-start bg-white text-stone-800 rounded-tl-none border border-stone-100'}`}><p className="text-sm whitespace-pre-wrap break-words">{item.body}</p><span className={`text-[10px] mt-1 block ${item.sender_role === 'user' ? 'text-emerald-100' : 'text-stone-400'}`}>{new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span></div>)}
        {error && <p className="text-center text-sm text-red-600 bg-red-50 rounded-xl p-3">{error}</p>}
      </main>

      <footer className="p-4 bg-white border-t border-stone-100 shrink-0">
        <form onSubmit={sendMessage} className="max-w-2xl mx-auto flex gap-2">
          <input aria-label="Pesan" type="text" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ketik pesan..." disabled={!conversationId || sending} className="flex-1 bg-stone-50 border border-stone-200 rounded-full px-6 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60" />
          <button aria-label="Kirim pesan" type="submit" disabled={!message.trim() || !conversationId || sending} className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100 disabled:opacity-50"><Send size={20} /></button>
        </form>
      </footer>
    </div>
  )
}
