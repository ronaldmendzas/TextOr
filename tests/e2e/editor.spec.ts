import { test, expect } from '@playwright/test';

test.describe('TextOr Editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('should load the editor successfully', async ({ page }) => {
    await expect(page.locator('.ProseMirror')).toBeVisible();
    
    const editorContent = await page.locator('.ProseMirror').textContent();
    expect(editorContent).toContain('Welcome to TextOr');
  });

  test('should type text in the editor', async ({ page }) => {
    const editor = page.locator('.ProseMirror');
    
    await editor.click();
    await editor.clear();
    await page.keyboard.type('Hello, this is a test!');
    
    const content = await editor.textContent();
    expect(content).toContain('Hello, this is a test!');
  });

  test('should format text with toolbar buttons', async ({ page }) => {
    const editor = page.locator('.ProseMirror');
    
    await editor.click();
    await editor.clear();
    await page.keyboard.type('Bold text');
    
    await page.keyboard.press('Control+A');
    
    await page.locator('button[title="Bold"]').click();
    
    const boldText = await page.locator('.ProseMirror strong').textContent();
    expect(boldText).toBe('Bold text');
  });

  test('should show slash command menu when typing /', async ({ page }) => {
    const editor = page.locator('.ProseMirror');
    
    await editor.click();
    await editor.clear();
    await page.keyboard.type('/');
    
    await expect(page.locator('text=Heading 1')).toBeVisible();
    await expect(page.locator('text=Code Block')).toBeVisible();
    await expect(page.locator('text=Table')).toBeVisible();
  });

  test('should insert heading using slash command', async ({ page }) => {
    const editor = page.locator('.ProseMirror');
    
    await editor.click();
    await editor.clear();
    await page.keyboard.type('/');
    
    await page.locator('text=Heading 1').click();
    await page.keyboard.type('My Title');
    
    const heading = await page.locator('.ProseMirror h1').textContent();
    expect(heading).toBe('My Title');
  });

  test('should show emoji picker when typing :', async ({ page }) => {
    const editor = page.locator('.ProseMirror');
    
    await editor.click();
    await editor.clear();
    await page.keyboard.type(':');
    
    await expect(page.locator('text=Search emojis...')).toBeVisible();
  });

  test('should insert emoji from picker', async ({ page }) => {
    const editor = page.locator('.ProseMirror');
    
    await editor.click();
    await editor.clear();
    await page.keyboard.type(':');
    
    const emojiButton = page.locator('button').filter({ hasText: '😀' }).first();
    await emojiButton.click();
    
    const content = await editor.textContent();
    expect(content).toContain('😀');
  });

  test('should calculate inline math expressions', async ({ page }) => {
    const editor = page.locator('.ProseMirror');
    
    await editor.click();
    await editor.clear();
    await page.keyboard.type('=100+250 ');
    
    await page.waitForTimeout(500);
    
    const content = await editor.textContent();
    expect(content).toContain('350');
  });

  test('should replace variables like {{date}}', async ({ page }) => {
    const editor = page.locator('.ProseMirror');
    
    await editor.click();
    await editor.clear();
    await page.keyboard.type('{{date}} ');
    
    await page.waitForTimeout(500);
    
    const content = await editor.textContent();
    expect(content).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
  });

  test('should show word count in footer', async ({ page }) => {
    const editor = page.locator('.ProseMirror');
    
    await editor.click();
    await editor.clear();
    await page.keyboard.type('One two three four five');
    
    await expect(page.locator('text=5 words')).toBeVisible();
  });

  test('should open analysis panel', async ({ page }) => {
    const analysisButton = page.locator('button[aria-label="Analysis"]');
    await analysisButton.click();
    
    await expect(page.locator('text=Writing Analysis')).toBeVisible();
    await expect(page.locator('text=Reading Time')).toBeVisible();
    await expect(page.locator('text=Sentiment')).toBeVisible();
  });

  test('should open export menu', async ({ page }) => {
    const exportButton = page.locator('button[aria-label="Export"]');
    await exportButton.click();
    
    await expect(page.locator('text=Export Document')).toBeVisible();
    await expect(page.locator('text=PDF')).toBeVisible();
    await expect(page.locator('text=Markdown')).toBeVisible();
  });

  test('should create a callout block', async ({ page }) => {
    const editor = page.locator('.ProseMirror');
    
    await editor.click();
    await editor.clear();
    await page.keyboard.type('/');
    
    await page.locator('text=Callout').click();
    
    await expect(page.locator('.callout')).toBeVisible();
  });

  test('should create a table', async ({ page }) => {
    const editor = page.locator('.ProseMirror');
    
    await editor.click();
    await editor.clear();
    await page.keyboard.type('/');
    
    await page.locator('text=Table').click();
    
    await expect(page.locator('table')).toBeVisible();
  });

  test('should toggle focus mode', async ({ page }) => {
    const editor = page.locator('.ProseMirror');
    
    await editor.click();
    await page.keyboard.type('Some content');
    
    const focusButton = page.locator('button').filter({ hasText: 'Focus Mode' });
    await focusButton.click();
    
    await page.waitForTimeout(300);
    
    const toolbar = page.locator('[class*="toolbar"]').first();
    const isHidden = await toolbar.isHidden().catch(() => true);
    expect(isHidden).toBe(true);
  });

  test('should handle undo/redo', async ({ page }) => {
    const editor = page.locator('.ProseMirror');
    
    await editor.click();
    await editor.clear();
    await page.keyboard.type('First text');
    
    await page.keyboard.press('Control+Z');
    
    const contentAfterUndo = await editor.textContent();
    expect(contentAfterUndo).not.toContain('First text');
    
    await page.keyboard.press('Control+Shift+Z');
    
    const contentAfterRedo = await editor.textContent();
    expect(contentAfterRedo).toContain('First text');
  });

  test('should create lists', async ({ page }) => {
    const editor = page.locator('.ProseMirror');
    
    await editor.click();
    await editor.clear();
    
    await page.locator('button[title="Bullet list"]').click();
    await page.keyboard.type('Item 1');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Item 2');
    
    const listItems = await page.locator('.ProseMirror ul li').count();
    expect(listItems).toBeGreaterThanOrEqual(2);
  });

  test('should insert links', async ({ page }) => {
    const editor = page.locator('.ProseMirror');
    
    await editor.click();
    await editor.clear();
    await page.keyboard.type('Click here');
    await page.keyboard.press('Control+A');
    
    await page.locator('button[title="Link"]').click();
    
    await page.waitForTimeout(200);
    
    const linkElement = await page.locator('.ProseMirror a');
    expect(await linkElement.count()).toBeGreaterThan(0);
  });
});
