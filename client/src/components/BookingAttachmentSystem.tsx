import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Shield, Check, X, AlertTriangle, Paperclip, MessageSquare } from 'lucide-react';

interface BookingAttachment {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadTimestamp: string;
  clamavScanStatus: 'pending' | 'clean' | 'infected' | 'error';
  adminApprovalStatus: 'pending' | 'approved' | 'rejected';
  attachmentType: string;
  description: string;
}

interface BookingMessage {
  id: number;
  senderName: string;
  messageText: string;
  messageType: string;
  isInternal: boolean;
  createdAt: string;
  documentPath?: string;
}

interface BookingAttachmentSystemProps {
  bookingId: number;
  currentUserId: number;
  userRole: string;
}

export default function BookingAttachmentSystem({ bookingId, currentUserId, userRole }: BookingAttachmentSystemProps) {
  const [attachments, setAttachments] = useState<BookingAttachment[]>([]);
  const [messages, setMessages] = useState<BookingMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File upload handler with ClamAV scanning
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bookingId', bookingId.toString());
      formData.append('uploadedBy', currentUserId.toString());
      formData.append('attachmentType', determineAttachmentType(file.name));
      formData.append('description', `${file.name} uploaded by user`);

      try {
        // Upload with ClamAV scanning
        const response = await fetch('/api/booking-attachments/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          setAttachments(prev => [...prev, result.attachment]);
          setUploadProgress(prev => prev + (100 / files.length));
          
          // Show scan status
          if (result.attachment.clamavScanStatus === 'pending') {
            // Poll for scan results
            pollScanStatus(result.attachment.id);
          }
        } else {
          console.error('Upload failed:', await response.text());
        }
      } catch (error) {
        console.error('Upload error:', error);
      }
    }

    setIsUploading(false);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Poll ClamAV scan status
  const pollScanStatus = async (attachmentId: number) => {
    const maxAttempts = 30; // 30 seconds max
    let attempts = 0;

    const poll = async () => {
      attempts++;
      try {
        const response = await fetch(`/api/booking-attachments/${attachmentId}/scan-status`);
        if (response.ok) {
          const result = await response.json();
          
          setAttachments(prev => 
            prev.map(att => 
              att.id === attachmentId 
                ? { ...att, clamavScanStatus: result.scanStatus, clamavScanResult: result.scanResult }
                : att
            )
          );

          if (result.scanStatus === 'pending' && attempts < maxAttempts) {
            setTimeout(poll, 1000); // Poll every second
          }
        }
      } catch (error) {
        console.error('Scan status poll error:', error);
      }
    };

    poll();
  };

  // Determine attachment type from filename
  const determineAttachmentType = (filename: string): string => {
    const lower = filename.toLowerCase();
    if (lower.includes('flight') || lower.includes('itinerary') || lower.includes('ticket')) return 'travel';
    if (lower.includes('flyer') || lower.includes('poster') || lower.includes('promo')) return 'promotional';
    if (lower.includes('contract') || lower.includes('agreement')) return 'legal';
    if (lower.includes('rider') || lower.includes('tech')) return 'technical';
    return 'general';
  };

  // Submit message (converted to markdown)
  const submitMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await fetch('/api/booking-messages/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          senderUserId: currentUserId,
          messageText: newMessage,
          messageType: 'general',
          isInternal: false
        })
      });

      if (response.ok) {
        const result = await response.json();
        setMessages(prev => [...prev, result.message]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Message send error:', error);
    }
  };

  // Admin approval handler
  const handleAdminApproval = async (attachmentId: number, approve: boolean) => {
    try {
      const response = await fetch(`/api/booking-attachments/${attachmentId}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approve,
          approvedBy: currentUserId
        })
      });

      if (response.ok) {
        setAttachments(prev =>
          prev.map(att =>
            att.id === attachmentId
              ? { ...att, adminApprovalStatus: approve ? 'approved' : 'rejected' }
              : att
          )
        );
      }
    } catch (error) {
      console.error('Approval error:', error);
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (scanStatus: string, approvalStatus: string) => {
    if (scanStatus === 'infected' || approvalStatus === 'rejected') return 'bg-red-100 text-red-800';
    if (scanStatus === 'pending' || approvalStatus === 'pending') return 'bg-yellow-100 text-yellow-800';
    if (scanStatus === 'clean' && approvalStatus === 'approved') return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Booking Messages Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Booking Communication
          </CardTitle>
          <p className="text-sm text-gray-600">
            Messages are automatically converted to markdown documents and stored securely
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Message Input */}
          <div className="space-y-3">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message here... (supports markdown formatting)"
              rows={4}
            />
            <Button onClick={submitMessage} disabled={!newMessage.trim()}>
              <FileText className="w-4 h-4 mr-2" />
              Send Message (Auto-Convert to .md)
            </Button>
          </div>

          {/* Messages Display */}
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {messages.map((message) => (
              <Card key={message.id} className="p-3">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-sm">{message.senderName}</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {message.messageType}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(message.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {message.messageText}
                </p>
                {message.documentPath && (
                  <div className="mt-2">
                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                      <FileText className="w-3 h-3 mr-1" />
                      Converted to .md document
                    </Badge>
                  </div>
                )}
              </Card>
            ))}
            {messages.length === 0 && (
              <p className="text-center text-gray-500 py-4">No messages yet. Start the conversation!</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="w-5 h-5 mr-2" />
            Booking Attachments
          </CardTitle>
          <p className="text-sm text-gray-600">
            Upload flight itineraries, travel info, flyers, and other booking-related documents
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Interface */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600 mb-3">
              Drop files here or click to browse
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt,.md"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              variant="outline"
            >
              <Paperclip className="w-4 h-4 mr-2" />
              {isUploading ? `Uploading... ${Math.round(uploadProgress)}%` : 'Choose Files'}
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Supported: PDF, DOC, DOCX, JPG, PNG, GIF, TXT, MD (Max 10MB each)
            </p>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}

          {/* Attachments List */}
          <div className="space-y-3">
            {attachments.map((attachment) => (
              <Card key={attachment.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {attachment.clamavScanStatus === 'clean' ? (
                        <Shield className="w-5 h-5 text-green-500" />
                      ) : attachment.clamavScanStatus === 'infected' ? (
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                      ) : (
                        <Shield className="w-5 h-5 text-yellow-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{attachment.fileName}</p>
                      <p className="text-xs text-gray-500">
                        {(attachment.fileSize / 1024 / 1024).toFixed(2)} MB • {attachment.attachmentType}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* ClamAV Scan Status */}
                    <Badge className={getStatusBadgeColor(attachment.clamavScanStatus, attachment.adminApprovalStatus)}>
                      {attachment.clamavScanStatus === 'pending' && 'Scanning...'}
                      {attachment.clamavScanStatus === 'clean' && 'Virus-Free'}
                      {attachment.clamavScanStatus === 'infected' && 'INFECTED'}
                      {attachment.clamavScanStatus === 'error' && 'Scan Error'}
                    </Badge>

                    {/* Admin Approval Status */}
                    <Badge variant="outline">
                      {attachment.adminApprovalStatus === 'pending' && 'Pending Approval'}
                      {attachment.adminApprovalStatus === 'approved' && 'Approved'}
                      {attachment.adminApprovalStatus === 'rejected' && 'Rejected'}
                    </Badge>

                    {/* Admin Controls */}
                    {userRole === 'superadmin' || userRole === 'admin' ? (
                      <div className="flex space-x-1">
                        {attachment.adminApprovalStatus === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAdminApproval(attachment.id, true)}
                              className="text-green-600 hover:bg-green-50"
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAdminApproval(attachment.id, false)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Security Warning */}
                {attachment.clamavScanStatus === 'infected' && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                    <div className="flex items-center">
                      <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                      <p className="text-sm text-red-700 font-medium">
                        Security Alert: This file contains malware and has been quarantined
                      </p>
                    </div>
                  </div>
                )}

                {/* Admin Rejection Reason */}
                {attachment.adminApprovalStatus === 'rejected' && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-yellow-700">
                      This attachment was rejected by an administrator
                    </p>
                  </div>
                )}
              </Card>
            ))}

            {attachments.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                No attachments uploaded yet. Upload your first file to get started.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Security Information */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Security & Privacy</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• All files are scanned with ClamAV antivirus before storage</li>
                <li>• Admin approval required before attachments become visible to all parties</li>
                <li>• Messages are converted to secure .md documents with timestamps</li>
                <li>• Only authorized users can access booking-specific attachments</li>
                <li>• Files are stored with encryption and access logging</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}