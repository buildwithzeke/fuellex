import { useState } from 'react'
import { LocateFixed } from 'lucide-react'
import Field from '../ui/Field'
import Button from '../ui/Button'
import { resolveLocation } from '../../lib/geo'

const EMPTY = { name: '', brand: '', address: '', city: '', state: 'Lagos' }

/** Form to add a community-listed fuel station — coords default to the user's location. */
export default function AddStationForm({ initialLocation, onSubmit, submitting, error, onCancel }) {
  const [form, setForm] = useState(EMPTY)
  const [coords, setCoords] = useState({
    lat: initialLocation?.lat ?? '',
    lng: initialLocation?.lng ?? '',
  })
  const [locating, setLocating] = useState(false)
  const [touched, setTouched] = useState({})

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const lat = Number(coords.lat)
  const lng = Number(coords.lng)

  const errors = {
    name: form.name.trim() ? '' : 'Station name is required',
    address: form.address.trim() ? '' : 'Address is required',
    city: form.city.trim() ? '' : 'City is required',
    state: form.state.trim() ? '' : 'State is required',
    lat:
      coords.lat === '' || Number.isNaN(lat) || lat < -90 || lat > 90
        ? 'Latitude must be between -90 and 90'
        : '',
    lng:
      coords.lng === '' || Number.isNaN(lng) || lng < -180 || lng > 180
        ? 'Longitude must be between -180 and 180'
        : '',
  }

  const hasErrors = Object.values(errors).some(Boolean)

  const useMyLocation = async () => {
    setLocating(true)
    try {
      const loc = await resolveLocation()
      setCoords({ lat: loc.lat, lng: loc.lng })
    } finally {
      setLocating(false)
    }
  }

  const submit = (e) => {
    e.preventDefault()
    setTouched({ name: true, address: true, city: true, state: true, lat: true, lng: true })
    if (hasErrors) return
    onSubmit({
      name: form.name.trim(),
      brand: form.brand.trim() || undefined,
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      latitude: lat,
      longitude: lng,
    })
  }

  return (
    <form onSubmit={submit} noValidate>
      {error && (
        <p className="mb-4 rounded-[10px] bg-danger-soft px-3.5 py-2.5 text-[13px] font-medium text-danger">
          {error}
        </p>
      )}

      <Field
        label="Station name"
        placeholder="e.g. TotalEnergies Lekki"
        value={form.name}
        onChange={(e) => set('name', e.target.value)}
        error={touched.name ? errors.name : ''}
        required
      />
      <Field
        label="Brand (optional)"
        placeholder="e.g. NNPC, MRS, Conoil"
        value={form.brand}
        onChange={(e) => set('brand', e.target.value)}
      />

      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <Field
          label="City"
          placeholder="e.g. Lekki"
          value={form.city}
          onChange={(e) => set('city', e.target.value)}
          error={touched.city ? errors.city : ''}
          required
        />
        <Field
          label="State"
          value={form.state}
          onChange={(e) => set('state', e.target.value)}
          error={touched.state ? errors.state : ''}
          required
        />
      </div>
      <Field
        label="Address"
        placeholder="Street, landmark…"
        value={form.address}
        onChange={(e) => set('address', e.target.value)}
        error={touched.address ? errors.address : ''}
        required
      />

      <div className="mb-4">
        <div className="mb-[7px] flex items-center justify-between">
          <span className="text-[12.5px] font-bold text-text-2">Location on map</span>
          <button
            type="button"
            onClick={useMyLocation}
            disabled={locating}
            className="inline-flex cursor-pointer items-center gap-1.5 border-none bg-transparent text-[12.5px] font-semibold text-primary disabled:opacity-60"
          >
            <LocateFixed size={13} className={locating ? 'animate-spin' : ''} />
            {locating ? 'Locating…' : 'Use my location'}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Latitude"
            type="number"
            step="any"
            placeholder="6.5244"
            value={coords.lat}
            onChange={(e) => setCoords((c) => ({ ...c, lat: e.target.value }))}
            error={touched.lat ? errors.lat : ''}
            required
          />
          <Field
            label="Longitude"
            type="number"
            step="any"
            placeholder="3.3792"
            value={coords.lng}
            onChange={(e) => setCoords((c) => ({ ...c, lng: e.target.value }))}
            error={touched.lng ? errors.lng : ''}
            required
          />
        </div>
        <p className="mt-1 text-[11.5px] text-text-3">
          New stations start as community-listed and appear on the map right away.
        </p>
      </div>

      <Button type="submit" size="lg" block loading={submitting} className="mt-1">
        {submitting ? 'Adding…' : 'Add Station'}
      </Button>
      {onCancel && (
        <Button type="button" variant="ghost" block onClick={onCancel} className="mt-2">
          Cancel
        </Button>
      )}
    </form>
  )
}
