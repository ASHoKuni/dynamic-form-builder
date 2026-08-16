import { expect, test } from '@playwright/test';

test.describe('record creation flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
  });

  test('creates a new employee record and shows it in grid', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Employees' }).click();
    await page.getByRole('button', { name: '+ Add' }).click();

    await expect(page.getByRole('heading', { name: 'Create New Employee' })).toBeVisible();

    await page.getByLabel('First Name*').fill('John');
    await page.getByLabel('Last Name*').fill('Doe');
    await page.getByLabel('Email*').fill('john@example.com');

    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByRole('heading', { name: 'Create New Employee' })).toBeHidden();
    await expect(page.getByRole('cell', { name: 'John', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Doe', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'john@example.com', exact: true })).toBeVisible();
  });
});
