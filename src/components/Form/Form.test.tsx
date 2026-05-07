import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Form from './Form';

const FormItem = Form.Item;

const submitForm = (container: HTMLElement) => {
  const form = container.querySelector('form');
  if (!form) throw new Error('form not found');
  fireEvent.submit(form);
};

describe('<Form />', () => {
  it('submits collected values via onFinish', async () => {
    const onFinish = vi.fn();
    const { container } = render(
      <Form onFinish={onFinish} initialValues={{ name: 'Aurora' }}>
        <FormItem name="name" label="Name">
          <input data-testid="name" />
        </FormItem>
        <button type="submit">提交</button>
      </Form>,
    );

    submitForm(container);
    await waitFor(() => expect(onFinish).toHaveBeenCalledWith({ name: 'Aurora' }));
  });

  it('shows required error and blocks submission', async () => {
    const onFinish = vi.fn();
    const onFinishFailed = vi.fn();
    const { container } = render(
      <Form onFinish={onFinish} onFinishFailed={onFinishFailed}>
        <FormItem name="email" label="Email" rules={[{ required: true, message: '必填' }]}>
          <input data-testid="email" />
        </FormItem>
        <button type="submit">提交</button>
      </Form>,
    );

    submitForm(container);
    await waitFor(() => expect(onFinishFailed).toHaveBeenCalledOnce());
    expect(onFinish).not.toHaveBeenCalled();
    expect(await screen.findByRole('alert')).toHaveTextContent('必填');
  });

  it('wires aria-describedby to error message for a11y', async () => {
    const { container } = render(
      <Form onFinish={() => {}} onFinishFailed={() => {}}>
        <FormItem name="email" label="Email" rules={[{ required: true, message: '必填' }]}>
          <input data-testid="email" />
        </FormItem>
        <button type="submit">提交</button>
      </Form>,
    );

    submitForm(container);
    const errorEl = await screen.findByRole('alert');
    const input = screen.getByTestId('email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input.getAttribute('aria-describedby')).toBe(errorEl.id);
  });
});
