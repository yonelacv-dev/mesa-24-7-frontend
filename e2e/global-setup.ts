/**
 * Recrea una base de datos propia para los e2e (`waiting_list_e2e`, nunca `waiting_list`), aplica las
 * migraciones y siembra los locales con una contraseña fija. Corre una sola vez antes de toda la suite.
 *
 * Los locales quedan abiertos las 24 horas: los e2e corren con el reloj real del servidor y no pueden
 * controlarlo, así que la ventana del horario no debe interferir con las pruebas.
 */
import { execFileSync } from 'node:child_process'
import path from 'node:path'

export const E2E_DB = 'waiting_list_e2e'
export const E2E_PASSWORD = 'e2e-password'
// Backend y frontend son repos separados: por defecto se asume una carpeta hermana llamada "backend"
// (como en este checkout). Si el tuyo se llama distinto o está en otro lado, pon BACKEND_DIR=/ruta.
export const BACKEND_DIR = process.env.BACKEND_DIR
  ? path.resolve(process.env.BACKEND_DIR)
  : path.resolve(import.meta.dirname, '../../backend')

const baseEnv = { ...process.env, MYSQL_DATABASE: E2E_DB }

function run(command: string, args: string[], env: NodeJS.ProcessEnv = baseEnv) {
  execFileSync(command, args, { cwd: BACKEND_DIR, env, stdio: 'inherit' })
}

export default async function globalSetup() {
  run('mysql', ['-uroot', '-e', `DROP DATABASE IF EXISTS ${E2E_DB}`])
  run('mysql', ['-uroot', '-e', `CREATE DATABASE ${E2E_DB} CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci`])
  run('poetry', ['run', 'alembic', 'upgrade', 'head'])
  run('poetry', ['run', 'python', '-m', 'app.seed'], { ...baseEnv, SEED_PASSWORD: E2E_PASSWORD })
  run('mysql', [
    '-uroot',
    E2E_DB,
    '-e',
    "UPDATE venue_schedule SET is_open = 1, start_time = '00:00:00', end_time = '23:59:00'",
  ])
}
