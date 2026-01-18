import { describe, it, expect } from 'vitest';
import { useEditorStore } from '@/store/editor.store';
import type { Document } from '@/types/editor';

describe('Editor Store', () => {
  const mockDocument: Document = {
    id: 'test-doc',
    title: 'Test Document',
    content: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
    userId: 'test-user',
  };

  it('should initialize with document', () => {
    useEditorStore.getState().setDocument({ ...mockDocument });
    const { document } = useEditorStore.getState();
    expect(document).toBeDefined();
    expect(document?.id).toBe('test-doc');
  });

  it('should have undo/redo capabilities', () => {
    const store = useEditorStore.getState();
    expect(store.canUndo).toBeDefined();
    expect(store.canRedo).toBeDefined();
    expect(store.undo).toBeDefined();
    expect(store.redo).toBeDefined();
  });

  it('should have focus mode functionality', () => {
    const store = useEditorStore.getState();
    expect(store.focusMode).toBeDefined();
    expect(store.toggleFocusMode).toBeDefined();
  });

  it('should track saving state', () => {
    const store = useEditorStore.getState();
    expect(store.isSaving).toBeDefined();
    expect(store.setSaving).toBeDefined();
  });

  it('should track last saved time', () => {
    const store = useEditorStore.getState();
    expect(store.lastSaved).toBeDefined();
    expect(store.setLastSaved).toBeDefined();
  });

  it('should update content', () => {
    const store = useEditorStore.getState();
    expect(store.updateContent).toBeDefined();
  });
});
