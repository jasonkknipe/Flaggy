/**
 * Learning Mode's queue: an ordinary shuffled run through every country,
 * except a missed one is re-inserted later instead of moving on for good,
 * and the queue tops itself up before running out since Learning Mode has no
 * natural end - it only stops when you press Exit.
 *
 * The re-insertion offset scales with how many repeats are already pending
 * in the upcoming queue. Missing one flag pushes it back ~10 questions; but
 * if you miss a run of them in a short stretch, each subsequent repeat gets
 * pushed further out than the last, so they end up spread across a wide
 * window instead of all clustering ~10 questions ahead of each other and
 * crowding out fresh countries. As the backlog clears (repeats get answered,
 * whether correctly or not), the spacing relaxes back down on its own.
 */

const REINSERT_BASE_OFFSET = 10
const REINSERT_JITTER = 3 // widened from a tight +/-2 so repeats don't land on a predictable handful of positions
const REINSERT_SPACING_PER_PENDING = 4 // each already-pending repeat pushes a new one this much further out

export function createLearningQueue(allIso2: string[]): string[] {
  return shuffle(allIso2)
}

/** `previouslyAnsweredIso2` should be every country already answered this
 *  session (correct or not) - used only to count how many *pending* repeats
 *  already exist in the upcoming queue, not to affect which one gets
 *  reinserted right now. */
export function reinsertAfterMiss(
  queue: string[],
  currentIndex: number,
  iso2: string,
  previouslyAnsweredIso2: string[],
): string[] {
  const upcoming = queue.slice(currentIndex + 1)
  const seenBefore = new Set(previouslyAnsweredIso2)
  const pendingRepeats = upcoming.filter((code) => seenBefore.has(code)).length

  const jitter = Math.floor(Math.random() * (REINSERT_JITTER * 2 + 1)) - REINSERT_JITTER
  const offset = Math.max(3, REINSERT_BASE_OFFSET + pendingRepeats * REINSERT_SPACING_PER_PENDING + jitter)
  const insertAt = Math.min(queue.length, currentIndex + offset)

  const next = [...queue]
  next.splice(insertAt, 0, iso2)
  return next
}

export function extendQueueIfRunningLow(queue: string[], currentIndex: number, allIso2: string[]): string[] {
  const remaining = queue.length - currentIndex
  if (remaining > 5) return queue
  return [...queue, ...shuffle(allIso2)]
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
