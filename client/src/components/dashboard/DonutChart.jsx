import Card from '../ui/Card'

/** Donut chart from the mockup — in-stock vs out-of-stock ratio via conic-gradient. */
export default function DonutChart({ title, inStockPercent, inStockLabel = 'in stock', outLabel = 'out of fuel' }) {
  const pct = Math.round(inStockPercent)
  return (
    <Card className="p-[18px]">
      <h3 className="mb-4 text-sm font-extrabold text-text">{title}</h3>
      <div className="flex items-center gap-4">
        <div
          className="grid h-[88px] w-[88px] shrink-0 place-items-center rounded-full"
          style={{ background: `conic-gradient(var(--color-success) 0 ${pct}%, var(--color-danger) ${pct}% 100%)` }}
        >
          <div className="grid h-[60px] w-[60px] place-items-center rounded-full bg-surface text-[15px] font-extrabold text-text">
            {pct}%
          </div>
        </div>
        <div className="text-[12.5px] leading-7 text-text-2">
          <p className="font-bold text-success">● {pct}% {inStockLabel}</p>
          <p className="font-bold text-danger">● {100 - pct}% {outLabel}</p>
        </div>
      </div>
    </Card>
  )
}
