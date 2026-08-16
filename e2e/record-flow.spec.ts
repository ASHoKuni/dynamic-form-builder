import { expect, test } from '@playwright/test';

test.describe('record creation flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
      localStorage.setItem(
        'dfb.schema',
        JSON.stringify([
          { id: 'f_1', key: 'first_name', type: 'text', title: 'First Name', required: true },
          { id: 'f_2', key: 'last_name', type: 'text', title: 'Last Name', required: true },
          { id: 'f_3', key: 'email', type: 'email', title: 'Email', required: true },
        ])
      );
      localStorage.setItem('dfb.records', JSON.stringify([]));
    });
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
