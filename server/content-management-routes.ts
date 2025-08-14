/**
 * Content Management System API Routes
 * Text Content + Typography + Color Schemes + Component Styling
 */

import { Router } from 'express';
import { storage } from './storage';
import { requireAuth, requireRole } from './middleware/auth';
import { 
  insertPlatformTextContentSchema,
  insertPlatformTypographySchema,
  insertPlatformColorSchemeSchema,
  insertPlatformColorSchema,
  insertPlatformComponentStyleSchema,
  insertPlatformLayoutControlSchema,
  insertPlatformThemeSchema
} from '@shared/schema';

const router = Router();

// Middleware: All content management requires admin access
router.use(requireAuth);
router.use(requireRole(['superadmin', 'admin']));

// TEXT CONTENT MANAGEMENT ROUTES
router.get('/text', async (req, res) => {
  try {
    const textContent = await storage.getAllTextContent();
    res.json(textContent);
  } catch (error) {
    console.error('Error fetching text content:', error);
    res.status(500).json({ error: 'Failed to fetch text content' });
  }
});

router.get('/text/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const content = await storage.getTextContentByKey(key);
    if (!content) {
      return res.status(404).json({ error: 'Text content not found' });
    }
    res.json(content);
  } catch (error) {
    console.error('Error fetching text content by key:', error);
    res.status(500).json({ error: 'Failed to fetch text content' });
  }
});

router.post('/text', async (req, res) => {
  try {
    const validatedData = insertPlatformTextContentSchema.parse(req.body);
    const textContent = await storage.createTextContent({
      ...validatedData,
      createdBy: req.user.id,
    });
    res.status(201).json(textContent);
  } catch (error) {
    console.error('Error creating text content:', error);
    res.status(400).json({ error: 'Failed to create text content' });
  }
});

router.put('/text/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = insertPlatformTextContentSchema.partial().parse(req.body);
    const textContent = await storage.updateTextContent(parseInt(id), {
      ...validatedData,
      updatedAt: new Date(),
    });
    res.json(textContent);
  } catch (error) {
    console.error('Error updating text content:', error);
    res.status(400).json({ error: 'Failed to update text content' });
  }
});

router.delete('/text/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const success = await storage.deleteTextContent(parseInt(id));
    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Text content not found' });
    }
  } catch (error) {
    console.error('Error deleting text content:', error);
    res.status(500).json({ error: 'Failed to delete text content' });
  }
});

// TYPOGRAPHY CONTROL ROUTES
router.get('/typography', async (req, res) => {
  try {
    const typography = await storage.getAllTypographyStyles();
    res.json(typography);
  } catch (error) {
    console.error('Error fetching typography styles:', error);
    res.status(500).json({ error: 'Failed to fetch typography styles' });
  }
});

router.get('/typography/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const typography = await storage.getTypographyByKey(key);
    if (!typography) {
      return res.status(404).json({ error: 'Typography style not found' });
    }
    res.json(typography);
  } catch (error) {
    console.error('Error fetching typography by key:', error);
    res.status(500).json({ error: 'Failed to fetch typography style' });
  }
});

router.post('/typography', async (req, res) => {
  try {
    const validatedData = insertPlatformTypographySchema.parse(req.body);
    const typography = await storage.createTypographyStyle(validatedData);
    res.status(201).json(typography);
  } catch (error) {
    console.error('Error creating typography style:', error);
    res.status(400).json({ error: 'Failed to create typography style' });
  }
});

router.put('/typography/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = insertPlatformTypographySchema.partial().parse(req.body);
    const typography = await storage.updateTypographyStyle(parseInt(id), {
      ...validatedData,
      updatedAt: new Date(),
    });
    res.json(typography);
  } catch (error) {
    console.error('Error updating typography style:', error);
    res.status(400).json({ error: 'Failed to update typography style' });
  }
});

router.delete('/typography/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const success = await storage.deleteTypographyStyle(parseInt(id));
    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Typography style not found' });
    }
  } catch (error) {
    console.error('Error deleting typography style:', error);
    res.status(500).json({ error: 'Failed to delete typography style' });
  }
});

// COLOR SCHEME MANAGEMENT ROUTES
router.get('/color-schemes', async (req, res) => {
  try {
    const colorSchemes = await storage.getAllColorSchemes();
    res.json(colorSchemes);
  } catch (error) {
    console.error('Error fetching color schemes:', error);
    res.status(500).json({ error: 'Failed to fetch color schemes' });
  }
});

router.get('/color-schemes/default', async (req, res) => {
  try {
    const defaultScheme = await storage.getDefaultColorScheme();
    res.json(defaultScheme);
  } catch (error) {
    console.error('Error fetching default color scheme:', error);
    res.status(500).json({ error: 'Failed to fetch default color scheme' });
  }
});

router.post('/color-schemes', async (req, res) => {
  try {
    const validatedData = insertPlatformColorSchemeSchema.parse(req.body);
    const colorScheme = await storage.createColorScheme(validatedData);
    res.status(201).json(colorScheme);
  } catch (error) {
    console.error('Error creating color scheme:', error);
    res.status(400).json({ error: 'Failed to create color scheme' });
  }
});

router.put('/color-schemes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = insertPlatformColorSchemeSchema.partial().parse(req.body);
    const colorScheme = await storage.updateColorScheme(parseInt(id), {
      ...validatedData,
      updatedAt: new Date(),
    });
    res.json(colorScheme);
  } catch (error) {
    console.error('Error updating color scheme:', error);
    res.status(400).json({ error: 'Failed to update color scheme' });
  }
});

router.post('/color-schemes/:id/set-default', async (req, res) => {
  try {
    const { id } = req.params;
    const success = await storage.setDefaultColorScheme(parseInt(id));
    res.json({ success });
  } catch (error) {
    console.error('Error setting default color scheme:', error);
    res.status(500).json({ error: 'Failed to set default color scheme' });
  }
});

// COLOR MANAGEMENT ROUTES
router.get('/color-schemes/:schemeId/colors', async (req, res) => {
  try {
    const { schemeId } = req.params;
    const colors = await storage.getColorsForScheme(parseInt(schemeId));
    res.json(colors);
  } catch (error) {
    console.error('Error fetching colors for scheme:', error);
    res.status(500).json({ error: 'Failed to fetch colors' });
  }
});

router.post('/colors', async (req, res) => {
  try {
    const validatedData = insertPlatformColorSchema.parse(req.body);
    const color = await storage.createColor(validatedData);
    res.status(201).json(color);
  } catch (error) {
    console.error('Error creating color:', error);
    res.status(400).json({ error: 'Failed to create color' });
  }
});

router.put('/colors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = insertPlatformColorSchema.partial().parse(req.body);
    const color = await storage.updateColor(parseInt(id), {
      ...validatedData,
      updatedAt: new Date(),
    });
    res.json(color);
  } catch (error) {
    console.error('Error updating color:', error);
    res.status(400).json({ error: 'Failed to update color' });
  }
});

// COMPONENT STYLING ROUTES
router.get('/component-styles', async (req, res) => {
  try {
    const { componentType } = req.query;
    let componentStyles;
    
    if (componentType) {
      componentStyles = await storage.getComponentStylesByType(componentType as string);
    } else {
      componentStyles = await storage.getAllComponentStyles();
    }
    
    res.json(componentStyles);
  } catch (error) {
    console.error('Error fetching component styles:', error);
    res.status(500).json({ error: 'Failed to fetch component styles' });
  }
});

router.post('/component-styles', async (req, res) => {
  try {
    const validatedData = insertPlatformComponentStyleSchema.parse(req.body);
    const componentStyle = await storage.createComponentStyle(validatedData);
    res.status(201).json(componentStyle);
  } catch (error) {
    console.error('Error creating component style:', error);
    res.status(400).json({ error: 'Failed to create component style' });
  }
});

router.put('/component-styles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = insertPlatformComponentStyleSchema.partial().parse(req.body);
    const componentStyle = await storage.updateComponentStyle(parseInt(id), {
      ...validatedData,
      updatedAt: new Date(),
    });
    res.json(componentStyle);
  } catch (error) {
    console.error('Error updating component style:', error);
    res.status(400).json({ error: 'Failed to update component style' });
  }
});

// LAYOUT CONTROLS ROUTES
router.get('/layout-controls', async (req, res) => {
  try {
    const { category } = req.query;
    let layoutControls;
    
    if (category) {
      layoutControls = await storage.getLayoutControlsByCategory(category as string);
    } else {
      layoutControls = await storage.getAllLayoutControls();
    }
    
    res.json(layoutControls);
  } catch (error) {
    console.error('Error fetching layout controls:', error);
    res.status(500).json({ error: 'Failed to fetch layout controls' });
  }
});

router.post('/layout-controls', async (req, res) => {
  try {
    const validatedData = insertPlatformLayoutControlSchema.parse(req.body);
    const layoutControl = await storage.createLayoutControl(validatedData);
    res.status(201).json(layoutControl);
  } catch (error) {
    console.error('Error creating layout control:', error);
    res.status(400).json({ error: 'Failed to create layout control' });
  }
});

// THEME MANAGEMENT ROUTES
router.get('/themes', async (req, res) => {
  try {
    const themes = await storage.getAllThemes();
    res.json(themes);
  } catch (error) {
    console.error('Error fetching themes:', error);
    res.status(500).json({ error: 'Failed to fetch themes' });
  }
});

router.get('/themes/default', async (req, res) => {
  try {
    const defaultTheme = await storage.getDefaultTheme();
    res.json(defaultTheme);
  } catch (error) {
    console.error('Error fetching default theme:', error);
    res.status(500).json({ error: 'Failed to fetch default theme' });
  }
});

router.post('/themes', async (req, res) => {
  try {
    const validatedData = insertPlatformThemeSchema.parse(req.body);
    const theme = await storage.createTheme({
      ...validatedData,
      createdBy: req.user.id,
    });
    res.status(201).json(theme);
  } catch (error) {
    console.error('Error creating theme:', error);
    res.status(400).json({ error: 'Failed to create theme' });
  }
});

router.post('/themes/:id/generate-css', async (req, res) => {
  try {
    const { id } = req.params;
    const css = await storage.generateThemeCSS(parseInt(id));
    res.json({ css });
  } catch (error) {
    console.error('Error generating theme CSS:', error);
    res.status(500).json({ error: 'Failed to generate theme CSS' });
  }
});

router.post('/themes/:id/apply', async (req, res) => {
  try {
    const { id } = req.params;
    const success = await storage.applyTheme(parseInt(id));
    res.json({ success });
  } catch (error) {
    console.error('Error applying theme:', error);
    res.status(500).json({ error: 'Failed to apply theme' });
  }
});

// CSS GENERATION ROUTE
router.post('/generate-css', async (req, res) => {
  try {
    // Get current default theme
    const defaultTheme = await storage.getDefaultTheme();
    if (!defaultTheme) {
      return res.status(404).json({ error: 'No default theme found' });
    }
    
    // Generate CSS for the default theme
    const css = await storage.generateThemeCSS(defaultTheme.id);
    
    // Apply the theme
    await storage.applyTheme(defaultTheme.id);
    
    res.json({ 
      success: true, 
      css,
      message: 'CSS generated and applied successfully' 
    });
  } catch (error) {
    console.error('Error generating CSS:', error);
    res.status(500).json({ error: 'Failed to generate CSS' });
  }
});

export default router;