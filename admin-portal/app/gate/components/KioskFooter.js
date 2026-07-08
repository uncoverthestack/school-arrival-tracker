export function KioskFooter({ count, note, arrivals }) {
  return (
    <footer className="border-t border-outline-variant">
      <div className="flex items-center justify-between px-10 py-6">
        <p className="flex items-center gap-1">
          <span className="text-title-medium font-medium tracking-[0.15px] text-on-surface">{count}</span>
          <span className="text-body-large tracking-[0.5px] text-on-surface-variant">checked in today</span>
        </p>
        <p className="text-label-large font-medium tracking-[0.1px] text-on-surface-variant">{note}</p>
      </div>

      <div className="px-10 pb-8">
        <h2 className="text-label-medium tracking-[0.4px] uppercase text-on-surface-variant mb-3">
          Today&apos;s log
        </h2>

        {arrivals.length === 0 ? (
          <p className="text-body-medium tracking-[0.25px] text-on-surface-variant text-center py-6">
            No scans yet this session
          </p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {arrivals.map((a, i) => (
              <div key={i} className="flex items-center justify-between bg-surface-container rounded-md px-4 py-3">
                <div className="flex items-center gap-3">
                  {a.photoUrl ? (
                    <img src={a.photoUrl} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-lg font-bold text-on-surface-variant shrink-0">
                      {a.name?.[0]}
                    </div>
                  )}
                  <div>
                    <p className="text-label-large font-medium text-on-surface">{a.name}</p>
                    <p className="text-body-small tracking-[0.4px] text-on-surface-variant">
                      {a.studentClass}{a.studentId ? ` · ${a.studentId}` : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`text-label-small font-bold tracking-[0.5px] px-2 py-0.5 rounded-full ${
                      a.type === 'arrival'
                        ? 'bg-success-container text-on-success-container'
                        : 'bg-tertiary-container text-on-tertiary-container'
                    }`}
                  >
                    {a.type === 'arrival' ? '↓ In' : '↑ Out'}
                  </span>
                  <p className="text-body-small text-on-surface-variant mt-1">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </footer>
  )
}
