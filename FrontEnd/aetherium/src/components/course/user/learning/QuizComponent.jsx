"use client"

import { useState, useEffect } from "react"
import { CheckCircle, XCircle } from "lucide-react"

const QuizComponent = ({ assessment, onQuizComplete, isCompleted }) => {
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [totalPoints, setTotalPoints] = useState(0)

  useEffect(() => {
    if (assessment) {
      const initialAnswers = {}
      let initialTotalPoints = 0
      assessment.questions.forEach((q) => {
        initialAnswers[q.id] = ""
        initialTotalPoints += q.points
      })
      setSelectedAnswers(initialAnswers)
      setTotalPoints(initialTotalPoints)
      setSubmitted(isCompleted) // If lesson is already completed, show results
      if (isCompleted) {
        // Recalculate score if already completed (for display purposes)
        let calculatedScore = 0
        assessment.questions.forEach((q) => {
          // This assumes we have stored user's answers, which we don't in this example.
          // For a real app, you'd fetch user's previous answers to display them.
          // For now, if completed, we just show the correct answers.
          // A more robust solution would involve storing user answers in LessonProgress.
          calculatedScore += q.points // Assume full score if completed for display
        })
        setScore(calculatedScore)
      }
    }
  }, [assessment, isCompleted])

  const handleAnswerChange = (questionId, answer) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  const handleSubmitQuiz = () => {
    let currentScore = 0
    assessment.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correct_answer) {
        currentScore += q.points
      }
    })
    setScore(currentScore)
    setSubmitted(true)
    onQuizComplete(currentScore, totalPoints)
  }

  if (!assessment || assessment.questions.length === 0) {
    return <p className="text-gray-600">No assessment available for this lesson.</p>
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{assessment.title}</h3>
      <p className="text-gray-600">{assessment.description}</p>

      {assessment.questions.map((question, index) => (
        <div key={question.id} className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <p className="font-medium text-gray-800 mb-3">
            {index + 1}. {question.question_text} ({question.points} points)
          </p>
          <div className="space-y-2">
            {question.options.map((option, optIndex) => (
              <label key={optIndex} className="flex items-center text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={selectedAnswers[question.id] === option}
                  onChange={() => handleAnswerChange(question.id, option)}
                  disabled={submitted}
                  className="mr-2 accent-blue-600"
                />
                <span>{option}</span>
                {submitted && (
                  <>
                    {option === question.correct_answer && <CheckCircle className="w-4 h-4 text-green-500 ml-2" />}
                    {option === selectedAnswers[question.id] && option !== question.correct_answer && (
                      <XCircle className="w-4 h-4 text-red-500 ml-2" />
                    )}
                  </>
                )}
              </label>
            ))}
          </div>
          {submitted && (
            <p className="mt-3 text-sm">
              <span className="font-medium">Correct Answer:</span>{" "}
              <span className="text-green-600">{question.correct_answer}</span>
            </p>
          )}
        </div>
      ))}

      {!submitted && (
        <button
          onClick={handleSubmitQuiz}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium text-base disabled:opacity-50"
          disabled={Object.values(selectedAnswers).some((ans) => ans === "")}
        >
          Submit Quiz
        </button>
      )}

      {submitted && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg text-center">
          <h4 className="text-xl font-bold text-blue-800">
            Quiz Completed! Your Score: {score} / {totalPoints}
          </h4>
          {score >= assessment.passing_score ? (
            <p className="text-green-700 mt-2">Congratulations! You passed this assessment.</p>
          ) : (
            <p className="text-red-700 mt-2">You did not pass this assessment. Please review and try again.</p>
          )}
        </div>
      )}
    </div>
  )
}

export default QuizComponent
