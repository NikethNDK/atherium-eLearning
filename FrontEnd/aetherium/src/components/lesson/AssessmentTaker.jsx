"use client"

import { useState, useEffect } from "react"
import { Clock, CheckCircle, XCircle, Award, RotateCcw } from "lucide-react"

const QuestionCard = ({ question, questionIndex, selectedAnswer, onAnswerSelect, showResults, timeRemaining }) => {
  const isCorrect = showResults && question.options[selectedAnswer]?.is_correct
  const correctAnswerIndex = question.options.findIndex((option) => option.is_correct)

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Question {questionIndex + 1}</h3>
        {!showResults && timeRemaining > 0 && (
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-1" />
            <span>{timeRemaining}s</span>
          </div>
        )}
      </div>

      <div className="mb-6">
        <p className="text-gray-800 leading-relaxed">{question.question_text}</p>
      </div>

      <div className="space-y-3">
        {question.options.map((option, optionIndex) => {
          let buttonClass = "w-full text-left p-4 rounded-lg border-2 transition-all "

          if (showResults) {
            if (optionIndex === correctAnswerIndex) {
              buttonClass += "border-green-500 bg-green-50 text-green-800"
            } else if (optionIndex === selectedAnswer && !option.is_correct) {
              buttonClass += "border-red-500 bg-red-50 text-red-800"
            } else {
              buttonClass += "border-gray-200 bg-gray-50 text-gray-600"
            }
          } else {
            if (selectedAnswer === optionIndex) {
              buttonClass += "border-blue-500 bg-blue-50 text-blue-800"
            } else {
              buttonClass += "border-gray-200 hover:border-gray-300 text-gray-800"
            }
          }

          return (
            <button
              key={optionIndex}
              onClick={() => !showResults && onAnswerSelect(optionIndex)}
              disabled={showResults}
              className={buttonClass}
            >
              <div className="flex items-center justify-between">
                <span>{option.text}</span>
                {showResults && (
                  <div>
                    {optionIndex === correctAnswerIndex && <CheckCircle className="w-5 h-5 text-green-600" />}
                    {optionIndex === selectedAnswer && !option.is_correct && (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {showResults && (
        <div className="mt-4 p-3 rounded-lg bg-gray-50">
          <div className="flex items-center space-x-2">
            {isCorrect ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
            <span className={`font-medium ${isCorrect ? "text-green-800" : "text-red-800"}`}>
              {isCorrect ? "Correct!" : "Incorrect"}
            </span>
            <span className="text-gray-600">
              ({question.points} point{question.points !== 1 ? "s" : ""})
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

const AssessmentResults = ({ assessment, userAnswers, score, onRetake, onContinue }) => {
  const totalQuestions = assessment.questions.length
  const correctAnswers = userAnswers.filter(
    (answer, index) => assessment.questions[index].options[answer]?.is_correct,
  ).length

  const percentage = Math.round(score)
  const passed = percentage >= assessment.passing_score

  return (
    <div className="space-y-6">
      <div
        className={`text-center p-8 rounded-lg ${
          passed ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
        }`}
      >
        <div
          className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
            passed ? "bg-green-100" : "bg-red-100"
          }`}
        >
          {passed ? <Award className="w-8 h-8 text-green-600" /> : <XCircle className="w-8 h-8 text-red-600" />}
        </div>

        <h2 className={`text-2xl font-bold mb-2 ${passed ? "text-green-900" : "text-red-900"}`}>
          {passed ? "Assessment Passed!" : "Assessment Failed"}
        </h2>

        <div className="text-lg mb-4">
          <span className={`font-semibold ${passed ? "text-green-800" : "text-red-800"}`}>{percentage}%</span>
          <span className="text-gray-600 ml-2">
            ({correctAnswers}/{totalQuestions} correct)
          </span>
        </div>

        <p className={`text-sm ${passed ? "text-green-700" : "text-red-700"}`}>
          {passed
            ? `Great job! You scored above the passing grade of ${assessment.passing_score}%.`
            : `You need ${assessment.passing_score}% to pass. Don't give up!`}
        </p>
      </div>

      <div className="flex justify-center space-x-4">
        {!passed && (
          <button
            onClick={onRetake}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Retake Assessment
          </button>
        )}

        <button
          onClick={onContinue}
          className={`px-6 py-3 rounded-lg transition-colors ${
            passed ? "bg-green-600 text-white hover:bg-green-700" : "bg-gray-600 text-white hover:bg-gray-700"
          }`}
        >
          {passed ? "Continue Learning" : "Review Content"}
        </button>
      </div>
    </div>
  )
}

const AssessmentTaker = ({ assessment, onComplete, onUpdateScore }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [userAnswers, setUserAnswers] = useState([])
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isStarted, setIsStarted] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)

  useEffect(() => {
    if (isStarted && !isCompleted && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining((prev) => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeRemaining === 0 && isStarted && !isCompleted) {
      handleNextQuestion()
    }
  }, [timeRemaining, isStarted, isCompleted])

  const startAssessment = () => {
    setIsStarted(true)
    setCurrentQuestion(0)
    setUserAnswers(new Array(assessment.questions.length).fill(null))
    setTimeRemaining(assessment.questions[0]?.time_limit || 30)
  }

  const handleAnswerSelect = (answerIndex) => {
    const newAnswers = [...userAnswers]
    newAnswers[currentQuestion] = answerIndex
    setUserAnswers(newAnswers)
  }

  const handleNextQuestion = () => {
    if (currentQuestion < assessment.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
      setTimeRemaining(assessment.questions[currentQuestion + 1]?.time_limit || 30)
    } else {
      completeAssessment()
    }
  }

  const completeAssessment = () => {
    setIsCompleted(true)
    calculateScore()
  }

  const calculateScore = () => {
    let totalPoints = 0
    let earnedPoints = 0

    assessment.questions.forEach((question, index) => {
      totalPoints += question.points || 1
      const userAnswer = userAnswers[index]
      if (userAnswer !== null && question.options[userAnswer]?.is_correct) {
        earnedPoints += question.points || 1
      }
    })

    const calculatedScore = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0
    setScore(calculatedScore)

    // Update lesson score
    onUpdateScore(calculatedScore)

    setTimeout(() => setShowResults(true), 1000)
  }

  const retakeAssessment = () => {
    setIsStarted(false)
    setIsCompleted(false)
    setShowResults(false)
    setCurrentQuestion(0)
    setUserAnswers([])
    setScore(0)
  }

  const handleContinue = () => {
    onComplete(score >= assessment.passing_score)
  }

  if (!isStarted) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-blue-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">{assessment.title}</h2>

          {assessment.description && <p className="text-gray-600 mb-6">{assessment.description}</p>}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm">
            <div className="bg-white p-3 rounded-lg">
              <div className="font-medium text-gray-900">Questions</div>
              <div className="text-blue-600">{assessment.questions.length}</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="font-medium text-gray-900">Passing Score</div>
              <div className="text-blue-600">{assessment.passing_score}%</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="font-medium text-gray-900">Time Limit</div>
              <div className="text-blue-600">Per Question</div>
            </div>
          </div>

          <button
            onClick={startAssessment}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Start Assessment
          </button>
        </div>
      </div>
    )
  }

  if (isCompleted && showResults) {
    return (
      <div className="space-y-6">
        <AssessmentResults
          assessment={assessment}
          userAnswers={userAnswers}
          score={score}
          onRetake={retakeAssessment}
          onContinue={handleContinue}
        />

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Review Your Answers</h3>
          {assessment.questions.map((question, index) => (
            <QuestionCard
              key={index}
              question={question}
              questionIndex={index}
              selectedAnswer={userAnswers[index]}
              onAnswerSelect={() => {}}
              showResults={true}
              timeRemaining={0}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
        <div className="text-sm text-gray-600">
          Question {currentQuestion + 1} of {assessment.questions.length}
        </div>
        <div className="w-64 bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / assessment.questions.length) * 100}%` }}
          />
        </div>
      </div>

      <QuestionCard
        question={assessment.questions[currentQuestion]}
        questionIndex={currentQuestion}
        selectedAnswer={userAnswers[currentQuestion]}
        onAnswerSelect={handleAnswerSelect}
        showResults={false}
        timeRemaining={timeRemaining}
      />

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0}
          className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>

        <button
          onClick={handleNextQuestion}
          disabled={userAnswers[currentQuestion] === null}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {currentQuestion === assessment.questions.length - 1 ? "Finish" : "Next"}
        </button>
      </div>
    </div>
  )
}

export default AssessmentTaker
