import { useState, useEffect } from 'react';
import { userAPI } from '../services/userApi';

export const useCourseProgress = (courseId) => {
  const [progress, setProgress] = useState({
    course: null,
    sections: {},
    lessons: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const [courseProgress, sections] = await Promise.all([
        userAPI.getCourseProgress(courseId),
        // You might need to get sections separately
      ]);
      
      setProgress({
        course: courseProgress,
        sections: {}, // Will be populated as needed
        lessons: {}   // Will be populated as needed
      });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const getSectionProgress = async (sectionId) => {
    if (!progress.sections[sectionId]) {
      const sectionProgress = await userAPI.getSectionProgress(sectionId);
      setProgress(prev => ({
        ...prev,
        sections: {
          ...prev.sections,
          [sectionId]: sectionProgress
        }
      }));
    }
    return progress.sections[sectionId];
  };

  const getLessonProgress = async (lessonId) => {
    if (!progress.lessons[lessonId]) {
      const lessonProgress = await userAPI.getLessonProgress(lessonId);
      setProgress(prev => ({
        ...prev,
        lessons: {
          ...prev.lessons,
          [lessonId]: lessonProgress
        }
      }));
    }
    return progress.lessons[lessonId];
  };

  useEffect(() => {
    if (courseId) fetchProgress();
  }, [courseId]);

  return {
    progress,
    loading,
    error,
    getSectionProgress,
    getLessonProgress,
    refresh: fetchProgress
  };
};