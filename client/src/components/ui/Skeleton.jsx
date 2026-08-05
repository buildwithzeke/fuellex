import { cx } from '../../lib/format'

/** .skeleton from the mockup — shimmer placeholder. */
export default function Skeleton({ className }) {
  return <div className={cx('fl-skeleton', className)} aria-hidden="true" />
}
