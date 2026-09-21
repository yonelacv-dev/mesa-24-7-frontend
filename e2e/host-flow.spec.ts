import { expect, test } from '@playwright/test'

import { HOST_USERNAME, joinQueue, loginAsHost, rowFor, SLUG } from './helpers'

test.describe('acceso del anfitrión', () => {
  test('usuario o contraseña incorrectos no dejan entrar', async ({ page }) => {
    await page.goto(`/venues/${SLUG}/host/login`)
    await page.getByLabel('Usuario').fill(HOST_USERNAME)
    await page.getByLabel('Contraseña').fill('una-clave-que-no-es')
    await page.getByRole('button', { name: 'Entrar' }).click()

    await expect(page.getByText('Usuario o contraseña incorrectos.')).toBeVisible()
    await expect(page).toHaveURL(new RegExp(`/host/login$`))
  })

  test('entra, ve la cola y puede cerrar sesión', async ({ page }) => {
    await loginAsHost(page)
    await expect(page.getByRole('heading', { name: 'La Terraza Azul' })).toBeVisible()

    await page.getByRole('button', { name: 'Cerrar sesión' }).click()
    await page.goto(`/venues/${SLUG}/host`)
    await expect(page).toHaveURL(new RegExp(`/host/login$`)) // sin sesión, la guarda redirige al login
  })

  test('sin iniciar sesión, la tablet redirige al login', async ({ page }) => {
    await page.goto(`/venues/${SLUG}/host`)
    await expect(page).toHaveURL(new RegExp(`/host/login$`))
  })
})

test.describe('acciones sobre una fila', () => {
  test('"Quitar" pide confirmación y cierra el ticket del comensal', async ({ browser }) => {
    const host = await browser.newContext()
    const hostPage = await host.newPage()
    await loginAsHost(hostPage)

    const diner = await browser.newContext()
    const dinerPage = await diner.newPage()
    const { name } = await joinQueue(dinerPage, { name: `Quitar ${Date.now()}` })

    const row = rowFor(hostPage, name)
    const dialog = hostPage.getByRole('dialog')

    await row.getByRole('button', { name: 'Quitar' }).click()
    await expect(dialog.getByRole('heading', { name: '¿Quitar de la lista?' })).toBeVisible()
    await expect(dialog.getByText(`saldrá de la lista y su ticket`)).toBeVisible()
    await dialog.getByRole('button', { name: 'Cancelar' }).click()
    await expect(row).toBeVisible() // cancelar la confirmación no la quita

    await row.getByRole('button', { name: 'Quitar' }).click()
    await dialog.getByRole('button', { name: 'Quitar', exact: true }).click()
    await expect(row).toHaveCount(0)

    await expect(dinerPage.getByRole('heading', { name: 'El anfitrión te sacó de la lista' })).toBeVisible({
      timeout: 10_000,
    })
    await host.close()
    await diner.close()
  })

  test('"No vino" solo aplica a quien ya fue llamado, y pide confirmación', async ({ browser }) => {
    const host = await browser.newContext()
    const hostPage = await host.newPage()
    await loginAsHost(hostPage)

    const diner = await browser.newContext()
    const dinerPage = await diner.newPage()
    const { name } = await joinQueue(dinerPage, { name: `NoVino ${Date.now()}` })

    const row = rowFor(hostPage, name)
    await expect(row.getByRole('button', { name: 'No vino' })).not.toBeVisible() // esperando: no está la acción

    await row.getByRole('button', { name: 'Llamar' }).click()
    await row.getByRole('button', { name: 'No vino' }).click()
    await expect(hostPage.getByRole('heading', { name: '¿Marcar como no vino?' })).toBeVisible()
    await hostPage.getByRole('button', { name: 'Marcar no vino' }).click()

    await expect(row).toHaveCount(0)
    await expect(dinerPage.getByRole('heading', { name: 'Tu turno venció' })).toBeVisible({ timeout: 10_000 })
    await host.close()
    await diner.close()
  })

  test('repetir "Llamar" no duplica el efecto', async ({ browser }) => {
    const host = await browser.newContext()
    const hostPage = await host.newPage()
    await loginAsHost(hostPage)

    const diner = await browser.newContext()
    const dinerPage = await diner.newPage()
    const { name } = await joinQueue(dinerPage, { name: `Repetido ${Date.now()}` })

    const row = rowFor(hostPage, name)
    await row.getByRole('button', { name: 'Llamar' }).click()
    await expect(row.getByText('Llamado ahora')).toBeVisible()
    await row.getByRole('button', { name: 'Sentar' }).click() // ya no está "llamado": no debería poder llamarse otra vez
    await expect(row).toHaveCount(0)

    await host.close()
    await diner.close()
  })
})

// Pausa y horario cambian el estado de TODO el local: se corren una sola vez (no por cada ancho de pantalla)
// y sobre un local que ningún otro spec toca, para no chocar con las pruebas que se unen a la cola en paralelo.
const SCHEDULE_SLUG = 'casa-mediterranea'
const SCHEDULE_USERNAME = 'casa-mediterranea'

test.describe('pausa y horario del local', () => {
  test.describe.configure({ mode: 'serial' })

  test('pausar cierra la lista a comensales nuevos; reanudar la vuelve a abrir', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'la regla no depende del ancho de pantalla: basta una vez')

    await loginAsHost(page, { slug: SCHEDULE_SLUG, username: SCHEDULE_USERNAME })
    await expect(page.getByText('Abierta hasta las')).toBeVisible()

    await page.getByRole('button', { name: 'Pausar' }).click()
    await expect(page.getByText('En pausa')).toBeVisible()

    const dinerPage = await page.context().newPage()
    await dinerPage.goto(`/venues/${SCHEDULE_SLUG}/diner`)
    await expect(dinerPage.getByText('La lista está en pausa')).toBeVisible()
    await expect(dinerPage.getByRole('button', { name: 'Unirme a la cola' })).not.toBeVisible()
    await dinerPage.close()

    await page.getByRole('button', { name: 'Reanudar' }).click()
    await expect(page.getByText('Abierta hasta las')).toBeVisible()
  })

  test('el horario no admite la misma hora de inicio y de cierre', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'la regla no depende del ancho de pantalla: basta una vez')

    await loginAsHost(page, { slug: SCHEDULE_SLUG, username: SCHEDULE_USERNAME })
    await page.getByRole('button', { name: 'Horario' }).click()
    await expect(page.getByRole('heading', { name: 'Horario de la lista de espera' })).toBeVisible()

    await page.getByLabel('Inicio del lunes').fill('11:00')
    await page.getByLabel('Cierre del lunes').fill('11:00')
    await expect(page.getByText('La hora de inicio y la de cierre no pueden ser iguales.')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Guardar horario' })).toBeDisabled()

    await page.getByLabel('Cierre del lunes').fill('23:00')
    await expect(page.getByRole('button', { name: 'Guardar horario' })).toBeEnabled()
    await page.getByRole('button', { name: 'Cancelar' }).click()
    await expect(page.getByRole('heading', { name: 'Horario de la lista de espera' })).not.toBeVisible()
  })

  test('guardar el horario lo refleja de inmediato en la cabecera', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'la regla no depende del ancho de pantalla: basta una vez')

    await loginAsHost(page, { slug: SCHEDULE_SLUG, username: SCHEDULE_USERNAME })
    await page.getByRole('button', { name: 'Horario' }).click()

    for (const day of ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']) {
      await page.getByLabel(`Inicio del ${day}`).fill('00:00')
      await page.getByLabel(`Cierre del ${day}`).fill('23:59')
    }
    await page.getByRole('button', { name: 'Guardar horario' }).click()
    await expect(page.getByRole('heading', { name: 'Horario de la lista de espera' })).not.toBeVisible()
    await expect(page.getByText('Abierta hasta las 23:59')).toBeVisible()
  })
})
