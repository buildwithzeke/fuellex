import { useState } from 'react'
import { BarChart3 } from 'lucide-react'
import Card from '../ui/Card'
import Field from '../ui/Field'
import Select from '../ui/Select'
import Button from '../ui/Button'
import SegmentedControl from '../ui/SegmentedControl'
import { FUEL_TYPES } from '../../lib/fuel'

const EMPTY = { stationId: '', fuelType: 'PMS', price: '', available: true }

/** .report form card from the mockup — station, fuel type, price, availability. */
export default function ReportForm({ stations = [], initialStationId, onSubmit, submitting, error }) {
  const [form, setForm] = useState({
    ...EMPTY,
    stationId: initialStationId || '',
  })
  const [touched, setTouched] = useState({})

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const stationOptions = stations.map((s) => ({
    value: s.id,
    label: `${s.name} — ${s.city}`,
  }))

  const priceNum = Number(form.price)
  const errors = {
    stationId: !form.stationId ? 'Choose a station' : '',
    price: form.price === '' || Number.isNaN(priceNum) || priceNum <= 0 ? 'Enter a valid price' : '',
  }

  const submit = (e) => {
    e.preventDefault()
    setTouched({ stationId: true, price: true })
    if (errors.stationId || errors.price) return
    onSubmit({ stationId: form.stationId, fuelType: form.fuelType, price: priceNum, available: form.available })
  }

  return (
    <Card className="mx-auto w-full max-w-[460px] p-6 shadow-lg sm:p-7">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-[12px] bg-primary-soft text-primary">
          <BarChart3 size={19} />
        </span>
        <div>
          <h1 className="text-lg font-extrabold tracking-tight text-text">Report Fuel Price</h1>
          <p className="text-[12.5px] text-text-2">Help other drivers — your report updates the map live.</p>
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-[10px] bg-danger-soft px-3.5 py-2.5 text-[13px] font-medium text-danger">
          {error}
        </p>
      )}

      <form onSubmit={submit} noValidate>
        <Select
          label="Station"
          options={stationOptions}
          placeholder="Choose a fuel station…"
          value={form.stationId}
          onChange={(e) => set('stationId', e.target.value)}
          error={touched.stationId ? errors.stationId : ''}
        />

        <div className="mb-4">
          <label className="mb-[7px] block text-[12.5px] font-bold text-text-2">Fuel Type</label>
          <SegmentedControl
            options={FUEL_TYPES.map((f) => ({ value: f.value, label: `${f.label} · ${f.full}` }))}
            value={form.fuelType}
            onChange={(value) => set('fuelType', value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Price per litre (₦)"
            type="number"
            inputMode="decimal"
            step="1"
            min="1"
            prefix="₦"
            placeholder="0"
            value={form.price}
            onChange={(e) => set('price', e.target.value)}
            error={touched.price ? errors.price : ''}
          />
          <div>
            <label className="mb-[7px] block text-[12.5px] font-bold text-text-2">Availability</label>
            <SegmentedControl
              activeTone={form.available ? 'success' : 'danger'}
              options={[
                { value: 'true', label: '● In stock' },
                { value: 'false', label: '✕ Out' },
              ]}
              value={String(form.available)}
              onChange={(value) => set('available', value === 'true')}
            />
          </div>
        </div>

        <Button type="submit" size="lg" block loading={submitting} className="mt-6">
          {submitting ? 'Submitting…' : 'Submit Report'}
        </Button>
        <p className="mt-3 text-center text-[11.5px] text-text-3">
          Reports are community-verified · 2 points earned
        </p>
      </form>
    </Card>
  )
}
