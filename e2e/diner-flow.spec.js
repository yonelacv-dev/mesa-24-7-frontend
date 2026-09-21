import { expect, test } from '@playwright/test'

import { assertNoHorizontalScroll, joinQueue, loginAsHost, OTHER_SLUG, rowFor, SLUG, uniquePhone } from './helpers'

test.describe('flujo del comensal', () => {
  test('unirse, ser llamado, sentarse: puesto y turno se actualizan solos', async ({ page, browser }) => {
    const host = await browser.newContext()
    const hostPage = await host.newPage()
    await loginAsHost(hostPage)

    // Otras pruebas corren a la vez sobre el mismo local: no se asume ser el puesto 1, solo que hay un puesto.
    const { name } = await joinQueue(page, { name: `Carla ${Date.now()}` })
    await assertNoHorizontalScroll(page)

    // La tablet ve la fila al instante, sin recargar.
    const row = rowFor(hostPage, name)
    await expect(row).toBeVisible()
    await expect(row.getByText('Esperando')).toBeVisible()

    await row.getByRole('button', { name: 'Llamar' }).click()

    // El comensal ve el cambio solo, por SSE, sin recargar la página.
    await expect(page.getByRole('heading', { name: 'Tu mesa está lista' })).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(/Tiempo para llegar/)).toBeVisible()

    await expect(row.getByText('Llamado ahora')).toBeVisible()
    await row.getByRole('button', { name: 'Sentar' }).click()
    await expect(row).toHaveCount(0) // ya no está activa: sale de la lista visible

    await expect(page.getByRole('heading', { name: 'Buen provecho' })).toBeVisible({ timeout: 10_000 })
    await host.close()
  })

  test('"Voy en camino" avisa a la tablet sin cambiar el estado ni el plazo', async ({ page, browser }) => {
    const host = await browser.newContext()
    const hostPage = await host.newPage()
    await loginAsHost(hostPage)

    const { name } = await joinQueue(page, { name: `Jorge ${Date.now()}` })
    const row = rowFor(hostPage, name)
    await row.getByRole('button', { name: 'Llamar' }).click()
    await expect(page.getByRole('heading', { name: 'Tu mesa está lista' })).toBeVisible({ timeout: 10_000 })

    await page.getByRole('button', { name: 'Voy en camino' }).click()
    await expect(page.getByText('Avisaste al anfitrión que vas en camino.')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Voy en camino' })).toBeDisabled()

    await expect(row.getByText('En camino')).toBeVisible({ timeout: 10_000 })
    await expect(row).toBeVisible() // sigue en la cola: es solo un aviso
    await host.close()
  })

  test('"Ya no voy" cancela con confirmación y permite volver a unirse', async ({ page }) => {
    await joinQueue(page, { name: `Andrés ${Date.now()}` })

    await page.getByRole('button', { name: 'Ya no voy' }).click()
    await expect(page.getByRole('heading', { name: '¿Salir de la lista?' })).toBeVisible()
    await page.getByRole('button', { name: 'Seguir esperando' }).click()
    await expect(page.getByRole('heading', { name: '¿Salir de la lista?' })).not.toBeVisible()

    await page.getByRole('button', { name: 'Ya no voy' }).click()
    await page.getByRole('button', { name: 'Salir de la lista' }).click()

    await expect(page.getByRole('heading', { name: 'Saliste de la lista' })).toBeVisible()
    await page.getByRole('button', { name: 'Volver a unirme' }).click()
    await expect(page).toHaveURL(new RegExp(`/venues/${SLUG}/diner$`))
  })

  test('el formulario valida nombre y teléfono antes de enviar', async ({ page }) => {
    await page.goto(`/venues/${SLUG}/diner`)
    await page.getByRole('button', { name: 'Unirme a la cola' }).click()

    await expect(page.getByText('Escribe tu nombre para que el anfitrión te encuentre.')).toBeVisible()
    await expect(page.getByText('Ingresa un celular de 9 dígitos, por ejemplo 987 654 321.')).toBeVisible()
  })

  test('el mismo teléfono desde otro dispositivo recupera la misma entrada, no crea una segunda', async ({
    page,
    browser,
  }) => {
    const phone = uniquePhone()
    await joinQueue(page, { name: 'Primer dispositivo', phone })
    const firstTicket = await page.locator('text=/^#\\d+$/').textContent()

    const otherDevice = await browser.newContext()
    const otherPage = await otherDevice.newPage()
    await joinQueue(otherPage, { name: 'Segundo dispositivo', phone })

    await expect(otherPage.getByText('Ya estabas en la cola con este teléfono. Te llevamos a tu turno.')).toBeVisible()
    const secondTicket = await otherPage.locator('text=/^#\\d+$/').textContent()
    expect(secondTicket).toBe(firstTicket)
    await otherDevice.close()
  })

  test('recuperar el turno con ticket y teléfono cuando se pierde la sesión del celular', async ({ page }) => {
    const phone = uniquePhone()
    await joinQueue(page, { name: `Lucía ${Date.now()}`, phone })
    const ticketText = await page.locator('text=/^#\\d+$/').textContent()
    const ticket = ticketText.replace('#', '')

    await page.evaluate(() => window.localStorage.clear())
    await page.goto(`/venues/${SLUG}/diner`)
    await expect(page.getByRole('heading', { name: '¿Ya tienes ticket?' })).toBeVisible()

    const lookupForm = page.getByRole('form', { name: 'Buscar ticket' })
    await lookupForm.getByLabel('Ticket').fill(ticket)
    await lookupForm.getByLabel('Teléfono').fill(phone)
    await lookupForm.getByRole('button', { name: 'Buscar mi ticket' }).click()

    await expect(page).toHaveURL(/\/diner\/turn\//)
    await expect(page.getByText(`#${ticket}`)).toBeVisible()
  })

  test('un ticket o teléfono equivocado no dice cuál de los dos falló', async ({ page }) => {
    await page.goto(`/venues/${SLUG}/diner`)
    const lookupForm = page.getByRole('form', { name: 'Buscar ticket' })
    await lookupForm.getByLabel('Ticket').fill('999999')
    await lookupForm.getByLabel('Teléfono').fill(uniquePhone())
    await lookupForm.getByRole('button', { name: 'Buscar mi ticket' }).click()

    await expect(
      page.getByText('No encontramos un ticket con esos datos. Revisa el número y el teléfono.'),
    ).toBeVisible()
  })

  test('un mismo teléfono puede esperar en dos locales distintos a la vez', async ({ page, browser }) => {
    const phone = uniquePhone()
    await joinQueue(page, { slug: SLUG, phone, name: 'Multi local' })

    const otherContext = await browser.newContext()
    const otherPage = await otherContext.newPage()
    await joinQueue(otherPage, { slug: OTHER_SLUG, phone, name: 'Multi local' })

    await expect(otherPage.getByText('Ya estabas en la cola con este teléfono')).not.toBeVisible()
    await otherContext.close()
  })
})
