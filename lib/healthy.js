export default ({
  minAvailability = 0.9,
  minReliability = 0.9,
  maxDowntime = 5 * 60 * 1000
} = {}) => ({
  healthy = true,
  reliability = 1,
  availability = 1,
  duration = 0
} = {}) => {
  if (!healthy && duration > maxDowntime) return false
  if (reliability <= minReliability) return false
  if (availability <= minAvailability) return false
  return true
}
