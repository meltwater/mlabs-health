export default ({
  minSlr = 0.9,
  longestDowntime = 5 * 60 * 1000
} = {}) => ({
  healthy = true,
  duration = 0,
  uptime = 0,
  downtime = 0
} = {}) => {
  if (uptime === 0 && downtime === 0) return true
  if (!healthy && duration > longestDowntime) return false

  const slr = uptime / (uptime + downtime)
  if (slr < minSlr) return false

  return true
}
