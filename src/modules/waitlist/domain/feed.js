import { partyText } from './position'

/** Nombres como "Jorge P." ya traen su punto: no se duplica. */
const endSentence = (text) => (text.endsWith('.') ? text : `${text}.`)

/**
 * Aviso en vivo de la tablet a partir de un mensaje `feed` del back.
 * Solo estos cuatro se muestran; el resto (sentar, quitar, pausa...) los provoca quien mira la pantalla.
 */
export function feedMessage(feed) {
  switch (feed.kind) {
    case 'joined':
      return `${feed.name} se unió: ticket #${feed.ticket}, ${partyText(feed.party_size)}.`
    case 'called':
      return `Llamaste a ${endSentence(feed.name)} Márcale al ${feed.phone_display}.`
    case 'on_the_way':
      return `${feed.name} va en camino (ticket #${feed.ticket}).`
    case 'cancelled':
      return `${feed.name} salió de la lista (ticket #${feed.ticket}).`
    default:
      return null
  }
}
