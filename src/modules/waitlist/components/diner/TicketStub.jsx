/** Ticket con muescas, como el talón que te dan en la puerta. */
export function TicketStub({ ticket }) {
  return (
    <div className="relative shrink-0 rounded-xl bg-white px-4 py-2 text-center text-[#181818] shadow-md">
      <span className="absolute top-1/2 -left-1.5 size-3 -translate-y-1/2 rounded-full bg-ink" />
      <span className="absolute top-1/2 -right-1.5 size-3 -translate-y-1/2 rounded-full bg-ink" />
      <p className="text-xs font-bold text-neutral-500">Ticket</p>
      <p className="text-3xl leading-none font-extrabold tabular-nums">#{ticket}</p>
    </div>
  )
}
