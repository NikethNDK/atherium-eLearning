import { useState, useEffect } from "react";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { instructorAPI } from "../../services/instructorApi";
import LoadingSpinner from "../../components/common/LoadingSpinner"
const QuestionEditor = ({ question, index, onChange, onRemove, onMove }) => {

  
  const [localQuestion, setLocalQuestion] = useState({
    question_text: "",
    options: [],
    correct_answer: null,
    points: 1.0,
    order_index: 0,
    ...question
  });

  useEffect(() => {
    onChange(localQuestion);
  }, [localQuestion]);

  const handleOptionChange = (optIndex, value) => {
    const newOptions = [...localQuestion.options];
    newOptions[optIndex] = value;
    setLocalQuestion({ ...localQuestion, options: newOptions });
  };

  const addOption = () => {
    setLocalQuestion({
      ...localQuestion,
      options: [...localQuestion.options, ""]
    });
  };

  const removeOption = (optIndex) => {
    const newOptions = localQuestion.options.filter((_, i) => i !== optIndex);
    setLocalQuestion({ ...localQuestion, options: newOptions });
  };

  return (
    <div className="border rounded-lg p-4 mb-4 bg-white">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-medium">Question {index + 1}</h4>
        <div className="flex space-x-2">
          <button
            onClick={() => onMove(index, 'up')}
            className="p-1 text-gray-500 hover:text-gray-700"
            disabled={index === 0}
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => onMove(index, 'down')}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            onClick={() => onRemove(index)}
            className="p-1 text-red-500 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Question Text *
        </label>
        <input
          type="text"
          value={localQuestion.question_text}
          onChange={(e) => setLocalQuestion({ ...localQuestion, question_text: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Points
        </label>
        <input
          type="number"
          min="0"
          step="0.5"
          value={localQuestion.points}
          onChange={(e) => setLocalQuestion({ ...localQuestion, points: parseFloat(e.target.value) || 0 })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Answer Options
        </label>
        {localQuestion.options.map((option, optIndex) => (
          <div key={optIndex} className="flex items-center mb-2">
            <input
              type="radio"
              name={`correct-answer-${index}`}
              checked={localQuestion.correct_answer === option}
              onChange={() => setLocalQuestion({ ...localQuestion, correct_answer: option })}
              className="mr-2"
            />
            <input
              type="text"
              value={option}
              onChange={(e) => handleOptionChange(optIndex, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            />
            <button
              onClick={() => removeOption(optIndex)}
              className="ml-2 p-1 text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button
          onClick={addOption}
          className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Option
        </button>
      </div>
    </div>
  );
};

// const AssessmentEditor = ({ type, assessment, onChange }) => {
//   const [localAssessment, setLocalAssessment] = useState({
//     title: "",
//     description: "",
//     passing_score: 70,
//     time_limit: null,
//     max_attempts: 3,
//     questions: [],
//     ...assessment
//   });
// const AssessmentEditor = ({ type, assessment, onChange, lessonId }) => {
//   const [localAssessment, setLocalAssessment] = useState({
//     title: "",
//     description: "",
//     passing_score: 70,
//     time_limit: null,
//     max_attempts: 3,
//     questions: []
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchAssessmentData = async () => {
//       try {
//         setLoading(true);
//         setError(null);
        
//         if (lessonId) {
//           const response = await instructorAPI.getLessonDetail(lessonId);
//           if (response.assessments?.length > 0) {
//             const assessmentData = response.assessments[0];
//             setLocalAssessment({
//               title: assessmentData.title || "",
//               description: assessmentData.description || "",
//               passing_score: assessmentData.passing_score || 70,
//               time_limit: assessmentData.time_limit || null,
//               max_attempts: assessmentData.max_attempts || 3,
//               questions: assessmentData.questions.map(q => ({
//                 id: q.id,
//                 question_text: q.question_text || "",
//                 options: q.options || [],
//                 correct_answer: q.correct_answer || null,
//                 points: q.points || 1.0,
//                 order_index: q.order_index || 0
//               }))
//             });
//           }
//         } else if (assessment) {
//           // Fallback to prop if no lessonId
//           setLocalAssessment(assessment);
//         }
//       } catch (err) {
//         console.error("Failed to load assessment:", err);
//         setError("Failed to load assessment data");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAssessmentData();
//   }, [lessonId, assessment]);
//   useEffect(() => {
//     // Ensure questions have proper structure
//     const processedQuestions = localAssessment.questions.map(q => ({
//       question_text: q.question_text || "",
//       options: q.options || [],
//       correct_answer: q.correct_answer || null,
//       points: q.points || 1.0,
//       order_index: q.order_index || 0,
//       id: q.id || null,
//       assessment_id: q.assessment_id || null
//     }));
    
//     onChange({
//       ...localAssessment,
//       questions: processedQuestions
//     });
//   }, [localAssessment]);

//   const addQuestion = () => {
//     setLocalAssessment({
//       ...localAssessment,
//       questions: [
//         ...localAssessment.questions,
//         {
//           question_text: "",
//           options: [],
//           correct_answer: null,
//           points: 1.0,
//           order_index: localAssessment.questions.length
//         }
//       ]
//     });
//   };

//   const updateQuestion = (index, question) => {
//     const newQuestions = [...localAssessment.questions];
//     newQuestions[index] = question;
//     setLocalAssessment({ ...localAssessment, questions: newQuestions });
//   };

//   const removeQuestion = (index) => {
//     const newQuestions = localAssessment.questions.filter((_, i) => i !== index);
//     setLocalAssessment({ ...localAssessment, questions: newQuestions });
//   };

//   const moveQuestion = (index, direction) => {
//     if (direction === 'up' && index === 0) return;
//     if (direction === 'down' && index === localAssessment.questions.length - 1) return;
    
//     const newIndex = direction === 'up' ? index - 1 : index + 1;
//     const newQuestions = [...localAssessment.questions];
    
//     // Swap positions
//     [newQuestions[index], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[index]];
    
//     // Update order_index
//     newQuestions.forEach((q, i) => {
//       q.order_index = i;
//     });
    
//     setLocalAssessment({ ...localAssessment, questions: newQuestions });
//   };

//   return (
//     <div className="space-y-6">
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-2">
//           Assessment Title *
//         </label>
//         <input
//           type="text"
//           value={localAssessment.title}
//           onChange={(e) => setLocalAssessment({ ...localAssessment, title: e.target.value })}
//           className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//           required
//         />
//       </div>

//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-2">
//           Description
//         </label>
//         <textarea
//           value={localAssessment.description}
//           onChange={(e) => setLocalAssessment({ ...localAssessment, description: e.target.value })}
//           className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//           rows={3}
//         />
//       </div>

//       <div className="grid grid-cols-2 gap-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Passing Score (%)
//           </label>
//           <input
//             type="number"
//             min="0"
//             max="100"
//             value={localAssessment.passing_score}
//             onChange={(e) => setLocalAssessment({ ...localAssessment, passing_score: parseFloat(e.target.value) || 0 })}
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg"
//           />
//         </div>
//       </div>

//       <div className="border-t border-gray-200 pt-4">
//         <div className="flex justify-between items-center mb-4">
//           <h3 className="font-medium text-gray-900">Questions</h3>
//           <button
//             onClick={addQuestion}
//             className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//           >
//             <Plus className="w-4 h-4 mr-1" /> Add Question
//           </button>
//         </div>

//         {localAssessment.questions.length === 0 ? (
//           <div className="text-center py-6 text-gray-500">
//             No questions added yet. Click "Add Question" to get started.
//           </div>
//         ) : (
//           localAssessment.questions.map((question, index) => (
//             <QuestionEditor
//               key={index}
//               question={question}
//               index={index}
//               onChange={(updatedQuestion) => updateQuestion(index, updatedQuestion)}
//               onRemove={removeQuestion}
//               onMove={moveQuestion}
//             />
//           ))
//         )}
//       </div>
//     </div>
//   );
// };

// export default AssessmentEditor;
const AssessmentEditor = ({ lessonId, onChange, isNewAssessment = false }) => {
  const [localAssessment, setLocalAssessment] = useState({
    title: "",
    description: "",
    passing_score: 70,
    time_limit: null,
    max_attempts: 3,
    questions: []
  });
  const [loading, setLoading] = useState(!isNewAssessment);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isNewAssessment) {
      // Don't fetch for new assessments
      setLoading(false);
      return;
    }

    const fetchAssessment = async () => {
      try {
        const response = await instructorAPI.getLessonAssessment(lessonId);
        setLocalAssessment({
          title: response.title || "",
          description: response.description || "",
          passing_score: response.passing_score || 70,
          time_limit: response.time_limit || null,
          max_attempts: response.max_attempts || 3,
          questions: (response.questions || []).map(q => ({
            ...q,
            options: q.options || [],
            correct_answer: q.correct_answer || null
          }))
        });
      } catch (err) {
        console.error("Failed to load assessment:", err);
        setError("Failed to load assessment details");
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [lessonId, isNewAssessment]);

  // Update parent when local assessment changes
  useEffect(() => {
    onChange(localAssessment);
  }, [localAssessment]);

  const handleQuestionChange = (index, updatedQuestion) => {
    const newQuestions = [...localAssessment.questions];
    newQuestions[index] = updatedQuestion;
    setLocalAssessment(prev => ({
      ...prev,
      questions: newQuestions
    }));
  };

  const addQuestion = () => {
    setLocalAssessment(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          question_text: "",
          options: [],
          correct_answer: null,
          points: 1.0,
          order_index: prev.questions.length
        }
      ]
    }));
  };

  if (loading) {
    return <div className="p-4 text-center">Loading assessment...</div>;
  }

  if (error && !isNewAssessment) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-red-700">{error}</p>
        <button 
          onClick={() => {
            setError(null);
            setLoading(true);
            fetchAssessment();
          }}
          className="mt-2 text-blue-600 hover:text-blue-800"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Assessment fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assessment Title *
          </label>
          <input
            type="text"
            value={localAssessment.title}
            onChange={(e) => setLocalAssessment(prev => ({
              ...prev,
              title: e.target.value
            }))}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Passing Score (%) *
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={localAssessment.passing_score}
            onChange={(e) => setLocalAssessment(prev => ({
              ...prev,
              passing_score: Number(e.target.value)
            }))}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
      </div>

      {/* Questions section */}
      <div className="space-y-4">
        {localAssessment.questions.map((question, index) => (
          <QuestionItem
            key={question.id || index}
            question={question}
            index={index}
            onChange={handleQuestionChange}
            onRemove={() => setLocalAssessment(prev => ({
              ...prev,
              questions: prev.questions.filter((_, i) => i !== index)
            }))}
          />
        ))}

        <button
          onClick={addQuestion}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Question
        </button>
      </div>
    </div>
  );
};
export default AssessmentEditor;

const QuestionItem = ({ question, index, onChange, onRemove }) => {
  const [localQuestion, setLocalQuestion] = useState(question);


  useEffect(() => {
    onChange(index, localQuestion);
  }, [localQuestion]);

  const handleOptionChange = (optIndex, value) => {
    const newOptions = [...localQuestion.options];
    newOptions[optIndex] = value;
    setLocalQuestion(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const addOption = () => {
    setLocalQuestion(prev => ({
      ...prev,
      options: [...prev.options, ""]
    }));
  };

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-medium">Question {index + 1}</h4>
        <button onClick={onRemove} className="text-red-500 hover:text-red-700">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Question Text *
        </label>
        <input
          type="text"
          value={localQuestion.question_text}
          onChange={(e) => setLocalQuestion(prev => ({
            ...prev,
            question_text: e.target.value
          }))}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Answer Options
        </label>
        {localQuestion.options.map((option, optIndex) => (
          <div key={optIndex} className="flex items-center mb-2">
            <input
              type="radio"
              name={`correct-answer-${index}`}
              checked={localQuestion.correct_answer === option}
              onChange={() => setLocalQuestion(prev => ({
                ...prev,
                correct_answer: option
              }))}
              className="mr-2"
            />
            <input
              type="text"
              value={option}
              onChange={(e) => handleOptionChange(optIndex, e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg"
            />
            <button
              onClick={() => {
                const newOptions = localQuestion.options.filter((_, i) => i !== optIndex);
                setLocalQuestion(prev => ({
                  ...prev,
                  options: newOptions,
                  // Clear correct answer if it was the deleted option
                  correct_answer: prev.correct_answer === option ? null : prev.correct_answer
                }));
              }}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button
          onClick={addOption}
          className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Option
        </button>
      </div>
    </div>
  );
};