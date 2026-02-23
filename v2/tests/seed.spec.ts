import { test, expect } from '@playwright/test';

/**
 * Seed test for AgentFlow Playwright Test Agents.
 * This test establishes the baseline environment for planner/generator/healer agents.
 *
 * Target: https://agentflow.frexida.com
 * Auth: Supabase (GitHub OAuth or Email/Password)
 */

test.describe('AgentFlow - Seed', () => {
  test('seed: landing page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/AgentFlow/);
    await expect(page.getByRole('heading', { name: /Design AI Agent Organizations/i })).toBeVisible();
  });

  test('seed: login page accessible', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('button', { name: /Sign In/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Continue with GitHub/i })).toBeVisible();
  });

  test('seed: demo editor accessible without login', async ({ page }) => {
    await page.goto('/editor/demo');
    // Demo mode banner should be visible
    await expect(page.getByText(/Demo mode/i)).toBeVisible();
    // Editor canvas should load with agents
    await expect(page.getByText(/6 agents/i)).toBeVisible();
  });

  test('seed: settings page requires auth', async ({ page }) => {
    await page.goto('/settings');
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });
});
