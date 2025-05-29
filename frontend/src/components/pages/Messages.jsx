import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, Divider, TextField, Button, CircularProgress, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  // Fetch all conversations (unique users you've messaged with)
  useEffect(() => {
    const fetchConversations = async () => {
      setLoadingConversations(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/messages/user/${currentUser._id}`);
        setConversations(res.data.users || []);
      } catch (err) {
        setConversations([]);
      } finally {
        setLoadingConversations(false);
      }
    };
    if (currentUser._id) fetchConversations();
  }, [currentUser._id]);

  // Fetch messages with selected user
  useEffect(() => {
    if (!selectedUser) return;
    setLoadingMessages(true);
    axios.get(`http://localhost:5000/api/messages/conversation?user1=${currentUser._id}&user2=${selectedUser._id}`)
      .then(res => setMessages(res.data.messages || []))
      .catch(() => setMessages([]))
      .finally(() => setLoadingMessages(false));
  }, [selectedUser, currentUser._id]);

  const handleSend = async () => {
    if (!message.trim() || !selectedUser) return;
    setSending(true);
    try {
      await axios.post('http://localhost:5000/api/messages', {
        sender: currentUser._id,
        receiver: selectedUser._id,
        content: message,
      });
      setMessages(prev => [...prev, { sender: currentUser._id, receiver: selectedUser._id, content: message, sentAt: new Date() }]);
      setMessage('');
    } catch (err) {}
    setSending(false);
  };

  return (
    <Box display="flex" height="80vh" maxWidth={900} mx="auto" mt={6} boxShadow={2} borderRadius={3} overflow="hidden">
      {/* Conversation List */}
      <Paper sx={{ width: 280, borderRight: '1px solid #eee', bgcolor: '#fafafa', p: 0 }}>
        <Box p={2} borderBottom="1px solid #eee">
          <Typography variant="h6" fontWeight={700} display="flex" alignItems="center" gap={1}>
            <Mail size={20} /> Messages
          </Typography>
        </Box>
        {loadingConversations ? (
          <Box display="flex" justifyContent="center" alignItems="center" height={100}><CircularProgress size={24} /></Box>
        ) : (
          <List>
            {conversations.length === 0 && <Typography color="text.secondary" align="center" mt={2}>No conversations yet.</Typography>}
            {conversations.map(user => (
              <ListItem button key={user._id} selected={selectedUser?._id === user._id} onClick={() => setSelectedUser(user)}>
                <ListItemAvatar>
                  <Avatar src={user.profilePicture || '/default.png'} />
                </ListItemAvatar>
                <ListItemText primary={user.name} secondary={user.email} />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
      {/* Chat Area */}
      <Box flex={1} display="flex" flexDirection="column" bgcolor="#fff">
        {selectedUser ? (
          <>
            <Box p={2} borderBottom="1px solid #eee" bgcolor="#f5f5f5">
              <Typography fontWeight={700}>{selectedUser.name}</Typography>
              <Typography variant="caption" color="text.secondary">{selectedUser.email}</Typography>
            </Box>
            <Box flex={1} p={2} overflow="auto" display="flex" flexDirection="column" gap={1}>
              {loadingMessages ? (
                <Box flex={1} display="flex" alignItems="center" justifyContent="center"><CircularProgress size={24} /></Box>
              ) : messages.length === 0 ? (
                <Typography color="text.secondary" align="center">No messages yet.</Typography>
              ) : (
                messages.map((msg, idx) => (
                  <Box
                    key={idx}
                    alignSelf={msg.sender === currentUser._id ? 'flex-end' : 'flex-start'}
                    bgcolor={msg.sender === currentUser._id ? '#f59e42' : '#e0e0e0'}
                    color={msg.sender === currentUser._id ? 'white' : 'black'}
                    px={2} py={1} borderRadius={2} maxWidth="70%"
                  >
                    {msg.content}
                    <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: msg.sender === currentUser._id ? 'rgba(255,255,255,0.7)' : 'gray', textAlign: msg.sender === currentUser._id ? 'right' : 'left' }}>
                      {msg.sentAt ? new Date(msg.sentAt).toLocaleTimeString() : ''}
                    </Typography>
                  </Box>
                ))
              )}
            </Box>
            <Divider />
            <Box p={2} display="flex" gap={1} borderTop="1px solid #eee">
              <TextField
                placeholder="Type your message..."
                fullWidth
                value={message}
                onChange={e => setMessage(e.target.value)}
                disabled={sending}
                size="small"
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              />
              <Button
                variant="contained"
                sx={{ backgroundColor: '#f59e42', color: 'white', fontWeight: 'bold', borderRadius: '6px', px: 2, '&:hover': { backgroundColor: '#e6892f' } }}
                onClick={handleSend}
                disabled={sending || !message.trim()}
              >
                Send
              </Button>
            </Box>
          </>
        ) : (
          <Box flex={1} display="flex" alignItems="center" justifyContent="center">
            <Typography color="text.secondary">Select a conversation to start chatting.</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Messages; 