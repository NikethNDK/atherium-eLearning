import { useState } from "react";

const AssessmentContent = ({ assessment, onComplete }) => {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Calculate score
    let correct = 0;
    assessment.questions.forEach((q) => {
      if (answers[q.id] === q.correct_answer) {
        correct += q.points;
      }
    });
    
    setScore(correct);
    setSubmitted(true);
    
    // If passing score, complete the lesson
    if (correct >= assessment.passing_score) {
      onComplete();
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">{assessment.title}</h3>
      <p className="mb-6">{assessment.description}</p>
      
      {submitted ? (
        <div className={`p-4 rounded-lg mb-6 ${
          score >= assessment.passing_score 
            ? "bg-green-100 text-green-800" 
            : "bg-red-100 text-red-800"
        }`}>
          <p>
            Your score: {score}/{assessment.questions.reduce((a, b) => a + b.points, 0)}
          </p>
          <p>
            {score >= assessment.passing_score
              ? "Congratulations! You passed."
              : "Please try again."}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {assessment.questions.map((q) => (
            <div key={q.id} className="mb-6">
              <p className="font-medium mb-2">{q.question_text}</p>
              <div className="space-y-2">
                {q.options.map((option, i) => (
                  <label key={i} className="flex items-center">
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      value={option}
                      onChange={() => setAnswers({...answers, [q.id]: option})}
                      className="mr-2"
                      required
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Submit Assessment
          </button>
        </form>
      )}
    </div>
  );
};

export default AssessmentContent;