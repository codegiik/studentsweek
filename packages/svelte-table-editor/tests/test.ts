import { test, expect } from '@playwright/test';

test('check if paging works', async ({ page }) => {
	await page.goto('/');

	await page.getByRole('button', { name: '+' }).click();
	const first_input = page.getByRole('textbox').nth(1);
	await expect(first_input).toHaveValue('test3');
	const first_select = page.getByRole('combobox').nth(1);
	await first_select.selectOption('b');
	await page.getByRole('button', { name: '-' }).click();
	await page.getByRole('button', { name: '+' }).click();
	await expect(first_select).toHaveValue('b');
});
