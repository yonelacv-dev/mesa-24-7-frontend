import { expect, test, type Page } from '@playwright/test'

import { assertNoHorizontalScroll, joinQueue, loginAsHost, rowFor, SLUG, uniquePhone } from './helpers'

const MIN_TOUCH_TARGET = 44

/** Todo botón visible debe medir al menos 44px de alto: se toca con el dedo, no con un cursor. */
async function assertTouchTargets(page: Page) {
  const heights = await page.locator('button:visible').evaluateAll((buttons) =>
    buttons.map((button) => button.getBoundingClientRect().height),
  )
  for (const height of heights) expect(height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET - 1) // -1: redondeo de subpíxeles
}

test.describe('responsive: no sabemos el tamaño real del dispositivo', () => {
  test('pantalla 1, Unirse: sin scroll horizontal y botones táctiles', async ({ page }) => {
    await page.goto(`/venues/${SLUG}/diner`)
    await expect(page.getByRole('button', { name: 'Unirme a la cola' })).toBeVisible()
    await assertNoHorizontalScroll(page)
    await assertTouchTargets(page)
  })

  test('pantalla 2, Tu turno: cada estado sin desbordar', async ({ page, browser }) => {
    const host = await browser.newContext()
    const hostPage = await host.newPage()
    await loginAsHost(hostPage)

    const { name } = await joinQueue(page, { name: `Responsive ${Date.now()}` })
    await assertNoHorizontalScroll(page)
    await assertTouchTargets(page)

    // Nombre exacto, no una subcadena: otros proyectos corren en paralelo sobre el mismo local.
    const row = rowFor(hostPage, name)
    await row.getByRole('button', { name: 'Llamar' }).click()
    await expect(page.getByRole('heading', { name: 'Tu mesa está lista' })).toBeVisible({ timeout: 10_000 })
    await assertNoHorizontalScroll(page)
    await assertTouchTargets(page)

    await host.close()
  })

  test('pantalla 4, la cola: filas y cabecera sin desbordar con varios comensales', async ({ page }) => {
    // Las filas de relleno se crean por API, no abriendo pestañas: varias pestañas de comensal en el mismo
    // contexto agotan las conexiones HTTP del navegador con sus streams SSE, dejando la siguiente en blanco.
    // Lo que importa aquí es el layout de la tablet con varias filas, no repetir el flujo de unirse.
    for (let i = 0; i < 2; i += 1) {
      const response = await page.request.post(`/api/v1/venues/${SLUG}/diner/join`, {
        data: { name: `Fila ancha ${i} ${Date.now()}`, phone: uniquePhone(), party_size: 2, consent: true },
      })
      expect(response.ok()).toBe(true)
    }

    await loginAsHost(page)
    await expect(page.locator('li').first()).toBeVisible()
    await assertNoHorizontalScroll(page)
    await assertTouchTargets(page)
  })
})
