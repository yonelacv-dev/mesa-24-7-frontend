import { expect, type Page } from '@playwright/test'

import { E2E_PASSWORD } from './global-setup'

export const SLUG = 'la-terraza-azul'
export const OTHER_SLUG = 'cuatro-vientos'
export const HOST_USERNAME = 'terraza-azul'
export const HOST_PASSWORD = E2E_PASSWORD

/** Un teléfono peruano válido y único por prueba: "un teléfono, una entrada activa" no debe chocar entre pruebas. */
export function uniquePhone() {
  const digits = String(Date.now()).slice(-8) + String(Math.floor(Math.random() * 10))
  return `9${digits.slice(0, 8)}`
}

interface JoinOptions {
  slug?: string
  name?: string
  phone?: string
  partySize?: number
}

export async function joinQueue(
  page: Page,
  { slug = SLUG, name = 'Carla', phone = uniquePhone(), partySize = 2 }: JoinOptions = {},
) {
  await page.goto(`/venues/${slug}/diner`)
  // La página también muestra el formulario de "¿Ya tienes ticket?", que repite las mismas etiquetas
  // (Teléfono): hay que acotar al formulario de unirse, si no getByLabel resulta ambiguo.
  const submit = page.getByRole('button', { name: 'Unirme a la cola' })
  const joinForm = page.locator('form', { has: submit })
  await joinForm.getByLabel('Nombre').fill(name)
  await joinForm.getByLabel('Teléfono').fill(phone)
  for (let i = 2; i < partySize; i += 1) await joinForm.getByRole('button', { name: 'Una persona más' }).click()
  await submit.click()
  await expect(page.getByTestId('position')).toBeVisible()
  return { phone, name }
}

interface LoginOptions {
  slug?: string
  username?: string
  password?: string
}

export async function loginAsHost(
  page: Page,
  { slug = SLUG, username = HOST_USERNAME, password = HOST_PASSWORD }: LoginOptions = {},
) {
  await page.goto(`/venues/${slug}/host/login`)
  await page.getByLabel('Usuario').fill(username)
  await page.getByLabel('Contraseña').fill(password)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page).toHaveURL(new RegExp(`/venues/${slug}/host$`)) // sin nombre fijo: el local varía según `slug`
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
}

/** Fila de la tablet por el nombre del comensal (soporta que el nombre se repita en varias filas de prueba). */
export function rowFor(page: Page, name: string) {
  return page.locator('li', { has: page.getByText(name, { exact: true }) })
}

export async function assertNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)
  expect(overflow).toBe(false)
}
