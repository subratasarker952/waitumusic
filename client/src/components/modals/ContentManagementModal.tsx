import { useState } from 'react';
import { useModalManager } from '@/hooks/useModalManager';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Upload, Palette, Type, Image, Settings } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

const logoUploadSchema = z.object({
  logoFile: z.instanceof(File).optional(),
  logoUrl: z.string().optional(),
}).refine(
  (data) => data.logoFile || (data.logoUrl && data.logoUrl.trim() !== ''),
  {
    message: "Please provide either a file or URL",
    path: ["logoUrl"],
  }
).refine(
  (data) => !data.logoUrl || data.logoUrl === '' || z.string().url().safeParse(data.logoUrl).success,
  {
    message: "Please enter a valid URL",
    path: ["logoUrl"],
  }
);

const colorSchemeSchema = z.object({
  primaryColor: z.string().min(1, 'Primary color is required'),
  secondaryColor: z.string().min(1, 'Secondary color is required'),
  accentColor: z.string().min(1, 'Accent color is required'),
  backgroundColor: z.string().min(1, 'Background color is required'),
});

const fontSettingsSchema = z.object({
  headingFont: z.string().min(1, 'Heading font is required'),
  bodyFont: z.string().min(1, 'Body font is required'),
  fontSize: z.string().min(1, 'Font size is required'),
});

type LogoUploadData = z.infer<typeof logoUploadSchema>;
type ColorSchemeData = z.infer<typeof colorSchemeSchema>;
type FontSettingsData = z.infer<typeof fontSettingsSchema>;

interface ContentManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'logo' | 'colors' | 'fonts';
}

export default function ContentManagementModal({ open, onOpenChange, type }: ContentManagementModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      logoForm.setValue('logoFile', file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Clear URL field when file is selected
      logoForm.setValue('logoUrl', '');
    }
  };

  const handleUrlChange = (value: string) => {
    if (value && selectedFile) {
      // Clear file selection when URL is entered
      setSelectedFile(null);
      setPreviewUrl(null);
      logoForm.setValue('logoFile', undefined);
    }
  };

  const logoForm = useForm<LogoUploadData>({
    resolver: zodResolver(logoUploadSchema),
    defaultValues: {
      logoUrl: 'https://waitumusic.com/logo.png',
    },
  });

  const colorForm = useForm<ColorSchemeData>({
    resolver: zodResolver(colorSchemeSchema),
    defaultValues: {
      primaryColor: '#8B5CF6',
      secondaryColor: '#06B6D4',
      accentColor: '#F59E0B',
      backgroundColor: '#FFFFFF',
    },
  });

  const fontForm = useForm<FontSettingsData>({
    resolver: zodResolver(fontSettingsSchema),
    defaultValues: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
      fontSize: '16px',
    },
  });

  const onLogoSubmit = async (data: LogoUploadData) => {
    setIsLoading(true);
    try {
      if (selectedFile) {
        // Handle file upload
        const formData = new FormData();
        formData.append('logo', selectedFile);
        formData.append('type', 'platform_logo');
        
        const response = await apiRequest('/api/admin/upload-logo', {
          method: 'POST',
          body: formData
        });
        
        toast({
          title: "Logo Uploaded",
          description: `Logo "${selectedFile.name}" has been uploaded successfully.`,
        });
      } else if (data.logoUrl) {
        // Handle URL update
        await apiRequest('/api/admin/config', {
          method: 'PATCH',
          body: JSON.stringify({
            platform: { logoUrl: data.logoUrl }
          })
        });
        
        toast({
          title: "Logo URL Updated",
          description: "Platform logo URL has been updated successfully.",
        });
      }
      
      onOpenChange(false);
      // Reset form state
      setSelectedFile(null);
      setPreviewUrl(null);
      logoForm.reset();
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update logo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onColorSubmit = async (data: ColorSchemeData) => {
    setIsLoading(true);
    try {
      await apiRequest('/api/admin/config', {
        method: 'PATCH',
        body: JSON.stringify({
          styling: {
            colors: {
              primary: data.primaryColor,
              secondary: data.secondaryColor,
              accent: data.accentColor
            }
          }
        })
      });
      
      toast({
        title: "Color Scheme Updated",
        description: "Platform color scheme has been applied successfully.",
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update color scheme. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onFontSubmit = async (data: FontSettingsData) => {
    setIsLoading(true);
    try {
      await apiRequest('/api/admin/config', {
        method: 'PATCH',
        body: JSON.stringify({
          styling: {
            fonts: {
              heading: data.headingFont,
              body: data.bodyFont,
              size: data.fontSize
            }
          }
        })
      });
      
      toast({
        title: "Font Settings Updated",
        description: "Platform typography has been updated successfully.",
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update font settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getModalContent = () => {
    switch (type) {
      case 'logo':
        return {
          title: "Logo Management",
          description: "Upload and manage platform logo",
          icon: <Image className="h-5 w-5" />,
          content: (
            <Form {...logoForm}>
              <form onSubmit={logoForm.handleSubmit(onLogoSubmit)} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Logo Preview</CardTitle>
                    <CardDescription>Preview of the selected logo</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center p-8 border-2 border-dashed rounded-lg">
                      {previewUrl ? (
                        <div className="text-center">
                          <img 
                            src={previewUrl} 
                            alt="Logo preview" 
                            className="max-h-24 max-w-full mx-auto mb-2 rounded"
                          />
                          <p className="text-sm text-muted-foreground">{selectedFile?.name}</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Image className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Upload a logo to see preview</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <FormField
                    control={logoForm.control}
                    name="logoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo URL</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://example.com/logo.png" 
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              handleUrlChange(e.target.value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="text-center text-sm text-muted-foreground">
                    or
                  </div>

                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">PNG, JPG or SVG (MAX. 800x400px)</p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileSelect}
                      />
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Updating...' : 'Update Logo'}
                  </Button>
                </div>
              </form>
            </Form>
          ),
        };

      case 'colors':
        return {
          title: "Color Scheme Management",
          description: "Customize platform colors and branding",
          icon: <Palette className="h-5 w-5" />,
          content: (
            <Form {...colorForm}>
              <form onSubmit={colorForm.handleSubmit(onColorSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <FormField
                    control={colorForm.control}
                    name="primaryColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Color</FormLabel>
                        <div className="flex space-x-2">
                          <FormControl>
                            <Input type="color" {...field} className="w-16 h-10" />
                          </FormControl>
                          <FormControl>
                            <Input placeholder="#8B5CF6" {...field} className="flex-1" />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={colorForm.control}
                    name="secondaryColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Secondary Color</FormLabel>
                        <div className="flex space-x-2">
                          <FormControl>
                            <Input type="color" {...field} className="w-16 h-10" />
                          </FormControl>
                          <FormControl>
                            <Input placeholder="#06B6D4" {...field} className="flex-1" />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={colorForm.control}
                    name="accentColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Accent Color</FormLabel>
                        <div className="flex space-x-2">
                          <FormControl>
                            <Input type="color" {...field} className="w-16 h-10" />
                          </FormControl>
                          <FormControl>
                            <Input placeholder="#F59E0B" {...field} className="flex-1" />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={colorForm.control}
                    name="backgroundColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Background Color</FormLabel>
                        <div className="flex space-x-2">
                          <FormControl>
                            <Input type="color" {...field} className="w-16 h-10" />
                          </FormControl>
                          <FormControl>
                            <Input placeholder="#FFFFFF" {...field} className="flex-1" />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Color Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex space-x-4">
                        <div className="flex-1 p-4 rounded-lg text-white" style={{backgroundColor: colorForm.watch('primaryColor')}}>
                          <p className="font-semibold">Primary Color</p>
                          <p className="text-sm opacity-90">Main brand color</p>
                        </div>
                        <div className="flex-1 p-4 rounded-lg text-white" style={{backgroundColor: colorForm.watch('secondaryColor')}}>
                          <p className="font-semibold">Secondary Color</p>
                          <p className="text-sm opacity-90">Supporting color</p>
                        </div>
                      </div>
                      <div className="flex space-x-4">
                        <div className="flex-1 p-4 rounded-lg text-white" style={{backgroundColor: colorForm.watch('accentColor')}}>
                          <p className="font-semibold">Accent Color</p>
                          <p className="text-sm opacity-90">Highlight color</p>
                        </div>
                        <div className="flex-1 p-4 rounded-lg border-2" style={{backgroundColor: colorForm.watch('backgroundColor')}}>
                          <p className="font-semibold">Background</p>
                          <p className="text-sm text-muted-foreground">Main background</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Applying...' : 'Apply Colors'}
                  </Button>
                </div>
              </form>
            </Form>
          ),
        };

      case 'fonts':
        return {
          title: "Font Settings",
          description: "Customize platform typography",
          icon: <Type className="h-5 w-5" />,
          content: (
            <Form {...fontForm}>
              <form onSubmit={fontForm.handleSubmit(onFontSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <FormField
                    control={fontForm.control}
                    name="headingFont"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Heading Font</FormLabel>
                        <FormControl>
                          <Input placeholder="Inter, Arial, sans-serif" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={fontForm.control}
                    name="bodyFont"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Body Font</FormLabel>
                        <FormControl>
                          <Input placeholder="Inter, Arial, sans-serif" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={fontForm.control}
                  name="fontSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Font Size</FormLabel>
                      <FormControl>
                        <Input placeholder="16px" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Typography Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div style={{fontFamily: fontForm.watch('headingFont'), fontSize: '24px'}}>
                        <h2 className="font-bold">Sample Heading</h2>
                        <p className="text-muted-foreground">Using heading font: {fontForm.watch('headingFont')}</p>
                      </div>
                      <div style={{fontFamily: fontForm.watch('bodyFont'), fontSize: fontForm.watch('fontSize')}}>
                        <p>Sample body text using the selected font family and size. This shows how regular content will appear on your platform.</p>
                        <p className="text-sm text-muted-foreground">Font: {fontForm.watch('bodyFont')} | Size: {fontForm.watch('fontSize')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Updating...' : 'Update Fonts'}
                  </Button>
                </div>
              </form>
            </Form>
          ),
        };

      default:
        return { title: '', description: '', icon: null, content: null };
    }
  };

  const modalContent = getModalContent();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {modalContent.icon}
            <span>{modalContent.title}</span>
          </DialogTitle>
          <DialogDescription>
            {modalContent.description}
          </DialogDescription>
        </DialogHeader>

        {modalContent.content}
      </DialogContent>
    </Dialog>
  );
}