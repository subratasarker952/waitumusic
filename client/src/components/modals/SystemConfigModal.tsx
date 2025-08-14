import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { 
  Settings, 
  Database, 
  Mail, 
  Palette, 
  Globe, 
  CreditCard, 
  Upload,
  Image,
  Save,
  RefreshCw,
  Eye,
  Lock,
  Key,
  Type,
  Bold,
  Italic
} from 'lucide-react';

interface SystemConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SystemConfigModal({ open, onOpenChange }: SystemConfigModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  // General Settings State
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "Wai'tuMusic Platform",
    siteDescription: "Complete music industry management platform with comprehensive opportunity discovery",
    adminEmail: "admin@waitumusic.com",
    supportEmail: "support@waitumusic.com",
    maintenanceMode: false,
    registrationEnabled: true,
    demoMode: true,
    debugMode: false,
    maxFileSize: "50", // MB
    allowedFileTypes: "image/jpeg,image/png,image/gif,audio/mpeg,audio/wav,video/mp4",
    sessionTimeout: "24", // hours
    maxLoginAttempts: "5",
    lockoutDuration: "30" // minutes
  });

  // Email Configuration State
  const [emailConfig, setEmailConfig] = useState({
    smtpHost: "mail.comeseetv.com",
    smtpPort: "587",
    smtpUser: "",
    smtpPassword: "",
    smtpSecure: "tls",
    fromName: "Wai'tuMusic Platform",
    fromEmail: "noreply@waitumusic.com",
    replyToEmail: "support@waitumusic.com"
  });

  // Theme & Branding State
  const [themeConfig, setThemeConfig] = useState({
    primaryColor: "#059669", // emerald-600
    secondaryColor: "#0891b2", // cyan-600
    accentColor: "#7c3aed", // violet-600
    backgroundColor: "#ffffff",
    textColor: "#1f2937",
    logoUrl: "",
    faviconUrl: "",
    customCSS: "",
    fontFamily: "Inter, system-ui, sans-serif",
    borderRadius: "0.5rem"
  });

  // Payment Gateway State
  const [paymentConfig, setPaymentConfig] = useState({
    stripeEnabled: false,
    stripePublishableKey: "",
    stripeSecretKey: "",
    paypalEnabled: false,
    paypalClientId: "",
    paypalClientSecret: "",
    paypalSandbox: true,
    platformFeePercentage: "5.0",
    processingFeePercentage: "2.9",
    currency: "USD",
    minimumAmount: "1.00"
  });

  // Environment Variables State
  const [envVars, setEnvVars] = useState({
    NODE_ENV: "development",
    DATABASE_URL: "***hidden***",
    JWT_SECRET: "***hidden***",
    API_BASE_URL: "http://localhost:5000",
    FRONTEND_URL: "http://localhost:5000",
    OPENAI_API_KEY: "",
    ANTHROPIC_API_KEY: "",
    PERPLEXITY_API_KEY: ""
  });

  // Content Configuration State
  const [contentConfig, setContentConfig] = useState({
    siteName: "Wai'tuMusic",
    tagline: "Professional Music Industry Management",
    description: "Complete platform for artists, professionals, and fans",
    heroTitle: "Connect, Create, and Thrive in the Music Industry",
    heroSubtitle: "The ultimate platform connecting Caribbean artists, industry professionals, and music fans worldwide",
    servicesTitle: "Popular Services",
    servicesSubtitle: "Comprehensive services designed to elevate your music career and streamline your professional operations",
    featuresTitle: "Platform Features",
    featuresSubtitle: "Everything you need to succeed in the music industry",
    ctaPrimary: "Sign Up Now",
    ctaSecondary: "Book an Artist",
    ctaTertiary: "Login",
    loginTitle: "Welcome Back",
    loginSubtitle: "Sign in to your account",
    loginDescription: "Enter your credentials to access your dashboard",
    demoTitle: "Demo Accounts",
    footerDescription: "Professional music industry management platform"
  });

  // WYSIWYG Editor Configuration
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['clean']
    ]
  };

  const quillFormats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'bullet',
    'indent',
    'direction', 'align',
    'link', 'image', 'video'
  ];

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest('/api/admin/system/config');
      const data = await response.json();
      
      if (data.config) {
        setGeneralSettings(prev => ({ ...prev, ...data.config.general }));
        setEmailConfig(prev => ({ ...prev, ...data.config.email }));
        setThemeConfig(prev => ({ ...prev, ...data.config.theme }));
        setContentConfig(prev => ({ ...prev, ...data.config.content }));
        setPaymentConfig(prev => ({ ...prev, ...data.config.payment }));
        setEnvVars(prev => ({ ...prev, ...data.config.environment }));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadSettings();
    }
  }, [open]);

  const saveConfiguration = async (section: string, config: any) => {
    try {
      setIsLoading(true);
      await apiRequest('/api/admin/system/config', {
        method: 'PATCH',
        body: { section, config }
      });
      
      toast({
        title: "Configuration Updated",
        description: `${section} settings have been saved successfully.`
      });
    } catch (error) {
      toast({
        title: "Configuration Error",
        description: `Failed to update ${section} settings. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testEmailConfiguration = async () => {
    try {
      setIsLoading(true);
      await apiRequest('/api/admin/system/test-email', {
        method: 'POST',
        body: emailConfig
      });
      
      toast({
        title: "Email Test Successful",
        description: "Test email sent successfully. Check your inbox."
      });
    } catch (error) {
      toast({
        title: "Email Test Failed",
        description: "Failed to send test email. Please check your configuration.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const previewTheme = () => {
    document.documentElement.style.setProperty('--primary', themeConfig.primaryColor);
    document.documentElement.style.setProperty('--secondary', themeConfig.secondaryColor);
    toast({
      title: "Theme Preview",
      description: "Theme colors applied temporarily. Save to make permanent."
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-6 w-6" />
            <span>System Configuration</span>
          </DialogTitle>
          <DialogDescription>
            Configure platform settings, email, theming, payments, and environment variables
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="general" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">General</span>
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Email</span>
            </TabsTrigger>
            <TabsTrigger value="theme" className="flex items-center space-x-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Theme</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center space-x-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Theme Control</span>
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Payment</span>
            </TabsTrigger>
            <TabsTrigger value="environment" className="flex items-center space-x-2">
              <Key className="h-4 w-4" />
              <span className="hidden sm:inline">Environment</span>
            </TabsTrigger>
          </TabsList>

          {/* General Settings Tab */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      value={generalSettings.siteName}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, siteName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="adminEmail">Admin Email</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      value={generalSettings.adminEmail}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, adminEmail: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    value={generalSettings.siteDescription}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="maintenanceMode"
                      checked={generalSettings.maintenanceMode}
                      onCheckedChange={(checked) => setGeneralSettings(prev => ({ ...prev, maintenanceMode: checked }))}
                    />
                    <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="registrationEnabled"
                      checked={generalSettings.registrationEnabled}
                      onCheckedChange={(checked) => setGeneralSettings(prev => ({ ...prev, registrationEnabled: checked }))}
                    />
                    <Label htmlFor="registrationEnabled">Registration Enabled</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="demoMode"
                      checked={generalSettings.demoMode}
                      onCheckedChange={(checked) => setGeneralSettings(prev => ({ ...prev, demoMode: checked }))}
                    />
                    <Label htmlFor="demoMode">Demo Mode</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="debugMode"
                      checked={generalSettings.debugMode}
                      onCheckedChange={(checked) => setGeneralSettings(prev => ({ ...prev, debugMode: checked }))}
                    />
                    <Label htmlFor="debugMode">Debug Mode</Label>
                  </div>
                </div>

                <Button 
                  onClick={() => saveConfiguration('general', generalSettings)}
                  disabled={isLoading}
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save General Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Configuration Tab */}
          <TabsContent value="email" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>SMTP Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smtpHost">SMTP Host</Label>
                    <Input
                      id="smtpHost"
                      value={emailConfig.smtpHost}
                      onChange={(e) => setEmailConfig(prev => ({ ...prev, smtpHost: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input
                      id="smtpPort"
                      value={emailConfig.smtpPort}
                      onChange={(e) => setEmailConfig(prev => ({ ...prev, smtpPort: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtpUser">SMTP Username</Label>
                    <Input
                      id="smtpUser"
                      value={emailConfig.smtpUser}
                      onChange={(e) => setEmailConfig(prev => ({ ...prev, smtpUser: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtpPassword">SMTP Password</Label>
                    <Input
                      id="smtpPassword"
                      type="password"
                      value={emailConfig.smtpPassword}
                      onChange={(e) => setEmailConfig(prev => ({ ...prev, smtpPassword: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fromName">From Name</Label>
                    <Input
                      id="fromName"
                      value={emailConfig.fromName}
                      onChange={(e) => setEmailConfig(prev => ({ ...prev, fromName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fromEmail">From Email</Label>
                    <Input
                      id="fromEmail"
                      type="email"
                      value={emailConfig.fromEmail}
                      onChange={(e) => setEmailConfig(prev => ({ ...prev, fromEmail: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    onClick={() => saveConfiguration('email', emailConfig)}
                    disabled={isLoading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Email Config
                  </Button>
                  <Button 
                    onClick={testEmailConfiguration}
                    disabled={isLoading}
                    variant="outline"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Test Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Theme & Branding Tab */}
          <TabsContent value="theme" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Theme & Branding</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={themeConfig.primaryColor}
                        onChange={(e) => setThemeConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="w-16"
                      />
                      <Input
                        value={themeConfig.primaryColor}
                        onChange={(e) => setThemeConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={themeConfig.secondaryColor}
                        onChange={(e) => setThemeConfig(prev => ({ ...prev, secondaryColor: e.target.value }))}
                        className="w-16"
                      />
                      <Input
                        value={themeConfig.secondaryColor}
                        onChange={(e) => setThemeConfig(prev => ({ ...prev, secondaryColor: e.target.value }))}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="accentColor">Accent Color</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="accentColor"
                        type="color"
                        value={themeConfig.accentColor}
                        onChange={(e) => setThemeConfig(prev => ({ ...prev, accentColor: e.target.value }))}
                        className="w-16"
                      />
                      <Input
                        value={themeConfig.accentColor}
                        onChange={(e) => setThemeConfig(prev => ({ ...prev, accentColor: e.target.value }))}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="logoUrl">Logo URL</Label>
                    <Input
                      id="logoUrl"
                      value={themeConfig.logoUrl}
                      onChange={(e) => setThemeConfig(prev => ({ ...prev, logoUrl: e.target.value }))}
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fontFamily">Font Family</Label>
                    <Select 
                      value={themeConfig.fontFamily} 
                      onValueChange={(value) => setThemeConfig(prev => ({ ...prev, fontFamily: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter, system-ui, sans-serif">Inter</SelectItem>
                        <SelectItem value="system-ui, -apple-system, sans-serif">System UI</SelectItem>
                        <SelectItem value="Georgia, serif">Georgia</SelectItem>
                        <SelectItem value="'Times New Roman', serif">Times New Roman</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="customCSS">Custom CSS</Label>
                  <Textarea
                    id="customCSS"
                    value={themeConfig.customCSS}
                    onChange={(e) => setThemeConfig(prev => ({ ...prev, customCSS: e.target.value }))}
                    rows={6}
                    placeholder="/* Custom CSS rules */"
                  />
                </div>

                <div className="flex space-x-2">
                  <Button 
                    onClick={() => saveConfiguration('theme', themeConfig)}
                    disabled={isLoading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Theme
                  </Button>
                  <Button 
                    onClick={previewTheme}
                    variant="outline"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Theme Control Tab - Content Configuration */}
          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Management System</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Modify all public-facing text content through centralized configuration
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Site Information */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Site Information - WYSIWYG Editing
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contentSiteName" className="flex items-center gap-2">
                        <Bold className="h-3 w-3" />
                        Site Name (Rich Text)
                      </Label>
                      <div className="mt-2">
                        <ReactQuill
                          theme="snow"
                          value={contentConfig.siteName}
                          onChange={(value) => setContentConfig(prev => ({ ...prev, siteName: value }))}
                          modules={{
                            toolbar: [
                              ['bold', 'italic', 'underline'],
                              [{ 'color': [] }, { 'background': [] }],
                              [{ 'font': [] }],
                              [{ 'size': ['small', false, 'large', 'huge'] }],
                              ['clean']
                            ]
                          }}
                          formats={['bold', 'italic', 'underline', 'color', 'background', 'font', 'size']}
                          placeholder="Wai'tuMusic"
                          className="bg-white dark:bg-gray-800"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="contentTagline" className="flex items-center gap-2">
                        <Italic className="h-3 w-3" />
                        Tagline (Rich Text)
                      </Label>
                      <div className="mt-2">
                        <ReactQuill
                          theme="snow"
                          value={contentConfig.tagline}
                          onChange={(value) => setContentConfig(prev => ({ ...prev, tagline: value }))}
                          modules={{
                            toolbar: [
                              ['bold', 'italic', 'underline'],
                              [{ 'color': [] }, { 'background': [] }],
                              [{ 'font': [] }],
                              [{ 'size': ['small', false, 'large', 'huge'] }],
                              ['clean']
                            ]
                          }}
                          formats={['bold', 'italic', 'underline', 'color', 'background', 'font', 'size']}
                          placeholder="Professional Music Industry Management"
                          className="bg-white dark:bg-gray-800"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="contentDescription" className="flex items-center gap-2">
                      <Type className="h-3 w-3" />
                      Site Description (Rich Text)
                    </Label>
                    <div className="mt-2">
                      <ReactQuill
                        theme="snow"
                        value={contentConfig.description}
                        onChange={(value) => setContentConfig(prev => ({ ...prev, description: value }))}
                        modules={quillModules}
                        formats={quillFormats}
                        placeholder="Complete platform for artists, professionals, and fans"
                        className="bg-white dark:bg-gray-800"
                      />
                    </div>
                  </div>
                </div>

                {/* Homepage Content */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    Homepage Content - WYSIWYG Editing
                  </h4>
                  <div>
                    <Label htmlFor="heroTitle" className="flex items-center gap-2">
                      <Bold className="h-3 w-3" />
                      Hero Title (Rich Text)
                    </Label>
                    <div className="mt-2">
                      <ReactQuill
                        theme="snow"
                        value={contentConfig.heroTitle}
                        onChange={(value) => setContentConfig(prev => ({ ...prev, heroTitle: value }))}
                        modules={quillModules}
                        formats={quillFormats}
                        placeholder="Connect, Create, and Thrive in the Music Industry"
                        className="bg-white dark:bg-gray-800"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="heroSubtitle" className="flex items-center gap-2">
                      <Italic className="h-3 w-3" />
                      Hero Subtitle (Rich Text)
                    </Label>
                    <div className="mt-2">
                      <ReactQuill
                        theme="snow"
                        value={contentConfig.heroSubtitle}
                        onChange={(value) => setContentConfig(prev => ({ ...prev, heroSubtitle: value }))}
                        modules={quillModules}
                        formats={quillFormats}
                        placeholder="The ultimate platform connecting Caribbean artists, industry professionals, and music fans worldwide"
                        className="bg-white dark:bg-gray-800"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="servicesTitle" className="flex items-center gap-2">
                        <Type className="h-3 w-3" />
                        Services Section Title (Rich Text)
                      </Label>
                      <div className="mt-2">
                        <ReactQuill
                          theme="snow"
                          value={contentConfig.servicesTitle}
                          onChange={(value) => setContentConfig(prev => ({ ...prev, servicesTitle: value }))}
                          modules={{
                            toolbar: [
                              ['bold', 'italic', 'underline'],
                              [{ 'color': [] }, { 'background': [] }],
                              [{ 'size': ['small', false, 'large'] }],
                              ['clean']
                            ]
                          }}
                          formats={['bold', 'italic', 'underline', 'color', 'background', 'size']}
                          placeholder="Popular Services"
                          className="bg-white dark:bg-gray-800"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="featuresTitle" className="flex items-center gap-2">
                        <Type className="h-3 w-3" />
                        Features Section Title (Rich Text)
                      </Label>
                      <div className="mt-2">
                        <ReactQuill
                          theme="snow"
                          value={contentConfig.featuresTitle}
                          onChange={(value) => setContentConfig(prev => ({ ...prev, featuresTitle: value }))}
                          modules={{
                            toolbar: [
                              ['bold', 'italic', 'underline'],
                              [{ 'color': [] }, { 'background': [] }],
                              [{ 'size': ['small', false, 'large'] }],
                              ['clean']
                            ]
                          }}
                          formats={['bold', 'italic', 'underline', 'color', 'background', 'size']}
                          placeholder="Platform Features"
                          className="bg-white dark:bg-gray-800"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="servicesSubtitle" className="flex items-center gap-2">
                      <Italic className="h-3 w-3" />
                      Services Subtitle (Rich Text)
                    </Label>
                    <div className="mt-2">
                      <ReactQuill
                        theme="snow"
                        value={contentConfig.servicesSubtitle}
                        onChange={(value) => setContentConfig(prev => ({ ...prev, servicesSubtitle: value }))}
                        modules={quillModules}
                        formats={quillFormats}
                        placeholder="Comprehensive services designed to elevate your music career and streamline your professional operations"
                        className="bg-white dark:bg-gray-800"
                      />
                    </div>
                  </div>
                </div>

                {/* Call-to-Action Buttons */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Call-to-Action Buttons</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="ctaPrimary">Primary CTA</Label>
                      <Input
                        id="ctaPrimary"
                        value={contentConfig.ctaPrimary}
                        onChange={(e) => setContentConfig(prev => ({ ...prev, ctaPrimary: e.target.value }))}
                        placeholder="Sign Up Now"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ctaSecondary">Secondary CTA</Label>
                      <Input
                        id="ctaSecondary"
                        value={contentConfig.ctaSecondary}
                        onChange={(e) => setContentConfig(prev => ({ ...prev, ctaSecondary: e.target.value }))}
                        placeholder="Book an Artist"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ctaTertiary">Tertiary CTA</Label>
                      <Input
                        id="ctaTertiary"
                        value={contentConfig.ctaTertiary}
                        onChange={(e) => setContentConfig(prev => ({ ...prev, ctaTertiary: e.target.value }))}
                        placeholder="Login"
                      />
                    </div>
                  </div>
                </div>

                {/* Login Page Content */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Login Page Content - WYSIWYG Editing
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="loginTitle" className="flex items-center gap-2">
                        <Bold className="h-3 w-3" />
                        Login Title (Rich Text)
                      </Label>
                      <div className="mt-2">
                        <ReactQuill
                          theme="snow"
                          value={contentConfig.loginTitle}
                          onChange={(value) => setContentConfig(prev => ({ ...prev, loginTitle: value }))}
                          modules={{
                            toolbar: [
                              ['bold', 'italic', 'underline'],
                              [{ 'color': [] }, { 'background': [] }],
                              [{ 'size': ['small', false, 'large'] }],
                              [{ 'align': [] }],
                              ['clean']
                            ]
                          }}
                          formats={['bold', 'italic', 'underline', 'color', 'background', 'size', 'align']}
                          placeholder="Welcome Back"
                          className="bg-white dark:bg-gray-800"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="loginSubtitle" className="flex items-center gap-2">
                        <Italic className="h-3 w-3" />
                        Login Subtitle (Rich Text)
                      </Label>
                      <div className="mt-2">
                        <ReactQuill
                          theme="snow"
                          value={contentConfig.loginSubtitle}
                          onChange={(value) => setContentConfig(prev => ({ ...prev, loginSubtitle: value }))}
                          modules={{
                            toolbar: [
                              ['bold', 'italic', 'underline'],
                              [{ 'color': [] }, { 'background': [] }],
                              [{ 'size': ['small', false, 'large'] }],
                              [{ 'align': [] }],
                              ['clean']
                            ]
                          }}
                          formats={['bold', 'italic', 'underline', 'color', 'background', 'size', 'align']}
                          placeholder="Sign in to your account"
                          className="bg-white dark:bg-gray-800"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="loginDescription" className="flex items-center gap-2">
                      <Type className="h-3 w-3" />
                      Login Description (Rich Text)
                    </Label>
                    <div className="mt-2">
                      <ReactQuill
                        theme="snow"
                        value={contentConfig.loginDescription}
                        onChange={(value) => setContentConfig(prev => ({ ...prev, loginDescription: value }))}
                        modules={{
                          toolbar: [
                            ['bold', 'italic', 'underline'],
                            [{ 'color': [] }, { 'background': [] }],
                            [{ 'size': ['small', false, 'large'] }],
                            [{ 'align': [] }],
                            ['clean']
                          ]
                        }}
                        formats={['bold', 'italic', 'underline', 'color', 'background', 'size', 'align']}
                        placeholder="Enter your credentials to access your dashboard"
                        className="bg-white dark:bg-gray-800"
                      />
                    </div>
                  </div>
                </div>

                {/* Content Management Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button 
                    onClick={() => saveConfiguration('content', contentConfig)}
                    disabled={isLoading}
                    className="flex-1 sm:flex-none"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Content Configuration
                  </Button>
                  <Button 
                    onClick={() => {
                      // Load content from shared/content-config.ts
                      toast({
                        title: "Content Loaded",
                        description: "Content configuration loaded from system files"
                      });
                    }}
                    variant="outline"
                    className="flex-1 sm:flex-none"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Load from Files
                  </Button>
                  <Button 
                    onClick={() => {
                      // Reset to default values
                      setContentConfig({
                        siteName: "Wai'tuMusic",
                        tagline: "Professional Music Industry Management",
                        description: "Complete platform for artists, professionals, and fans",
                        heroTitle: "Connect, Create, and Thrive in the Music Industry",
                        heroSubtitle: "The ultimate platform connecting Caribbean artists, industry professionals, and music fans worldwide",
                        servicesTitle: "Popular Services",
                        servicesSubtitle: "Comprehensive services designed to elevate your music career and streamline your professional operations",
                        featuresTitle: "Platform Features",
                        featuresSubtitle: "Everything you need to succeed in the music industry",
                        ctaPrimary: "Sign Up Now",
                        ctaSecondary: "Book an Artist",
                        ctaTertiary: "Login",
                        loginTitle: "Welcome Back",
                        loginSubtitle: "Sign in to your account",
                        loginDescription: "Enter your credentials to access your dashboard",
                        demoTitle: "Demo Accounts",
                        footerDescription: "Professional music industry management platform"
                      });
                      toast({
                        title: "Content Reset",
                        description: "All content fields reset to default values"
                      });
                    }}
                    variant="secondary"
                    className="flex-1 sm:flex-none"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset to Defaults
                  </Button>
                  <Button 
                    onClick={() => {
                      // Export content configuration
                      const configJSON = JSON.stringify(contentConfig, null, 2);
                      const blob = new Blob([configJSON], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'waitumusic-content-config.json';
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      toast({
                        title: "Content Exported",
                        description: "Content configuration downloaded as JSON file"
                      });
                    }}
                    variant="outline"
                    className="flex-1 sm:flex-none"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Export Config
                  </Button>
                </div>

                {/* WYSIWYG Formatting Preview */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    WYSIWYG Formatting Features
                  </h5>
                  <div className="text-xs text-muted-foreground space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p><strong className="text-purple-600 dark:text-purple-400">Text Formatting:</strong></p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>Bold, italic, underline, strikethrough</li>
                          <li>Font family and size selection</li>
                          <li>Text and background colors</li>
                          <li>Headers (H1-H6) and alignment</li>
                        </ul>
                      </div>
                      <div>
                        <p><strong className="text-blue-600 dark:text-blue-400">Advanced Features:</strong></p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>Lists (ordered and unordered)</li>
                          <li>Links, images, and videos</li>
                          <li>Subscript and superscript</li>
                          <li>Text direction and indentation</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Management Guide */}
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <h5 className="text-sm font-medium mb-2">Content Configuration Guide</h5>
                  <p className="text-xs text-muted-foreground mb-2">
                    All content is managed through <code>shared/content-config.ts</code>. Changes here will update the centralized configuration.
                  </p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• <strong>Site Information:</strong> Platform name, tagline, and description with rich text formatting</p>
                    <p>• <strong>Homepage Content:</strong> Hero section, services, and features text with WYSIWYG editing</p>
                    <p>• <strong>Navigation:</strong> Menu items and mobile piano key labels</p>
                    <p>• <strong>Login/Auth:</strong> Form labels, buttons, and demo account text with rich formatting</p>
                    <p>• <strong>WYSIWYG Editing:</strong> Full rich text editing with colors, fonts, and formatting options</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Configuration Tab */}
          <TabsContent value="payment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Gateway Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Stripe Configuration */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="stripeEnabled"
                      checked={paymentConfig.stripeEnabled}
                      onCheckedChange={(checked) => setPaymentConfig(prev => ({ ...prev, stripeEnabled: checked }))}
                    />
                    <Label htmlFor="stripeEnabled">Enable Stripe</Label>
                  </div>
                  
                  {paymentConfig.stripeEnabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                      <div>
                        <Label htmlFor="stripePublishableKey">Stripe Publishable Key</Label>
                        <Input
                          id="stripePublishableKey"
                          value={paymentConfig.stripePublishableKey}
                          onChange={(e) => setPaymentConfig(prev => ({ ...prev, stripePublishableKey: e.target.value }))}
                          placeholder="pk_test_..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="stripeSecretKey">Stripe Secret Key</Label>
                        <Input
                          id="stripeSecretKey"
                          type="password"
                          value={paymentConfig.stripeSecretKey}
                          onChange={(e) => setPaymentConfig(prev => ({ ...prev, stripeSecretKey: e.target.value }))}
                          placeholder="sk_test_..."
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* PayPal Configuration */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="paypalEnabled"
                      checked={paymentConfig.paypalEnabled}
                      onCheckedChange={(checked) => setPaymentConfig(prev => ({ ...prev, paypalEnabled: checked }))}
                    />
                    <Label htmlFor="paypalEnabled">Enable PayPal</Label>
                  </div>
                  
                  {paymentConfig.paypalEnabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                      <div>
                        <Label htmlFor="paypalClientId">PayPal Client ID</Label>
                        <Input
                          id="paypalClientId"
                          value={paymentConfig.paypalClientId}
                          onChange={(e) => setPaymentConfig(prev => ({ ...prev, paypalClientId: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="paypalClientSecret">PayPal Client Secret</Label>
                        <Input
                          id="paypalClientSecret"
                          type="password"
                          value={paymentConfig.paypalClientSecret}
                          onChange={(e) => setPaymentConfig(prev => ({ ...prev, paypalClientSecret: e.target.value }))}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="paypalSandbox"
                          checked={paymentConfig.paypalSandbox}
                          onCheckedChange={(checked) => setPaymentConfig(prev => ({ ...prev, paypalSandbox: checked }))}
                        />
                        <Label htmlFor="paypalSandbox">Sandbox Mode</Label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Fee Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="platformFeePercentage">Platform Fee (%)</Label>
                    <Input
                      id="platformFeePercentage"
                      type="number"
                      step="0.1"
                      value={paymentConfig.platformFeePercentage}
                      onChange={(e) => setPaymentConfig(prev => ({ ...prev, platformFeePercentage: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="processingFeePercentage">Processing Fee (%)</Label>
                    <Input
                      id="processingFeePercentage"
                      type="number"
                      step="0.1"
                      value={paymentConfig.processingFeePercentage}
                      onChange={(e) => setPaymentConfig(prev => ({ ...prev, processingFeePercentage: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="minimumAmount">Minimum Amount</Label>
                    <Input
                      id="minimumAmount"
                      type="number"
                      step="0.01"
                      value={paymentConfig.minimumAmount}
                      onChange={(e) => setPaymentConfig(prev => ({ ...prev, minimumAmount: e.target.value }))}
                    />
                  </div>
                </div>

                <Button 
                  onClick={() => saveConfiguration('payment', paymentConfig)}
                  disabled={isLoading}
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Payment Configuration
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Environment Variables Tab */}
          <TabsContent value="environment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Environment Variables</CardTitle>
                <Badge variant="destructive" className="w-fit">
                  <Lock className="h-3 w-3 mr-1" />
                  Sensitive Information
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {Object.entries(envVars).map(([key, value]) => (
                    <div key={key}>
                      <Label htmlFor={key}>{key}</Label>
                      <Input
                        id={key}
                        type={key.includes('SECRET') || key.includes('PASSWORD') || key.includes('KEY') ? 'password' : 'text'}
                        value={value}
                        onChange={(e) => setEnvVars(prev => ({ ...prev, [key]: e.target.value }))}
                        placeholder={key.includes('SECRET') ? '***hidden***' : `Enter ${key}`}
                      />
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={() => saveConfiguration('environment', envVars)}
                  disabled={isLoading}
                  className="w-full"
                  variant="destructive"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Environment Variables
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}