'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useAssignmentStore } from '@/store/useAssignmentStore';

interface IFormInput {
  title: string;
  dueDate: string;
  questionTypes: string[];
  totalQuestions: number;
  totalMarks: number;
  additionalInstructions: string;
  file?: FileList;
}

export default function AssignmentForm() {
  const { setAssignmentId, setView } = useAssignmentStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<IFormInput>({
    defaultValues: { questionTypes: [] }
  });

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('dueDate', data.dueDate);
      formData.append('questionTypes', JSON.stringify(data.questionTypes));
      formData.append('totalQuestions', data.totalQuestions.toString());
      formData.append('totalMarks', data.totalMarks.toString());
      if (data.additionalInstructions) formData.append('additionalInstructions', data.additionalInstructions);
      if (data.file && data.file.length > 0) formData.append('file', data.file[0]);

      const response = await fetch('http://localhost:5000/api/assignments', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to submit');

      const result = await response.json();
      setAssignmentId(result.assignmentId);
      setView('loading'); // Instantly switch to loading view!
      
    } catch (error) {
      console.error(error);
      alert('Failed to submit assignment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Assignment</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Assignment Title</label>
          <input
            type="text"
            {...register('title', { required: 'Title is required' })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
            placeholder="e.g., Midterm Data Structures"
          />
          {errors.title && <span className="text-red-500 text-xs mt-1">{errors.title.message}</span>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Total Questions</label>
            <input
              type="number"
              {...register('totalQuestions', { required: 'Required', min: 1 })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Total Marks</label>
            <input
              type="number"
              {...register('totalMarks', { required: 'Required', min: 1 })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Question Types</label>
          <div className="flex gap-4">
            {['MCQ', 'Short Answer', 'Long Answer'].map((type) => (
              <label key={type} className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  value={type}
                  {...register('questionTypes', { required: 'Select at least one' })}
                  className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                />
                <span>{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Syllabus / Notes (PDF)</label>
          <input
            type="file"
            accept=".pdf,.txt"
            {...register('file')}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100 cursor-pointer text-sm text-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Due Date</label>
          <input
            type="date"
            {...register('dueDate', { required: 'Required' })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-gray-700"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#1e1e1e] hover:bg-black text-white font-medium py-3.5 rounded-full transition-colors disabled:bg-gray-400 mt-4"
        >
          {isSubmitting ? 'Generating AI Paper...' : 'Generate Assignment'}
        </button>
      </form>
    </div>
  );
}