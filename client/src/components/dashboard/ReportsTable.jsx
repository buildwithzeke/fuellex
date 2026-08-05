import Tag from '../ui/Tag'
import { AVAILABILITY, fuelLabel } from '../../lib/fuel'
import { formatNaira, timeAgo, formatTime, cx } from '../../lib/format'

/** .table-wrap from the mockup — recent community reports. */
export default function ReportsTable({ reports, className }) {
  if (!reports.length) {
    return (
      <div className="rounded-[16px] border border-border bg-surface p-8 text-center text-sm text-text-2 shadow-sm">
        No reports yet — be the first to report a price.
      </div>
    )
  }

  return (
    <div className={cx('overflow-hidden rounded-[16px] border border-border bg-surface shadow-sm', className)}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-bg text-left text-[11.5px] tracking-wider text-text-3 uppercase">
              <th className="px-4 py-3.5 sm:px-[18px]">Station</th>
              <th className="px-4 py-3.5">Fuel</th>
              <th className="px-4 py-3.5">Price</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="hidden px-4 py-3.5 sm:table-cell">Time</th>
              <th className="hidden px-4 py-3.5 sm:table-cell">Reported by</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => {
              const availability = AVAILABILITY[report.available]
              return (
                <tr key={report.id} className="border-t border-border">
                  <td className="px-4 py-3.5 sm:px-[18px]">
                    <div className="font-semibold text-text">{report.station?.name || '—'}</div>
                    <div className="text-xs text-text-3">{report.station?.city}</div>
                  </td>
                  <td className="px-4 py-3.5 text-text">{fuelLabel(report.fuelType)}</td>
                  <td className="px-4 py-3.5 font-bold text-text">{formatNaira(report.price)}</td>
                  <td className="px-4 py-3.5">
                    {availability && (
                      <Tag tone={report.available ? 'avail' : 'oos'} dot className="px-2 py-0.5 text-[10.5px]">
                        {availability.label}
                      </Tag>
                    )}
                  </td>
                  <td className="hidden px-4 py-3.5 text-text-2 sm:table-cell">
                    {timeAgo(report.createdAt)}
                  </td>
                  <td className="hidden px-4 py-3.5 text-text-2 sm:table-cell">
                    <div className="font-medium text-text">{report.user?.name || '—'}</div>
                    <div className="text-xs text-text-3">{formatTime(report.createdAt)}</div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
