/**
 * Comprehensive Content Management Center
 * Text Content + Typography + Color Schemes + Component Styling Control
 */

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Type, 
  Palette, 
  Settings, 
  Plus, 
  Edit, 
  Save, 
  Trash2, 
  Eye, 
  Download, 
  Upload,
  Copy,
  Wand2,
  Paintbrush,
  FileText,
  Layout,
  Layers
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Form schemas
const textContentSchema = z.object({
  contentKey: z.string().min(1, 'Content key is required'),
  contentValue: z.string().min(1, 'Content value is required'),
  contentType: z.enum(['button', 'heading', 'label', 'description', 'error', 'success', 'navigation', 'form']),
  componentLocation: z.string().optional(),
  isMarkdown: z.boolean().default(false),
  isHtml: z.boolean().default(false),
  context: z.string().optional(),
  priority: z.enum(['critical', 'high', 'normal', 'low']).default('normal'),
  language: z.string().default('en'),
});

const typographySchema = z.object({
  typographyKey: z.string().min(1, 'Typography key is required'),
  fontFamily: z.string().min(1, 'Font family is required'),
  fontSize: z.string().min(1, 'Font size is required'),
  fontWeight: z.string().min(1, 'Font weight is required'),
  lineHeight: z.string().min(1, 'Line height is required'),
  letterSpacing: z.string().default('normal'),
  textTransform: z.enum(['none', 'uppercase', 'lowercase', 'capitalize']).default('none'),
  textAlign: z.enum(['left', 'center', 'right', 'justify']).default('left'),
  category: z.enum(['headings', 'body', 'buttons', 'labels', 'forms', 'navigation']),
});

const colorSchemeSchema = z.object({
  schemeName: z.string().min(1, 'Scheme name is required'),
  description: z.string().optional(),
  isDefault: z.boolean().default(false),
});

const colorSchema = z.object({
  colorKey: z.string().min(1, 'Color key is required'),
  colorValue: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, 'Invalid hex color'),
  colorName: z.string().optional(),
  category: z.enum(['primary', 'semantic', 'neutral', 'accent']),
  opacity: z.number().min(0).max(1).default(1),
  usage: z.string().optional(),
});

const componentStyleSchema = z.object({
  componentType: z.string().min(1, 'Component type is required'),
  variant: z.string().min(1, 'Variant is required'),
  styleKey: z.string().min(1, 'Style key is required'),
  styleProperty: z.string().min(1, 'CSS property is required'),
  styleValue: z.string().min(1, 'CSS value is required'),
  state: z.enum(['default', 'hover', 'focus', 'active', 'disabled']).default('default'),
  breakpoint: z.enum(['all', 'sm', 'md', 'lg', 'xl']).default('all'),
  category: z.enum(['spacing', 'colors', 'borders', 'effects', 'typography']),
});

type TextContentForm = z.infer<typeof textContentSchema>;
type TypographyForm = z.infer<typeof typographySchema>;
type ColorSchemeForm = z.infer<typeof colorSchemeSchema>;
type ColorForm = z.infer<typeof colorSchema>;
type ComponentStyleForm = z.infer<typeof componentStyleSchema>;

export default function ContentManagementCenter() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('text-content');
  const [previewMode, setPreviewMode] = useState(false);

  // Data queries
  const { data: textContent = [], isLoading: textLoading } = useQuery({
    queryKey: ['/api/admin/content/text'],
  });

  const { data: typography = [], isLoading: typographyLoading } = useQuery({
    queryKey: ['/api/admin/content/typography'],
  });

  const { data: colorSchemes = [], isLoading: colorsLoading } = useQuery({
    queryKey: ['/api/admin/content/color-schemes'],
  });

  const { data: componentStyles = [], isLoading: stylesLoading } = useQuery({
    queryKey: ['/api/admin/content/component-styles'],
  });

  // Mutations
  const createTextContentMutation = useMutation({
    mutationFn: async (data: TextContentForm) => 
      apiRequest('/api/admin/content/text', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/content/text'] });
      toast({ title: 'Text content created successfully' });
    },
  });

  const createTypographyMutation = useMutation({
    mutationFn: async (data: TypographyForm) => 
      apiRequest('/api/admin/content/typography', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/content/typography'] });
      toast({ title: 'Typography style created successfully' });
    },
  });

  const createColorSchemeMutation = useMutation({
    mutationFn: async (data: ColorSchemeForm) => 
      apiRequest('/api/admin/content/color-schemes', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/content/color-schemes'] });
      toast({ title: 'Color scheme created successfully' });
    },
  });

  const generateCSSMutation = useMutation({
    mutationFn: async () => apiRequest('/api/admin/content/generate-css', { method: 'POST' }),
    onSuccess: () => {
      toast({ title: 'CSS styles generated and applied successfully' });
    },
  });

  // TEXT CONTENT MANAGEMENT TAB
  const TextContentTab = () => {
    const form = useForm<TextContentForm>({
      resolver: zodResolver(textContentSchema),
      defaultValues: {
        contentType: 'label',
        priority: 'normal',
        language: 'en',
        isMarkdown: false,
        isHtml: false,
      },
    });

    const onSubmit = (data: TextContentForm) => {
      createTextContentMutation.mutate(data);
      form.reset();
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Text Content Management</h3>
            <p className="text-sm text-muted-foreground">
              Control every string displayed in the application
            </p>
          </div>
          <Button onClick={() => generateCSSMutation.mutate()} disabled={generateCSSMutation.isPending}>
            <Wand2 className="h-4 w-4 mr-2" />
            Generate CSS
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add New Text Content Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Text Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="contentKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content Key</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., button.save" {...field} />
                        </FormControl>
                        <FormDescription>
                          Unique identifier for this text content
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contentValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content Value</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter the text content..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contentType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="button">Button</SelectItem>
                              <SelectItem value="heading">Heading</SelectItem>
                              <SelectItem value="label">Label</SelectItem>
                              <SelectItem value="description">Description</SelectItem>
                              <SelectItem value="error">Error</SelectItem>
                              <SelectItem value="success">Success</SelectItem>
                              <SelectItem value="navigation">Navigation</SelectItem>
                              <SelectItem value="form">Form</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="critical">Critical</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="componentLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Component Location</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., AdminDashboard" {...field} />
                        </FormControl>
                        <FormDescription>
                          Optional: Specify which component uses this text
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-4">
                    <FormField
                      control={form.control}
                      name="isMarkdown"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>Markdown Support</FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isHtml"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>HTML Support</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={createTextContentMutation.isPending}
                  >
                    {createTextContentMutation.isPending ? 'Creating...' : 'Create Text Content'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Text Content List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Current Text Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              {textLoading ? (
                <div className="text-center py-4 text-muted-foreground">Loading...</div>
              ) : textContent.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No text content found. Create your first entry above.
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {textContent.map((item: any) => (
                    <div key={item.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {item.contentKey}
                        </code>
                        <div className="flex gap-1">
                          <Badge variant={item.priority === 'critical' ? 'destructive' : 'secondary'}>
                            {item.priority}
                          </Badge>
                          <Badge variant="outline">{item.contentType}</Badge>
                        </div>
                      </div>
                      <p className="text-sm">{item.contentValue}</p>
                      {item.componentLocation && (
                        <p className="text-xs text-muted-foreground">
                          Component: {item.componentLocation}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // TYPOGRAPHY CONTROL TAB
  const TypographyTab = () => {
    const form = useForm<TypographyForm>({
      resolver: zodResolver(typographySchema),
      defaultValues: {
        textTransform: 'none',
        textAlign: 'left',
        letterSpacing: 'normal',
        category: 'body',
      },
    });

    const onSubmit = (data: TypographyForm) => {
      createTypographyMutation.mutate(data);
      form.reset();
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Typography Control</h3>
            <p className="text-sm text-muted-foreground">
              Manage fonts, sizes, and text styling across the platform
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                Create Typography Style
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="typographyKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Typography Key</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., heading.h1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fontFamily"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Font Family</FormLabel>
                          <FormControl>
                            <Input placeholder="Inter, sans-serif" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fontSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Font Size</FormLabel>
                          <FormControl>
                            <Input placeholder="1.5rem" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fontWeight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Font Weight</FormLabel>
                          <FormControl>
                            <Input placeholder="600" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lineHeight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Line Height</FormLabel>
                          <FormControl>
                            <Input placeholder="1.5" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="headings">Headings</SelectItem>
                            <SelectItem value="body">Body</SelectItem>
                            <SelectItem value="buttons">Buttons</SelectItem>
                            <SelectItem value="labels">Labels</SelectItem>
                            <SelectItem value="forms">Forms</SelectItem>
                            <SelectItem value="navigation">Navigation</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={createTypographyMutation.isPending}>
                    {createTypographyMutation.isPending ? 'Creating...' : 'Create Typography Style'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Typography Styles</CardTitle>
            </CardHeader>
            <CardContent>
              {typographyLoading ? (
                <div className="text-center py-4 text-muted-foreground">Loading...</div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {typography.map((style: any) => (
                    <div key={style.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {style.typographyKey}
                        </code>
                        <Badge variant="outline">{style.category}</Badge>
                      </div>
                      <div 
                        className="text-sample"
                        style={{
                          fontFamily: style.fontFamily,
                          fontSize: style.fontSize,
                          fontWeight: style.fontWeight,
                          lineHeight: style.lineHeight,
                          letterSpacing: style.letterSpacing,
                          textTransform: style.textTransform,
                          textAlign: style.textAlign,
                        }}
                      >
                        Sample Text Preview
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        {style.fontFamily} • {style.fontSize} • {style.fontWeight}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // COLOR SCHEMES TAB
  const ColorSchemesTab = () => {
    const colorSchemeForm = useForm<ColorSchemeForm>({
      resolver: zodResolver(colorSchemeSchema),
      defaultValues: {
        isDefault: false,
      },
    });

    const onSubmitColorScheme = (data: ColorSchemeForm) => {
      createColorSchemeMutation.mutate(data);
      colorSchemeForm.reset();
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Color Scheme Management</h3>
            <p className="text-sm text-muted-foreground">
              Control brand colors and create color schemes
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Create Color Scheme
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...colorSchemeForm}>
                <form onSubmit={colorSchemeForm.handleSubmit(onSubmitColorScheme)} className="space-y-4">
                  <FormField
                    control={colorSchemeForm.control}
                    name="schemeName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Scheme Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Dark Mode" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={colorSchemeForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe this color scheme..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={colorSchemeForm.control}
                    name="isDefault"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Set as Default Scheme</FormLabel>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={createColorSchemeMutation.isPending}>
                    {createColorSchemeMutation.isPending ? 'Creating...' : 'Create Color Scheme'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Color Schemes</CardTitle>
            </CardHeader>
            <CardContent>
              {colorsLoading ? (
                <div className="text-center py-4 text-muted-foreground">Loading...</div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {colorSchemes.map((scheme: any) => (
                    <div key={scheme.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{scheme.schemeName}</h4>
                          {scheme.description && (
                            <p className="text-sm text-muted-foreground">{scheme.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {scheme.isDefault && (
                            <Badge variant="default">Default</Badge>
                          )}
                          <Badge variant={scheme.isActive ? 'default' : 'secondary'}>
                            {scheme.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content Management Center</h1>
          <p className="text-muted-foreground">
            Complete control over text content, typography, colors, and component styling
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={previewMode ? 'default' : 'outline'}
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? 'Exit Preview' : 'Preview Mode'}
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Config
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="text-content" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Text Content
          </TabsTrigger>
          <TabsTrigger value="typography" className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            Typography
          </TabsTrigger>
          <TabsTrigger value="colors" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Color Schemes
          </TabsTrigger>
          <TabsTrigger value="components" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Component Styles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text-content">
          <TextContentTab />
        </TabsContent>

        <TabsContent value="typography">
          <TypographyTab />
        </TabsContent>

        <TabsContent value="colors">
          <ColorSchemesTab />
        </TabsContent>

        <TabsContent value="components">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Component Styling (Coming Soon)
              </CardTitle>
              <CardDescription>
                Granular control over UI component styling, states, and responsive behavior.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Settings className="h-4 w-4" />
                <AlertDescription>
                  Component styling management is under development. 
                  This will allow you to customize button styles, form elements, cards, and more.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}