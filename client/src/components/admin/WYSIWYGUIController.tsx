import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  Palette, Type, Image, Layout, Brush, Eye, 
  Upload, Save, RotateCcw, Download, Settings,
  Monitor, Smartphone, Tablet, MousePointer,
  Layers, Grid, Box, Circle, Square
} from 'lucide-react';
import { useEnhancedToast } from '@/lib/toast-utils';
import { apiRequest } from '@/lib/queryClient';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface UITheme {
  // Typography
  fonts: {
    primary: string;
    secondary: string;
    mono: string;
    sizes: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
    };
    weights: {
      light: number;
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
  };
  
  // Colors
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
      muted: string;
    };
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  
  // Spacing & Layout
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  
  // Border Radius
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  
  // Shadows
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  
  // Components
  components: {
    button: {
      primary: {
        background: string;
        text: string;
        border: string;
        hover: {
          background: string;
          text: string;
        };
      };
      secondary: {
        background: string;
        text: string;
        border: string;
        hover: {
          background: string;
          text: string;
        };
      };
    };
    card: {
      background: string;
      border: string;
      shadow: string;
    };
    navigation: {
      background: string;
      text: string;
      active: string;
    };
  };
  
  // Branding
  branding: {
    logo: {
      primary: string;
      secondary: string;
      favicon: string;
    };
    name: string;
    tagline: string;
  };
}

const defaultTheme: UITheme = {
  fonts: {
    primary: 'Inter, system-ui, sans-serif',
    secondary: 'Inter, system-ui, sans-serif', 
    mono: 'JetBrains Mono, monospace',
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    weights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  colors: {
    primary: '#3b82f6',
    secondary: '#6366f1',
    accent: '#f59e0b',
    background: '#ffffff',
    surface: '#f8fafc',
    text: {
      primary: '#1f2937',
      secondary: '#6b7280',
      muted: '#9ca3af',
    },
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
    '2xl': '4rem',
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  },
  components: {
    button: {
      primary: {
        background: '#3b82f6',
        text: '#ffffff',
        border: '#3b82f6',
        hover: {
          background: '#2563eb',
          text: '#ffffff',
        },
      },
      secondary: {
        background: 'transparent',
        text: '#3b82f6',
        border: '#3b82f6',
        hover: {
          background: '#3b82f6',
          text: '#ffffff',
        },
      },
    },
    card: {
      background: '#ffffff',
      border: '#e5e7eb',
      shadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    },
    navigation: {
      background: '#ffffff',
      text: '#1f2937',
      active: '#3b82f6',
    },
  },
  branding: {
    logo: {
      primary: '/logo-primary.svg',
      secondary: '/logo-secondary.svg',
      favicon: '/favicon.ico',
    },
    name: "Wai'tuMusic",
    tagline: 'Your Music, Your Journey',
  },
};

interface WYSIWYGUIControllerProps {
  onThemeChange?: (theme: UITheme) => void;
}

export default function WYSIWYGUIController({ onThemeChange }: WYSIWYGUIControllerProps) {
  const { toast } = useEnhancedToast();
  const queryClient = useQueryClient();
  const [theme, setTheme] = useState<UITheme>(defaultTheme);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isDirty, setIsDirty] = useState(false);

  // Load current theme
  const { data: currentTheme, isLoading } = useQuery({
    queryKey: ['/api/admin/ui-theme'],
  });

  // Update theme when data loads
  useEffect(() => {
    if (currentTheme) {
      setTheme(currentTheme);
    }
  }, [currentTheme]);

  // Save theme mutation
  const saveTheme = useMutation({
    mutationFn: (newTheme: UITheme) => apiRequest('PUT', '/api/admin/ui-theme', newTheme),
    onSuccess: () => {
      toast({
        title: 'Theme Saved',
        description: 'UI theme has been successfully updated',
      });
      setIsDirty(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ui-theme'] });
      onThemeChange?.(theme);
    },
    onError: (error: any) => {
      toast({
        title: 'Save Failed',
        description: error.message || 'Failed to save theme',
      });
    },
  });

  // Update theme value
  const updateTheme = (path: string, value: any) => {
    const keys = path.split('.');
    const newTheme = { ...theme };
    let current: any = newTheme;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    
    setTheme(newTheme);
    setIsDirty(true);
  };

  // Generate CSS variables from theme
  const generateCSSVariables = (theme: UITheme) => {
    return `
      :root {
        --font-primary: ${theme.fonts.primary};
        --font-secondary: ${theme.fonts.secondary};
        --font-mono: ${theme.fonts.mono};
        
        --color-primary: ${theme.colors.primary};
        --color-secondary: ${theme.colors.secondary};
        --color-accent: ${theme.colors.accent};
        --color-background: ${theme.colors.background};
        --color-surface: ${theme.colors.surface};
        --color-text-primary: ${theme.colors.text.primary};
        --color-text-secondary: ${theme.colors.text.secondary};
        --color-text-muted: ${theme.colors.text.muted};
        
        --spacing-xs: ${theme.spacing.xs};
        --spacing-sm: ${theme.spacing.sm};
        --spacing-md: ${theme.spacing.md};
        --spacing-lg: ${theme.spacing.lg};
        --spacing-xl: ${theme.spacing.xl};
        --spacing-2xl: ${theme.spacing['2xl']};
        
        --radius-sm: ${theme.borderRadius.sm};
        --radius-md: ${theme.borderRadius.md};
        --radius-lg: ${theme.borderRadius.lg};
        --radius-xl: ${theme.borderRadius.xl};
        
        --shadow-sm: ${theme.shadows.sm};
        --shadow-md: ${theme.shadows.md};
        --shadow-lg: ${theme.shadows.lg};
        --shadow-xl: ${theme.shadows.xl};
      }
    `;
  };

  // Apply theme to document
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = generateCSSVariables(theme);
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, [theme]);

  const fontOptions = [
    'Inter, system-ui, sans-serif',
    'Roboto, sans-serif',
    'Open Sans, sans-serif',
    'Lato, sans-serif',
    'Montserrat, sans-serif',
    'Poppins, sans-serif',
    'Nunito, sans-serif',
    'Source Sans Pro, sans-serif',
    'Raleway, sans-serif',
    'Merriweather, serif',
    'Playfair Display, serif',
    'Lora, serif',
    'JetBrains Mono, monospace',
    'Fira Code, monospace',
    'Source Code Pro, monospace',
  ];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading UI theme...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brush className="h-6 w-6" />
            WYSIWYG UI Controller
          </h2>
          <p className="text-muted-foreground mt-1">
            Visual editor for complete frontend customization - fonts, colors, layouts, and branding
          </p>
        </div>
        <div className="flex gap-2">
          {/* Preview Mode Selector */}
          <div className="flex bg-muted rounded-lg p-1">
            <Button 
              variant={previewMode === 'desktop' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPreviewMode('desktop')}
              className="px-3"
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button 
              variant={previewMode === 'tablet' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPreviewMode('tablet')}
              className="px-3"
            >
              <Tablet className="h-4 w-4" />
            </Button>
            <Button 
              variant={previewMode === 'mobile' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPreviewMode('mobile')}
              className="px-3"
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>

          <Button 
            variant="outline" 
            onClick={() => {
              setTheme(defaultTheme);
              setIsDirty(true);
            }}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          
          <Button 
            onClick={() => saveTheme.mutate(theme)}
            disabled={!isDirty || saveTheme.isPending}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saveTheme.isPending ? 'Saving...' : 'Save Theme'}
          </Button>
        </div>
      </div>

      {isDirty && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-800">
            <Settings className="h-4 w-4" />
            <span className="font-medium">Unsaved Changes</span>
          </div>
          <p className="text-yellow-700 mt-1">You have unsaved theme changes. Click "Save Theme" to apply them.</p>
        </div>
      )}

      <Tabs defaultValue="typography" className="space-y-6">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="typography" className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            Typography
          </TabsTrigger>
          <TabsTrigger value="colors" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="layout" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Layout
          </TabsTrigger>
          <TabsTrigger value="components" className="flex items-center gap-2">
            <Box className="h-4 w-4" />
            Components
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        {/* Typography Tab */}
        <TabsContent value="typography">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Font Families</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Primary Font</Label>
                  <Select
                    value={theme.fonts.primary}
                    onValueChange={(value) => updateTheme('fonts.primary', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontOptions.map((font) => (
                        <SelectItem key={font} value={font}>
                          <span style={{ fontFamily: font }}>{font.split(',')[0]}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Secondary Font</Label>
                  <Select
                    value={theme.fonts.secondary}
                    onValueChange={(value) => updateTheme('fonts.secondary', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontOptions.map((font) => (
                        <SelectItem key={font} value={font}>
                          <span style={{ fontFamily: font }}>{font.split(',')[0]}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Monospace Font</Label>
                  <Select
                    value={theme.fonts.mono}
                    onValueChange={(value) => updateTheme('fonts.mono', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontOptions.filter(f => f.includes('mono')).map((font) => (
                        <SelectItem key={font} value={font}>
                          <span style={{ fontFamily: font }}>{font.split(',')[0]}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Font Sizes & Weights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(theme.fonts.sizes).map(([size, value]) => (
                  <div key={size} className="flex items-center gap-3">
                    <Label className="w-16 text-sm">{size}</Label>
                    <Input
                      value={value}
                      onChange={(e) => updateTheme(`fonts.sizes.${size}`, e.target.value)}
                      className="flex-1"
                    />
                    <div 
                      className="px-3 py-1 border rounded"
                      style={{ fontSize: value, fontFamily: theme.fonts.primary }}
                    >
                      Aa
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Colors Tab */}
        <TabsContent value="colors">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Brand Colors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {['primary', 'secondary', 'accent'].map((color) => (
                  <div key={color} className="flex items-center gap-3">
                    <Label className="w-20 capitalize">{color}</Label>
                    <Input
                      type="color"
                      value={theme.colors[color as keyof typeof theme.colors] as string}
                      onChange={(e) => updateTheme(`colors.${color}`, e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      value={theme.colors[color as keyof typeof theme.colors] as string}
                      onChange={(e) => updateTheme(`colors.${color}`, e.target.value)}
                      className="flex-1 font-mono text-sm"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Background Colors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {['background', 'surface'].map((color) => (
                  <div key={color} className="flex items-center gap-3">
                    <Label className="w-20 capitalize">{color}</Label>
                    <Input
                      type="color"
                      value={theme.colors[color as keyof typeof theme.colors] as string}
                      onChange={(e) => updateTheme(`colors.${color}`, e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      value={theme.colors[color as keyof typeof theme.colors] as string}
                      onChange={(e) => updateTheme(`colors.${color}`, e.target.value)}
                      className="flex-1 font-mono text-sm"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Text Colors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(theme.colors.text).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-3">
                    <Label className="w-20 capitalize">{key}</Label>
                    <Input
                      type="color"
                      value={value}
                      onChange={(e) => updateTheme(`colors.text.${key}`, e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      value={value}
                      onChange={(e) => updateTheme(`colors.text.${key}`, e.target.value)}
                      className="flex-1 font-mono text-sm"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Layout Tab */}
        <TabsContent value="layout">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Spacing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(theme.spacing).map(([size, value]) => (
                  <div key={size} className="flex items-center gap-3">
                    <Label className="w-16">{size}</Label>
                    <Input
                      value={value}
                      onChange={(e) => updateTheme(`spacing.${size}`, e.target.value)}
                      className="flex-1"
                    />
                    <div 
                      className="bg-blue-200 border"
                      style={{ width: value, height: '1rem' }}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Border Radius</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(theme.borderRadius).map(([size, value]) => (
                  <div key={size} className="flex items-center gap-3">
                    <Label className="w-16">{size}</Label>
                    <Input
                      value={value}
                      onChange={(e) => updateTheme(`borderRadius.${size}`, e.target.value)}
                      className="flex-1"
                    />
                    <div 
                      className="w-8 h-8 bg-blue-200 border"
                      style={{ borderRadius: value }}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Components Tab */}
        <TabsContent value="components">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Button Styles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {['primary', 'secondary'].map((type) => (
                  <div key={type} className="space-y-4">
                    <h4 className="font-semibold capitalize">{type} Button</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Background</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={theme.components.button[type as keyof typeof theme.components.button].background}
                            onChange={(e) => updateTheme(`components.button.${type}.background`, e.target.value)}
                            className="w-16 h-10"
                          />
                          <Input
                            value={theme.components.button[type as keyof typeof theme.components.button].background}
                            onChange={(e) => updateTheme(`components.button.${type}.background`, e.target.value)}
                            className="flex-1 font-mono text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Text Color</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={theme.components.button[type as keyof typeof theme.components.button].text}
                            onChange={(e) => updateTheme(`components.button.${type}.text`, e.target.value)}
                            className="w-16 h-10"
                          />
                          <Input
                            value={theme.components.button[type as keyof typeof theme.components.button].text}
                            onChange={(e) => updateTheme(`components.button.${type}.text`, e.target.value)}
                            className="flex-1 font-mono text-sm"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="pt-2">
                      <Button
                        variant={type === 'primary' ? 'default' : 'outline'}
                        style={{
                          backgroundColor: theme.components.button[type as keyof typeof theme.components.button].background,
                          color: theme.components.button[type as keyof typeof theme.components.button].text,
                          borderColor: theme.components.button[type as keyof typeof theme.components.button].border,
                        }}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)} Button Preview
                      </Button>
                    </div>
                    <Separator />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Branding Tab */}
        <TabsContent value="branding">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Brand Identity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Brand Name</Label>
                  <Input
                    value={theme.branding.name}
                    onChange={(e) => updateTheme('branding.name', e.target.value)}
                    placeholder="Enter brand name"
                  />
                </div>
                
                <div>
                  <Label>Tagline</Label>
                  <Input
                    value={theme.branding.tagline}
                    onChange={(e) => updateTheme('branding.tagline', e.target.value)}
                    placeholder="Enter brand tagline"
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-semibold">Logo Assets</h4>
                  
                  <div>
                    <Label>Primary Logo URL</Label>
                    <div className="flex gap-2">
                      <Input
                        value={theme.branding.logo.primary}
                        onChange={(e) => updateTheme('branding.logo.primary', e.target.value)}
                        placeholder="/logo-primary.svg"
                        className="flex-1"
                      />
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label>Secondary Logo URL</Label>
                    <div className="flex gap-2">
                      <Input
                        value={theme.branding.logo.secondary}
                        onChange={(e) => updateTheme('branding.logo.secondary', e.target.value)}
                        placeholder="/logo-secondary.svg"
                        className="flex-1"
                      />
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label>Favicon URL</Label>
                    <div className="flex gap-2">
                      <Input
                        value={theme.branding.logo.favicon}
                        onChange={(e) => updateTheme('branding.logo.favicon', e.target.value)}
                        placeholder="/favicon.ico"
                        className="flex-1"
                      />
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Brand Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="p-6 rounded-lg border"
                  style={{ 
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.text.primary,
                    fontFamily: theme.fonts.primary
                  }}
                >
                  <div className="text-center space-y-2">
                    <h1 
                      className="text-3xl font-bold"
                      style={{ color: theme.colors.primary }}
                    >
                      {theme.branding.name}
                    </h1>
                    <p 
                      className="text-lg"
                      style={{ color: theme.colors.text.secondary }}
                    >
                      {theme.branding.tagline}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
              <p className="text-sm text-muted-foreground">
                Preview how your theme changes will look across different components
              </p>
            </CardHeader>
            <CardContent>
              <div 
                className={`rounded-lg border p-6 ${
                  previewMode === 'mobile' ? 'max-w-sm mx-auto' :
                  previewMode === 'tablet' ? 'max-w-2xl mx-auto' : 'w-full'
                }`}
                style={{
                  backgroundColor: theme.colors.background,
                  fontFamily: theme.fonts.primary,
                  color: theme.colors.text.primary,
                }}
              >
                {/* Sample UI Components */}
                <div className="space-y-6">
                  {/* Header */}
                  <div 
                    className="p-4 rounded-lg"
                    style={{ backgroundColor: theme.colors.surface }}
                  >
                    <h1 
                      className="text-2xl font-bold"
                      style={{ color: theme.colors.primary }}
                    >
                      {theme.branding.name}
                    </h1>
                    <p style={{ color: theme.colors.text.secondary }}>
                      {theme.branding.tagline}
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 flex-wrap">
                    <button
                      className="px-4 py-2 rounded-md font-medium transition-colors"
                      style={{
                        backgroundColor: theme.components.button.primary.background,
                        color: theme.components.button.primary.text,
                        borderRadius: theme.borderRadius.md,
                      }}
                    >
                      Primary Button
                    </button>
                    <button
                      className="px-4 py-2 rounded-md font-medium border transition-colors"
                      style={{
                        backgroundColor: theme.components.button.secondary.background,
                        color: theme.components.button.secondary.text,
                        borderColor: theme.components.button.secondary.border,
                        borderRadius: theme.borderRadius.md,
                      }}
                    >
                      Secondary Button
                    </button>
                  </div>

                  {/* Card */}
                  <div 
                    className="p-4 rounded-lg border"
                    style={{
                      backgroundColor: theme.components.card.background,
                      borderColor: theme.components.card.border,
                      borderRadius: theme.borderRadius.lg,
                      boxShadow: theme.shadows.md,
                    }}
                  >
                    <h3 
                      className="font-semibold mb-2"
                      style={{ color: theme.colors.text.primary }}
                    >
                      Sample Card
                    </h3>
                    <p style={{ color: theme.colors.text.secondary }}>
                      This is how your cards will look with the current theme settings.
                    </p>
                  </div>

                  {/* Typography Scale */}
                  <div className="space-y-2">
                    <h4 className="font-semibold">Typography Scale</h4>
                    {Object.entries(theme.fonts.sizes).map(([size, value]) => (
                      <div 
                        key={size}
                        style={{ 
                          fontSize: value,
                          fontFamily: theme.fonts.primary,
                          color: theme.colors.text.primary 
                        }}
                      >
                        {size}: The quick brown fox jumps
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}