export const action = (page, name, flavor) => page.locator(`[data-action="${name}"]${flavor ? `[data-flavor="${flavor}"]` : ''}`);
export const settle = (page) => page.waitForTimeout(720);
export const ready = (page) => page.waitForFunction(() => document.querySelector('#bakery').getAttribute('aria-busy') === 'false');
export const requests = (page) => page.locator('#ticket .request').evaluateAll((rows) => rows.map(({ dataset }) => ({ flavor: dataset.flavor, numerator: Number(dataset.numerator), denominator: Number(dataset.denominator) })));
export async function amount(page, flavor) {
  return page.locator(`.tray-group[data-flavor="${flavor}"] .tray-title strong`).evaluate(({ dataset }) => [Number(dataset.numerator), Number(dataset.denominator)]);
}
export async function cut(page, flavor, count) {
  await action(page, 'flavor', flavor).click();
  await page.locator('#piece-count').fill(String(count));
  await action(page, 'cut').click(); await ready(page); await settle(page);
}
export async function take(page, count, start = 0) {
  for (let i = start; i < start + count; i++) await page.locator(`[data-action="take"][data-id="${i}"]`).click();
  await settle(page);
}
export async function whole(page, count = 1) {
  for (let i = 0; i < count; i++) { await action(page, 'whole').click(); await settle(page); }
}
export async function fulfill(page, equivalent = true) {
  for (const { flavor, numerator, denominator } of await requests(page)) {
    await action(page, 'flavor', flavor).click(); await settle(page);
    await whole(page, Math.floor(numerator / denominator));
    const remainder = numerator % denominator;
    if (!remainder) continue;
    const multiplier = equivalent && denominator * 2 <= 12 ? 2 : 1;
    await cut(page, flavor, denominator * multiplier);
    await take(page, remainder * multiplier);
  }
}
