import PillButton from '../components/PillButton'
import ModeOptionCard from '../components/ModeOptionCard'

interface CasualSelectScreenProps {
  onLearning: () => void
  onGuess: () => void
  onBack: () => void
}

export default function CasualSelectScreen({ onLearning, onGuess, onBack }: CasualSelectScreenProps) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6">
      <h1 className="font-sans text-2xl font-bold text-ink">Casual</h1>
      <div className="flex w-full max-w-sm flex-col gap-3">
        <ModeOptionCard
          title="Learning Mode"
          description="Flashcard-style, one skill at a time. Miss a flag and it comes back later for another try — no fixed end, study until you're done."
          onClick={onLearning}
        />
        <ModeOptionCard
          title="Guess Mode"
          description="Pick how many countries. Guess the country, see the result, then guess the next thing — feedback after every step."
          onClick={onGuess}
        />
        <PillButton onClick={onBack} variant="ghost">
          Back
        </PillButton>
      </div>
    </div>
  )
}
