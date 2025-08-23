import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, X, Shield, CheckCircle, AlertTriangle, Users, HeadphonesIcon } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface ChatMessage {
  id: string;
  message: string;
  sender: 'user' | 'support';
  timestamp: Date;
  senderName: string;
}

export default function Contact() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    inquiryType: '',
    honeypot: '', // Spam protection honeypot field
    captcha: '', // Simple math captcha
    userAgent: '',
    timestamp: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaQuestion, setCaptchaQuestion] = useState({ question: '', answer: 0 });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  // Generate simple math captcha
  useEffect(() => {
    const generateCaptcha = () => {
      const num1 = Math.floor(Math.random() * 10) + 1;
      const num2 = Math.floor(Math.random() * 10) + 1;
      setCaptchaQuestion({
        question: `What is ${num1} + ${num2}?`,
        answer: num1 + num2
      });
    };
    generateCaptcha();

    // Set user agent and timestamp for spam detection
    setFormData(prev => ({
      ...prev,
      userAgent: navigator.userAgent,
      timestamp: Date.now().toString()
    }));
  }, []);

  // WebSocket connection for chat
  useEffect(() => {
    if (isChatOpen && !ws) {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      const websocket = new WebSocket(wsUrl);

      websocket.onopen = () => {
        setIsConnected(true);
        setWs(websocket);
        // Send initial support request
        websocket.send(JSON.stringify({
          type: 'join_support',
          userId: user?.id || 'guest',
          userName: user?.fullName || 'Guest User'
        }));
      };

      websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'support_message') {
          setChatMessages(prev => [...prev, {
            id: data.id,
            message: data.message,
            sender: data.sender,
            timestamp: new Date(data.timestamp),
            senderName: data.senderName
          }]);
        }
      };

      websocket.onclose = () => {
        setIsConnected(false);
        setWs(null);
      };

      return () => {
        websocket.close();
      };
    }
  }, [isChatOpen, user]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const contactFormMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/contact', {
        method: 'POST',
        body: data
      }
      );
    },
    onSuccess: () => {
      toast({
        title: 'Message Sent Successfully',
        description: 'Thank you for contacting us. We\'ll get back to you within 24 hours.',
      });
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        inquiryType: '',
        honeypot: '',
        captcha: '',
        userAgent: navigator.userAgent,
        timestamp: Date.now().toString()
      });
      // Generate new captcha
      const num1 = Math.floor(Math.random() * 10) + 1;
      const num2 = Math.floor(Math.random() * 10) + 1;
      setCaptchaQuestion({
        question: `What is ${num1} + ${num2}?`,
        answer: num1 + num2
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to Send Message',
        description: error.message || 'Please try again later or contact us directly.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Spam protection validations
    if (formData.honeypot) {
      toast({
        title: 'Spam Detected',
        description: 'Please fill out the form correctly.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }

    if (parseInt(formData.captcha) !== captchaQuestion.answer) {
      toast({
        title: 'Incorrect Answer',
        description: 'Please solve the math problem correctly.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }

    // Rate limiting check - prevent rapid submissions
    const lastSubmission = localStorage.getItem('lastContactSubmission');
    const now = Date.now();
    if (lastSubmission && now - parseInt(lastSubmission) < 60000) { // 1 minute cooldown
      toast({
        title: 'Too Many Requests',
        description: 'Please wait before sending another message.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }

    try {
      await contactFormMutation.mutateAsync(formData);
      localStorage.setItem('lastContactSubmission', now.toString());
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const sendChatMessage = () => {
    if (!chatInput.trim() || !ws || !isConnected) return;

    const message = {
      type: 'support_message',
      message: chatInput.trim(),
      sender: 'user',
      senderName: user?.fullName || 'Guest User',
      timestamp: new Date().toISOString()
    };

    ws.send(JSON.stringify(message));
    setChatInput('');
  };

  const handleChatKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      content: "hello@waitumusic.com",
      description: "We'll respond within 24 hours"
    },
    {
      icon: Phone,
      title: "Call Us",
      content: "+1 (555) 123-4567",
      description: "Mon-Fri, 9am-6pm PST"
    },
    {
      icon: MapPin,
      title: "Visit Us",
      content: "123 Music Row, Nashville, TN",
      description: "By appointment only"
    },
    {
      icon: Clock,
      title: "Support Hours",
      content: "24/7 Online Support",
      description: "Live chat available"
    }
  ];

  const inquiryTypes = [
    "General Inquiry",
    "Artist Registration",
    "Booking Request",
    "Technical Support",
    "Partnership Opportunity",
    "Media & Press",
    "Billing Question"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-blue-900">
      {/* Hero Section */}
      <section className="py-24 px-4 relative">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="mb-6 px-6 py-3 bg-white/10 backdrop-blur-sm border-white/20 text-white text-lg font-medium">
            <Mail className="w-4 h-4 mr-2" />
            Get in Touch
          </Badge>
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 tracking-tight">
            Let's Start a{" "}
            <span className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
              Conversation
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-4xl mx-auto leading-relaxed">
            Have a question, want to partner with us, or ready to join our platform?
            We'd love to hear from you. Our team is here to help you{" "}
            <span className="text-yellow-400 font-semibold">succeed</span>.
          </p>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {contactInfo.map((info, index) => {
              const IconComponent = info.icon;
              const gradients = [
                'from-yellow-400 to-orange-500',
                'from-pink-400 to-red-500',
                'from-purple-400 to-indigo-500',
                'from-blue-400 to-cyan-500'
              ];
              return (
                <Card key={index} className="text-center hover:shadow-2xl transition-all duration-300 border-0 shadow-lg group hover:scale-105">
                  <CardContent className="p-8">
                    <div className={`w-16 h-16 bg-gradient-to-br ${gradients[index]} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-3 text-lg group-hover:text-purple-600 transition-colors duration-300">{info.title}</h3>
                    <p className="text-purple-600 font-semibold mb-2">{info.content}</p>
                    <p className="text-sm text-gray-600">{info.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Contact Form */}
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Send us a Message</h2>
              <p className="text-gray-600 mb-8">
                Fill out the form below and we'll get back to you as soon as possible.
                For urgent matters, please call us directly.
              </p>

              <Card>
                <CardHeader>
                  <CardTitle>Contact Form</CardTitle>
                  <CardDescription>
                    We typically respond within 24 hours during business days.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Your full name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="inquiryType">Inquiry Type</Label>
                      <Select value={formData.inquiryType} onValueChange={(value) => handleInputChange('inquiryType', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select inquiry type" />
                        </SelectTrigger>
                        <SelectContent>
                          {inquiryTypes.map((type) => (
                            <SelectItem key={type} value={type.toLowerCase().replace(/\s+/g, '-')}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        placeholder="Brief description of your inquiry"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        placeholder="Tell us more about your inquiry..."
                        rows={6}
                        required
                      />
                    </div>

                    {/* Honeypot field - hidden from users */}
                    <div className="hidden">
                      <Label htmlFor="honeypot">Leave this field empty</Label>
                      <Input
                        id="honeypot"
                        value={formData.honeypot}
                        onChange={(e) => handleInputChange('honeypot', e.target.value)}
                        tabIndex={-1}
                        autoComplete="off"
                      />
                    </div>

                    {/* Math Captcha */}
                    <div className="space-y-2">
                      <Label htmlFor="captcha" className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-green-600" />
                        Security Check: {captchaQuestion.question} *
                      </Label>
                      <Input
                        id="captcha"
                        type="number"
                        value={formData.captcha}
                        onChange={(e) => handleInputChange('captcha', e.target.value)}
                        placeholder="Enter your answer"
                        required
                        className="max-w-32"
                      />
                    </div>

                    {/* Spam Protection Indicators */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-green-800">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Spam Protection Active</span>
                      </div>
                      <div className="mt-2 text-sm text-green-700 space-y-1">
                        <div className="flex items-center gap-2">
                          <Shield className="h-3 w-3" />
                          <span>Advanced filtering enabled</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Rate limiting protection</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3" />
                          <span>Secure form validation</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      disabled={isSubmitting || contactFormMutation.isPending}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Secure Message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Additional Info */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">How do I join as an artist?</h4>
                    <p className="text-gray-600 text-sm">
                      Click "Get Started" in the navigation menu and follow the registration process.
                      You can choose between independent or managed artist tiers.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">What are your commission rates?</h4>
                    <p className="text-gray-600 text-sm">
                      We offer 100% base price payouts to artists. Our transparent fee structure
                      ensures you keep what you earn from your music.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Do you offer international support?</h4>
                    <p className="text-gray-600 text-sm">
                      Yes! We support artists and professionals worldwide with global distribution
                      and localized support in multiple time zones.
                    </p>
                  </div>
                </div>
              </div>

              <Card className="bg-gradient-to-br from-purple-600 to-blue-600 text-white border-0 shadow-xl">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <HeadphonesIcon className="h-6 w-6" />
                    Need Immediate Help?
                  </h3>
                  <p className="mb-6 opacity-90">
                    Our support team is available 24/7 to assist with urgent technical issues
                    or time-sensitive opportunities.
                  </p>
                  <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
                    <DialogTrigger asChild>
                      <Button variant="secondary" className="text-purple-600 font-semibold w-full bg-white hover:bg-gray-50">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Start Live Chat
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md h-[600px] flex flex-col p-0">
                      <DialogHeader className="p-4 border-b bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
                        <DialogTitle className="flex items-center gap-2">
                          <MessageCircle className="h-5 w-5" />
                          Live Support Chat
                          {isConnected && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                              Online
                            </Badge>
                          )}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-purple-100 mt-1">
                          Chat with our support team 24/7.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="flex-1 flex flex-col">
                        {/* Chat Header */}
                        <div className="p-3 bg-gray-50 border-b">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-purple-100 text-purple-600 text-xs">
                                <Users className="w-4 h-4" />
                              </AvatarFallback>
                            </Avatar>

                            <div>
                              <p className="font-medium text-sm">Wai'tuMusic Support</p>
                              <p className="text-xs text-gray-500">
                                {isConnected ? 'Online now' : 'Connecting...'}
                              </p>
                            </div>

                          </div>
                        </div>

                        {/* Messages Area */}
                        <ScrollArea className="flex-1 p-4">
                          <div className="space-y-4">
                            {/* Welcome Message */}
                            {chatMessages.length === 0 && (
                              <div className="flex items-start gap-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback className="bg-purple-100 text-purple-600 text-xs">
                                    <HeadphonesIcon className="w-4 h-4" />
                                  </AvatarFallback>
                                </Avatar>
                                <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                                  <p className="text-sm">
                                    Hello! Welcome to Wai'tuMusic support. How can we help you today?
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">Just now</p>
                                </div>
                              </div>
                            )}

                            {chatMessages.map((message) => (
                              <div key={message.id} className={`flex items-start gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback className={`text-xs ${message.sender === 'user'
                                    ? 'bg-blue-100 text-blue-600'
                                    : 'bg-purple-100 text-purple-600'
                                    }`}>
                                    {message.senderName.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className={`rounded-lg p-3 max-w-xs ${message.sender === 'user'
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-100'
                                  }`}>
                                  <p className="text-sm">{message.message}</p>
                                  <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                                    }`}>
                                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                              </div>
                            ))}
                            <div ref={messagesEndRef} />
                          </div>
                        </ScrollArea>


                        {/* Message Input */}
                        <div className="p-4 border-t">
                          <div className="flex gap-2">
                            <Input
                              value={chatInput}
                              onChange={(e) => setChatInput(e.target.value)}
                              onKeyPress={handleChatKeyPress}
                              placeholder="Type your message..."
                              disabled={!isConnected}
                            />
                            <Button
                              onClick={sendChatMessage}
                              disabled={!chatInput.trim() || !isConnected}
                              size="sm"
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                          {!isConnected && (
                            <p className="text-xs text-gray-500 mt-2">Connecting to support...</p>
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <div className="mt-4 text-xs opacity-75">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="h-3 w-3" />
                      <span>End-to-end encrypted</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-3 w-3" />
                      <span>Secure self-hosted chat</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Office Hours</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monday - Friday</span>
                    <span className="font-medium">9:00 AM - 6:00 PM PST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Saturday</span>
                    <span className="font-medium">10:00 AM - 4:00 PM PST</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sunday</span>
                    <span className="font-medium">Closed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}