import { useId, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { filterSuggestions } from '../engine/answerValidation'
import PillButton from './PillButton'

interface AutocompleteInputProps {
  label: string
  options: string[]
  onSubmit: (value: string) => void
  placeholder?: string
  autoFocus?: boolean
  onFocus?: () => void
  onBlur?: () => void
}

export default function AutocompleteInput({
  label,
  options,
  onSubmit,
  placeholder,
  autoFocus,
  onFocus,
  onBlur,
}: AutocompleteInputProps) {
  const [value, setValue] = useState('')
  const [highlighted, setHighlighted] = useState(-1)
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const listId = useId()

  const suggestions = value ? filterSuggestions(value, options) : []

  function selectSuggestion(suggestion: string) {
    setValue(suggestion)
    setIsOpen(false)
    setHighlighted(-1)
    inputRef.current?.focus()
  }

  function submit() {
    const firstSuggestion = suggestions[0]
    // Text answers are selected from the known country/capital list rather
    // than submitted verbatim. This makes a partial answer such as "Can"
    // select "Canada", while arbitrary free text cannot be graded.
    if (!value.trim()) {
      onSubmit('')
    } else if (firstSuggestion) {
      onSubmit(firstSuggestion)
    } else {
      return
    }
    setValue('')
    setIsOpen(false)
    setHighlighted(-1)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (suggestions.length === 0) return
      setIsOpen(true)
      setHighlighted((prev) => Math.min(prev + 1, suggestions.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlighted((prev) => Math.max(prev - 1, -1))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      // Submission and reveal navigation both use Enter. Keep this keypress
      // inside the input so the newly shown result is not immediately
      // advanced by the game-level reveal shortcut.
      event.stopPropagation()
      if (highlighted >= 0 && suggestions[highlighted]) {
        selectSuggestion(suggestions[highlighted])
      } else {
        submit()
      }
    } else if (event.key === 'Escape') {
      setIsOpen(false)
      setHighlighted(-1)
    }
  }

  return (
    <div className="w-full max-w-sm">
      <label htmlFor={`${listId}-input`} className="mb-1.5 block text-sm font-medium text-ink-muted">
        {label}
      </label>
      <div className="relative">
        <input
          id={`${listId}-input`}
          ref={inputRef}
          role="combobox"
          aria-expanded={isOpen && suggestions.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={highlighted >= 0 ? `${listId}-option-${highlighted}` : undefined}
          name="flag-quiz-answer"
          autoComplete="off"
          autoCapitalize="words"
          autoCorrect="off"
          spellCheck={false}
          autoFocus={autoFocus}
          value={value}
          placeholder={placeholder}
          onChange={(event) => {
            setValue(event.target.value)
            setIsOpen(true)
            setHighlighted(-1)
          }}
          onKeyDown={handleKeyDown}
          onFocus={onFocus}
          onBlur={() => {
            window.setTimeout(() => setIsOpen(false), 120)
            onBlur?.()
          }}
          className="min-h-11 w-full rounded-2xl border border-border bg-surface-card px-4 py-2.5 font-sans text-lg text-ink shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        />
        {isOpen && suggestions.length > 0 && (
          <ul
            id={listId}
            role="listbox"
            className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-2xl border border-border bg-surface-card py-1 shadow-lg"
          >
            {suggestions.map((suggestion, index) => (
              <li
                key={suggestion}
                id={`${listId}-option-${index}`}
                role="option"
                aria-selected={index === highlighted}
                onMouseDown={(event) => {
                  event.preventDefault() // keep focus in the input through the click
                  selectSuggestion(suggestion)
                }}
                className={`min-h-11 cursor-pointer px-4 py-2 text-base ${
                  index === highlighted ? 'bg-brand/10 text-brand' : 'text-ink'
                }`}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>
      <PillButton onClick={submit} className="mt-4 w-full" disabled={!suggestions.length}>
        Check answer
      </PillButton>
    </div>
  )
}
