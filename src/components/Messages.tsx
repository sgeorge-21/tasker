import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const Messages: React.FC<{ currentUser: any; onClose: () => void }> = ({ currentUser, onClose }) => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [text, setText] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');

  useEffect(() => {
    fetchMessages();
  }, [currentUser]);

  const fetchMessages = async () => {
    const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: true });
    if (data) setConversations(data as any[]);
  };

  const send = async () => {
    if (!currentUser) {
      alert('Please sign in to send messages');
      return;
    }
    // try find recipient
    const { data: users } = await supabase.from('profiles').select('id,email').eq('email', recipientEmail).limit(1);
    if (!users || users.length === 0) {
      alert('Recipient not found (they must sign up first)');
      return;
    }
    const receiverId = users[0].id;
    await supabase.from('messages').insert([{ sender_id: currentUser.id, receiver_id: receiverId, message: text }]);
    setText('');
    fetchMessages();
  };

  if (!currentUser) {
    return (
      <div className="p-4">
        <p className="text-sm">Sign in to view and send messages.</p>
        <div className="pt-4">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    );
  }

  const userConversations = conversations.filter(c => c.sender_id === currentUser.id || c.receiver_id === currentUser.id);

  return (
    <div className="p-4 grid grid-cols-3 gap-4">
      <div className="col-span-1">
        <h4 className="font-semibold mb-2">Conversations</h4>
        <div className="space-y-2">
          {userConversations.map(c => {
            const otherId = c.sender_id === currentUser.id ? c.receiver_id : c.sender_id;
            return (
              <button key={c.id} className="w-full text-left p-2 rounded hover:bg-gray-50" onClick={() => setSelected(c)}>
                <div className="text-sm">With: {otherId}</div>
                <div className="text-xs text-gray-500">{c.message.slice(0, 50)}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="col-span-2">
        <h4 className="font-semibold mb-2">New message</h4>
        <div className="mb-2">
          <Input placeholder="Recipient email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} />
        </div>
        <div className="mb-2">
          <Input placeholder="Message" value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <Button onClick={send}>Send</Button>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>

        <div className="mt-6">
          <h4 className="font-semibold">All messages</h4>
          <div className="space-y-2 mt-2 max-h-64 overflow-y-auto">
            {userConversations.map(m => (
              <div key={m.id} className={`p-2 rounded ${m.sender_id === currentUser.id ? 'bg-blue-50' : 'bg-gray-50'}`}>
                <div className="text-xs text-gray-500">From: {m.sender_id} • To: {m.receiver_id}</div>
                <div className="text-sm">{m.message}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
