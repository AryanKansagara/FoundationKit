import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { createRef } from 'react';
import { AccessRequestForm, Button, Notice, TextField } from './index';

afterEach(cleanup);
describe('Button', () => {
  it('defaults to a non-submit button', () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole('button', { name: 'Save' }).getAttribute('type')).toBe('button');
  });
  it('supports keyboard activation', async () => {
    const click = vi.fn(); const user = userEvent.setup();
    render(<Button onClick={click}>Save</Button>);
    await user.tab(); await user.keyboard('{Enter}');
    expect(click).toHaveBeenCalledTimes(1);
  });
  it('blocks disabled clicks', async () => {
    const click = vi.fn(); render(<Button disabled onClick={click}>Save</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(click).not.toHaveBeenCalled();
  });
  it('announces busy state and prevents duplicate activation', async () => {
    const click = vi.fn(); render(<Button loading onClick={click}>Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button.getAttribute('aria-busy')).toBe('true');
    await userEvent.click(button); expect(click).not.toHaveBeenCalled();
  });
  it('forwards a focusable ref', () => {
    const ref = createRef<HTMLButtonElement>(); render(<Button ref={ref}>Save</Button>);
    ref.current?.focus(); expect(document.activeElement).toBe(ref.current);
  });
});
describe('TextField', () => {
  it('connects the visible label to the input', () => {
    render(<TextField label="Email" />);
    expect(screen.getByLabelText('Email').tagName).toBe('INPUT');
  });
  it('preserves caller IDs', () => {
    render(<TextField label="Email" id="work-email" />);
    expect(screen.getByLabelText('Email').id).toBe('work-email');
  });
  it('creates distinct IDs for repeated fields', () => {
    render(<><TextField label="First" /><TextField label="Second" /></>);
    expect(screen.getByLabelText('First').id).not.toBe(screen.getByLabelText('Second').id);
  });
  it('retains external, help and error descriptions', () => {
    render(<><p id="external">External</p><TextField label="Email" help="Work address" error="Invalid email" aria-describedby="external" /></>);
    const field = screen.getByLabelText('Email');
    const ids = field.getAttribute('aria-describedby')!.split(' ');
    expect(ids.map(id => document.getElementById(id)?.textContent)).toEqual(['External', 'Work address', 'Invalid email']);
    expect(field.getAttribute('aria-invalid')).toBe('true');
  });
  it('clears invalid state when the error is removed', () => {
    const { rerender } = render(<TextField label="Email" error="Invalid" />);
    rerender(<TextField label="Email" />);
    expect(screen.getByLabelText('Email').getAttribute('aria-invalid')).toBeNull();
    expect(screen.queryByText('Invalid')).toBeNull();
  });
  it('accepts typed values and exposes required semantics', async () => {
    render(<TextField label="Email" required />);
    const field = screen.getByRole('textbox') as HTMLInputElement;
    await userEvent.type(field, 'a@example.com');
    expect(field.value).toBe('a@example.com'); expect(field.required).toBe(true);
  });
});
describe('Notice and composition', () => {
  it('uses polite status for information', () => {
    render(<Notice>Saved</Notice>); expect(screen.getByRole('status').textContent).toBe('Saved');
  });
  it('uses alert semantics for urgent errors', () => {
    render(<Notice tone="error">Failed</Notice>); expect(screen.getByRole('alert').textContent).toBe('Failed');
  });
  it('composes components into a keyboard-submitted form', async () => {
    const request = vi.fn(); const user = userEvent.setup(); render(<AccessRequestForm onRequest={request} />);
    await user.tab(); await user.keyboard('a@example.com'); await user.tab(); await user.keyboard('{Enter}');
    expect(request).toHaveBeenCalledWith('a@example.com');
  });
  it('passes automated WCAG-tagged semantic checks for the composed form', async () => {
    const { container } = render(<><AccessRequestForm onRequest={() => {}} /><Notice>Ready</Notice></>);
    const result = await axe.run(container, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] },
      rules: { 'color-contrast': { enabled: false } },
    });
    expect(result.violations).toEqual([]);
  });
  it('passes semantic checks in validation-error states', async () => {
    const { container } = render(<><TextField label="Email" error="Enter your work email" required /><Notice tone="error">Request failed</Notice></>);
    const result = await axe.run(container, { rules: { 'color-contrast': { enabled: false }, region: { enabled: false } } });
    expect(result.violations).toEqual([]);
  });
});
