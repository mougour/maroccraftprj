import React, { useState, useEffect } from 'react'; 
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Box,
  Card,
  Tabs,
  Tab,
  Divider,
  Typography,
  CircularProgress,
  Modal,
  Button,
  TextField
} from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

// Removed CoverImage import as we no longer display a cover image
// Components
import ArtisanInfo from '../ArtisanProfile/ArtisanInfo';
import ArtisanStats from '../ArtisanProfile/ArtisanStats';
import ProductList from '../ArtisanProfile/Products/ProductList';
import ReviewsTab from '../ArtisanProfile/Reviews/ReviewsTab';
import AboutTab from '../ArtisanProfile/About/AboutTab';

// Types
import { ArtisanData } from '../../types/index';

const ArtisanProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [artisanData, setArtisanData] = useState<ArtisanData | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const senderId = currentUser?._id;
  const receiverId = id;

  // Fetch conversation when modal opens
  useEffect(() => {
    if (openModal && senderId && receiverId) {
      setLoadingMessages(true);
      axios.get(`http://localhost:5000/api/messages/conversation?user1=${senderId}&user2=${receiverId}`)
        .then(res => {
          setMessages(res.data.messages || []);
        })
        .catch(() => setMessages([]))
        .finally(() => setLoadingMessages(false));
    }
  }, [openModal, senderId, receiverId]);

  // Handler for tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSendMessage = async () => {
    setSending(true);
    setSendResult(null);
    try {
      await axios.post('http://localhost:5000/api/messages', {
        sender: senderId,
        receiver: receiverId,
        content: message,
      });
      // Optimistically add the message to the chat
      setMessages(prev => [...prev, { sender: senderId, receiver: receiverId, content: message, sentAt: new Date() }]);
      setSendResult('Message sent!');
      setMessage('');
    } catch (err) {
      setSendResult('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  // Fetch artisan data using Axios
  useEffect(() => {
    const fetchArtisanData = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`http://localhost:5000/api/users/${id}`);
        setArtisanData(response.data);
      } catch (err) {
        console.error('Error fetching artisan data:', err);
        setError('Failed to load artisan profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchArtisanData();
  }, [id]);

  if (loading) {
    return (
      <Container 
        maxWidth="lg" 
        sx={{ 
          mt: 8, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          flexDirection: 'column', 
          gap: 2 
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6">
          Loading artisan profile...
        </Typography>
      </Container>
    );
  }

  if (error || !artisanData) {
    return (
      <Container maxWidth="lg" sx={{ mt: 8 }}>
        <Typography variant="h5" align="center" color="error">
          {error || 'Artisan not found.'}
        </Typography>
      </Container>
    );
  }

  // Retrieve token from localStorage (ensure it's set when the user logs in)
  const token = localStorage.getItem('token') || '';

  return (
    <Box>
      {/* Toast notifications container */}
      <ToastContainer position="bottom-center" />
      
      {/* Only Profile Image will be used inside ArtisanInfo; cover image is removed */}
      <Container maxWidth="lg" sx={{ mt: 4, position: 'relative', zIndex: 1 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card 
              sx={{ 
                p: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                borderRadius: 2
              }}
            >
              {/* Artisan Info Section */}
              <ArtisanInfo artisanData={artisanData} />

              {/* Send Message Button */}
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  sx={{ backgroundColor: '#f59e42', color: 'white', fontWeight: 'bold', borderRadius: '6px', px: 3, py: 1, '&:hover': { backgroundColor: '#e6892f' } }}
                  onClick={() => setOpenModal(true)}
                >
                  Send Message
                </Button>
              </Box>

              {/* Send Message Modal */}
              <Modal open={openModal} onClose={() => { setOpenModal(false); setSendResult(null); }}>
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', boxShadow: 24, p: 0, borderRadius: 2, minWidth: 350, width: 400, maxHeight: 500, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" sx={{ p: 2, borderBottom: '1px solid #eee' }}>Contact Artisan</Typography>
                  <Box sx={{ flex: 1, overflowY: 'auto', p: 2, bgcolor: '#fafafa', display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {loadingMessages ? (
                      <Typography>Loading messages...</Typography>
                    ) : messages.length === 0 ? (
                      <Typography color="text.secondary">No messages yet.</Typography>
                    ) : (
                      messages.map((msg, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            alignSelf: msg.sender === senderId ? 'flex-end' : 'flex-start',
                            bgcolor: msg.sender === senderId ? '#f59e42' : '#e0e0e0',
                            color: msg.sender === senderId ? 'white' : 'black',
                            px: 2, py: 1, borderRadius: 2, maxWidth: '70%',
                            mb: 0.5,
                          }}
                        >
                          {msg.content}
                          <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: msg.sender === senderId ? 'rgba(255,255,255,0.7)' : 'gray', textAlign: msg.sender === senderId ? 'right' : 'left' }}>
                            {msg.sentAt ? new Date(msg.sentAt).toLocaleTimeString() : ''}
                          </Typography>
                        </Box>
                      ))
                    )}
                  </Box>
                  <Box sx={{ p: 2, borderTop: '1px solid #eee', display: 'flex', gap: 1 }}>
                    <TextField
                      placeholder="Type your message..."
                      fullWidth
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      disabled={sending}
                      size="small"
                    />
                    <Button
                      variant="contained"
                      sx={{ backgroundColor: '#f59e42', color: 'white', fontWeight: 'bold', borderRadius: '6px', px: 2, '&:hover': { backgroundColor: '#e6892f' } }}
                      onClick={handleSendMessage}
                      disabled={sending || !message.trim()}
                    >
                      {sending ? '...' : 'Send'}
                    </Button>
                  </Box>
                  {sendResult && <Typography align="center" mt={1} color={sendResult === 'Message sent!' ? 'success.main' : 'error.main'}>{sendResult}</Typography>}
                </Box>
              </Modal>

              <Divider sx={{ my: 3 }} />

              {/* Stats Section */}
              <ArtisanStats stats={artisanData.stats} />
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Box 
              sx={{ 
                borderBottom: 1, 
                borderColor: 'divider', 
                mb: 3,
                '& .MuiTab-root': {
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.04)'
                  }
                }
              }}
            >
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{ 
                  '& .Mui-selected': {
                    fontWeight: 'bold'
                  }
                }}
              >
                <Tab label="Products" />
                <Tab label="Reviews" />
                <Tab label="About" />
              </Tabs>
            </Box>

            {/* Tab Content */}
            <Box sx={{ py: 2 }}>
              {activeTab === 0 && (
                // Pass the artisanData (user) and token to ProductList so it can fetch products via axios
                <ProductList user={artisanData} token={token} />
              )}

              {activeTab === 1 && (
                <ReviewsTab artisanId={artisanData.id} />
              )}

              {activeTab === 2 && (
                <AboutTab artisanData={artisanData} />
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ArtisanProfile;
