export default ({
  minSlr = 0.9,
  longestDowntime = 5 * 60 * 1000
} = {}) => ({healthy, duration, uptime, downtime}) => {
  if (uptime === 0 && downtime === 0) return true
  if (duration > longestDowntime && !healthy) return false

  const slr = uptime / (uptime + downtime)
  if (slr < minSlr) return false

  return true
}
