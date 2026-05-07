import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import Modal from './Modal';

describe('<Modal />', () => {
  it('does not render dialog when closed', () => {
    render(
      <Modal open={false} title="Hi">
        body
      </Modal>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders dialog with body and title when open', () => {
    render(
      <Modal open title="Hello">
        message body
      </Modal>,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('message body')).toBeInTheDocument();
  });

  it('calls onCancel when Escape pressed', () => {
    const onCancel = vi.fn();
    render(
      <Modal open title="t" onCancel={onCancel}>
        body
      </Modal>,
    );
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalled();
  });

  it('respects keyboard={false} (does not close on Escape)', () => {
    const onCancel = vi.fn();
    render(
      <Modal open keyboard={false} title="t" onCancel={onCancel}>
        body
      </Modal>,
    );
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('renders default ok / cancel footer with locale text', () => {
    render(
      <Modal open title="t" onOk={() => {}} onCancel={() => {}}>
        body
      </Modal>,
    );
    // 默认中文 locale: 确定 / 取消
    expect(screen.getByRole('button', { name: '确定' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '取消' })).toBeInTheDocument();
  });

  it('forwards ref to dialog panel', () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <Modal ref={ref} open title="t">
        body
      </Modal>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveAttribute('role', 'dialog');
  });
});
