
import { useState } from "react"
import { Plus, Trash2, Check, X, FileQuestion } from "lucide-react"

const QuestionEditor = ({ question, onUpdate, onDelete, questionIndex }) => {
  const [localQuestion, setLocalQuestion] = useState(question)

  const handleQuestionChange = (field, value) => {
    const updated = { ...localQuestion, [field]: value }
    setLocalQuestion(updated)
    onUpdate(updated)
  }

  const handleOptionChange = (optionIndex, field, value) => {
    const updatedOptions = localQuestion.options.map((option, index) =>
      index === optionIndex ? { ...option, [field]: value } : option,
    )
    handleQuestionChange("options", updatedOptions)
  }

  const addOption = () => {
    const newOption = { text: "", is_correct: false }
    handleQuestionChange("options", [...localQuestion.options, newOption])
  }

  const removeOption = (optionIndex) => {
    if (localQuestion.options.length > 2) {
      const updatedOptions = localQuestion.options.filter((_, index) => index !== optionIndex)
      handleQuestionChange("options", updatedOptions)
    }
  }

  const setCorrectAnswer = (optionIndex) => {
    const updatedOptions = localQuestion.options.map((option, index) => ({
      ...option,
      is_correct: index === optionIndex,
    }))
    handleQuestionChange("options", updatedOptions)
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">Question {questionIndex + 1}</h4>
        <button onClick={onDelete} className="text-red-500 hover:text-red-700 p-1">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Question Text</label>
        <textarea
          value={localQuestion.question_text}
          onChange={(e) => handleQuestionChange("question_text", e.target.value)}
          placeholder="Enter your question here..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">Answer Options</label>
          <button
            onClick={addOption}
            disabled={localQuestion.options.length >= 6}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50"
          >
            <Plus className="w-4 h-4 inline mr-1" />
            Add Option
          </button>
        </div>

        <div className="space-y-2">
          {localQuestion.options.map((option, optionIndex) => (
            <div key={optionIndex} className="flex items-center space-x-2">
              <button
                onClick={() => setCorrectAnswer(optionIndex)}
                className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  option.is_correct
                    ? "border-green-500 bg-green-500 text-white"
                    : "border-gray-300 hover:border-green-400"
                }`}
              >
                {option.is_correct && <Check className="w-3 h-3" />}
              </button>

              <input
                type="text"
                value={option.text}
                onChange={(e) => handleOptionChange(optionIndex, "text", e.target.value)}
                placeholder={`Option ${optionIndex + 1}`}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />

              {localQuestion.options.length > 2 && (
                <button onClick={() => removeOption(optionIndex)} className="text-red-500 hover:text-red-700 p-1">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-500 mt-2">Click the circle to mark the correct answer</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Points</label>
          <input
            type="number"
            value={localQuestion.points || 1}
            onChange={(e) => handleQuestionChange("points", Number.parseInt(e.target.value))}
            min="1"
            max="10"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Time Limit (seconds)</label>
          <input
            type="number"
            value={localQuestion.time_limit || 30}
            onChange={(e) => handleQuestionChange("time_limit", Number.parseInt(e.target.value))}
            min="10"
            max="300"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  )
}

const AssessmentEditor = ({ assessment, onChange }) => {
  const [localAssessment, setLocalAssessment] = useState(
    assessment || {
      title: "",
      description: "",
      time_limit: 30,
      passing_score: 70,
      questions: [],
    },
  )

  const handleAssessmentChange = (field, value) => {
    const updated = { ...localAssessment, [field]: value }
    setLocalAssessment(updated)
    onChange(updated)
  }

  const addQuestion = () => {
    const newQuestion = {
      question_text: "",
      options: [
        { text: "", is_correct: false },
        { text: "", is_correct: false },
      ],
      points: 1,
      time_limit: 30,
    }
    handleAssessmentChange("questions", [...localAssessment.questions, newQuestion])
  }

  const updateQuestion = (questionIndex, updatedQuestion) => {
    const updatedQuestions = localAssessment.questions.map((q, index) =>
      index === questionIndex ? updatedQuestion : q,
    )
    handleAssessmentChange("questions", updatedQuestions)
  }

  const deleteQuestion = (questionIndex) => {
    const updatedQuestions = localAssessment.questions.filter((_, index) => index !== questionIndex)
    handleAssessmentChange("questions", updatedQuestions)
  }

  const totalPoints = localAssessment.questions.reduce((sum, q) => sum + (q.points || 1), 0)

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-4">Assessment Settings</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assessment Title</label>
            <input
              type="text"
              value={localAssessment.title}
              onChange={(e) => handleAssessmentChange("title", e.target.value)}
              placeholder="Enter assessment title"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Passing Score (%)</label>
            <input
              type="number"
              value={localAssessment.passing_score}
              onChange={(e) => handleAssessmentChange("passing_score", Number.parseInt(e.target.value))}
              min="1"
              max="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={localAssessment.description}
            onChange={(e) => handleAssessmentChange("description", e.target.value)}
            placeholder="Brief description of the assessment"
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {totalPoints > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            Total Points: {totalPoints} | Questions: {localAssessment.questions.length}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900">Questions</h3>
          <button
            onClick={addQuestion}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Add Question
          </button>
        </div>

        {localAssessment.questions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileQuestion className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No questions added yet. Click "Add Question" to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {localAssessment.questions.map((question, index) => (
              <QuestionEditor
                key={index}
                question={question}
                questionIndex={index}
                onUpdate={(updatedQuestion) => updateQuestion(index, updatedQuestion)}
                onDelete={() => deleteQuestion(index)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AssessmentEditor
