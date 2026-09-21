import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { useLogout } from '@/modules/auth'
import { hostClosedText, ScheduleDialog, toDraft, useVenueActions } from '@/modules/venues'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { LivePill } from '@/shared/components/LivePill'
import { Notice } from '@/shared/components/Notice'
import { PageState } from '@/shared/components/PageState'
import { messageFor } from '@/shared/constants/errors'
import { useNow } from '@/shared/hooks/useNow'
import { useOnline } from '@/shared/hooks/useOnline'
import { FinishedSummary } from '../../components/host/FinishedSummary'
import { QueueHeader } from '../../components/host/QueueHeader'
import { QueueList } from '../../components/host/QueueList'
import { confirmationFor } from '../../domain/entryStatus'
import { dayLabel } from '../../domain/hostQueue'
import { useHostActions } from '../../hooks/useHostActions'
import { useHostQueue } from '../../hooks/useHostQueue'

/** Pantalla 4: La cola (tablet). */
export default function QueuePage() {
  const { slug } = useParams()
  const { queue, isLoading, error, connection, feed, offsetMs } = useHostQueue(slug)
  const actions = useHostActions(slug)
  const { togglePause, updateSchedule } = useVenueActions(slug)
  const logout = useLogout()
  const now = useNow(1000)
  const online = useOnline()
  const [pendingConfirm, setPendingConfirm] = useState(null) // { action, row }
  const [scheduleOpen, setScheduleOpen] = useState(false)

  if (isLoading) return <PageState title="Cargando la cola…" />
  if (!queue) return <PageState title="No pudimos cargar la cola" text={messageFor(error)} />

  const { venue } = queue
  const offline = !online || connection === 'offline' || connection === 'failed'
  const closedText = hostClosedText(venue.list_status, queue.rows.length)

  const onAction = (action, row) => {
    if (confirmationFor(action, row)) setPendingConfirm({ action, row })
    else actions.run(row.id, action)
  }
  const confirm = pendingConfirm && confirmationFor(pendingConfirm.action, pendingConfirm.row)

  return (
    <div className="mx-auto min-h-dvh w-full max-w-5xl bg-background">
      <QueueHeader
        venueName={venue.name}
        dayLabel={dayLabel(queue.server_time, venue.timezone)}
        waiting={queue.waiting}
        called={queue.called}
        listStatus={venue.list_status}
        paused={venue.paused}
        offline={offline}
        pausePending={togglePause.isPending}
        onTogglePause={() => togglePause.mutate(!venue.paused)}
        onOpenSchedule={() => setScheduleOpen(true)}
        onLogout={() => logout.mutate()}
      />

      <main className="flex flex-col gap-4 p-4 sm:p-5">
        {closedText && <p className="text-sm font-semibold text-muted-foreground">{closedText}</p>}
        {feed && <Notice key={feed.id}>{feed.text}</Notice>}
        {actions.error && <Notice tone="destructive">{messageFor(actions.error)}</Notice>}

        <QueueList
          rows={queue.rows}
          holdMinutes={venue.hold_minutes}
          offsetMs={offsetMs}
          now={now}
          offline={offline}
          busyEntryId={actions.pendingEntryId}
          onAction={onAction}
        />

        <FinishedSummary seated={queue.finished.seated} left={queue.finished.left} noShow={queue.finished.no_show} />
        <div className="flex justify-center">
          <LivePill status={offline ? 'offline' : connection} />
        </div>
      </main>

      <ConfirmDialog
        open={!!pendingConfirm}
        onOpenChange={(open) => !open && setPendingConfirm(null)}
        title={confirm?.title ?? ''}
        description={confirm?.description ?? ''}
        confirmLabel={confirm?.confirmLabel ?? ''}
        pending={actions.pendingEntryId !== null}
        onConfirm={() => {
          actions.run(pendingConfirm.row.id, pendingConfirm.action)
          setPendingConfirm(null)
        }}
      />

      <ScheduleDialog
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        days={toDraft(venue.schedule)}
        timezoneLabel={venue.timezone}
        pending={updateSchedule.isPending}
        errorMessage={updateSchedule.error ? messageFor(updateSchedule.error) : null}
        onSave={(body) => updateSchedule.mutate(body, { onSuccess: () => setScheduleOpen(false) })}
      />
    </div>
  )
}
