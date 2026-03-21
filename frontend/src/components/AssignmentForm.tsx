'use client';

import { useState } from 'react';
import { useForm, useFieldArray, useWatch, SubmitHandler } from 'react-hook-form';
import { CloudUpload, X, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAssignmentStore } from '@/store/useAssignmentStore';

interface QuestionRow {
  type: string;
  count: number;
  marks: number;
}

interface IFormInput {
  title: string;
  dueDate: string;
  questionRows: QuestionRow[];
  additionalInstructions: string;
  file?: FileList;
}

export default function AssignmentForm() {
  const { setAssignmentId, setView, isGuest, ownerId, addGuestAssignmentId } = useAssignmentStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<IFormInput>({
    defaultValues: {
      questionRows: [{ type: 'Multiple Choice Questions', count: 4, marks: 1 }],
    }
  });
  const selectedFile = watch('file');

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questionRows',
  });

  const watchedRows = useWatch({ control, name: 'questionRows' });
  const totalQuestions = watchedRows?.reduce((acc, row) => acc + (Number(row.count) || 0), 0) || 0;
  const totalMarks = watchedRows?.reduce((acc, row) => acc + ((Number(row.count) || 0) * (Number(row.marks) || 0)), 0) || 0;

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    setIsSubmitting(true);
    try {
      if (!ownerId) throw new Error('Missing owner identity');

      const questionTypes = Array.from(new Set(data.questionRows.map(r => r.type)));

      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('dueDate', data.dueDate);
      formData.append('questionTypes', JSON.stringify(questionTypes));
      formData.append('totalQuestions', totalQuestions.toString());
      formData.append('totalMarks', totalMarks.toString());
      formData.append('ownerId', ownerId);
      
      const breakdownInfo = `Generate exactly: ${data.questionRows.map(r => `${r.count} ${r.type} (${r.marks} marks each)`).join(', ')}. `;
      const finalInstructions = breakdownInfo + (data.additionalInstructions || '');
      formData.append('additionalInstructions', finalInstructions);
      
      if (data.file && data.file.length > 0) formData.append('file', data.file[0]);

      const response = await fetch('http://localhost:5000/api/assignments', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to submit');

      const result = await response.json();
      setAssignmentId(result.assignmentId);

      if (isGuest) addGuestAssignmentId(result.assignmentId);
      setView('loading');
      
    } catch (error) {
      console.error(error);
      alert('Failed to submit assignment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[800px] mx-auto bg-white p-8 md:p-10 rounded-[32px] shadow-sm border border-gray-100">
      
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900">Assignment Details</h2>
        <p className="text-sm text-gray-500 mt-1">Basic information about your assignment</p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
{/* File Upload Area */}
        <div className="border-2 border-dashed border-gray-200 rounded-3xl p-10 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer relative">
          <input 
            type="file" 
            accept=".pdf,.txt" 
            {...register('file')} 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
          />
          
          <CloudUpload className={`w-10 h-10 mb-3 ${selectedFile && selectedFile.length > 0 ? 'text-green-500' : 'text-gray-400'}`} />
          
          {selectedFile && selectedFile.length > 0 ? (
            <div className="text-center z-10 pointer-events-none">
              <p className="font-bold text-green-600 text-sm">File Ready for AI</p>
              <p className="text-gray-900 font-semibold text-sm mt-2 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm inline-block">
                📄 {selectedFile[0].name}
              </p>
              <p className="text-xs text-gray-400 mt-2">Click or drag again to replace</p>
            </div>
          ) : (
            <div className="text-center z-10 pointer-events-none">
              <p className="font-medium text-gray-900 text-sm">Choose a file or drag & drop it here</p>
              <p className="text-xs text-gray-500 mt-1">PDF and TXT formats</p>
              <button type="button" className="mt-4 px-4 py-2 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-900 shadow-sm">
                Browse Files
              </button>
            </div>
          )}
        </div>

        {/* Title & Due Date Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Topic / Title</label>
            <input
              type="text"
              {...register('title', { required: 'Required' })}
              // Added text-gray-900 and placeholder:text-gray-400
              className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-gray-200 outline-none transition-all text-sm text-gray-900 placeholder:text-gray-400 font-medium"
              placeholder="e.g., Data Structures"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Due Date</label>
            <input
              type="date"
              {...register('dueDate', { required: 'Required' })}
              // Added text-gray-900
              className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-gray-200 outline-none transition-all text-sm text-gray-900 font-medium"
            />
          </div>
        </div>

        {/* Dynamic Question Types */}
        <div>
          <div className="flex text-xs font-semibold text-gray-500 mb-3 px-2">
            <div className="flex-1">Question Type</div>
            <div className="w-20 text-center">No. of Questions</div>
            <div className="w-20 text-center ml-4">Marks</div>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-3">
                <select
                  {...register(`questionRows.${index}.type` as const)}
                  // Added text-gray-900
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none text-sm text-gray-900 font-medium appearance-none"
                >
                  <option value="Multiple Choice Questions">Multiple Choice Questions</option>
                  <option value="Short Questions">Short Questions</option>
                  <option value="Long Answer Questions">Long Answer Questions</option>
                  <option value="Diagram/Graph-Based">Diagram/Graph-Based Questions</option>
                  <option value="Numerical Problems">Numerical Problems</option>
                </select>

                <button 
                  type="button" 
                  onClick={() => remove(index)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X size={18} />
                </button>

                <input
                  type="number"
                  min="1"
                  {...register(`questionRows.${index}.count` as const)}
                  // Added text-gray-900
                  className="w-20 px-3 py-3 text-center bg-gray-50 border border-gray-200 rounded-2xl outline-none text-sm text-gray-900 font-semibold"
                />

                <input
                  type="number"
                  min="1"
                  {...register(`questionRows.${index}.marks` as const)}
                  // Added text-gray-900
                  className="w-20 px-3 py-3 text-center bg-gray-50 border border-gray-200 rounded-2xl outline-none text-sm text-gray-900 font-semibold ml-1"
                />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => append({ type: 'Short Questions', count: 1, marks: 2 })}
            className="flex items-center gap-2 mt-4 text-sm font-semibold text-gray-800 hover:text-black transition-colors"
          >
            <div className="bg-black text-white p-1 rounded-full"><Plus size={14} /></div>
            Add Question Type
          </button>
        </div>

        {/* Totals Summary */}
        <div className="flex flex-col items-end text-sm font-bold text-gray-900 space-y-1 pr-2">
          <p>Total Questions: {totalQuestions}</p>
          <p>Total Marks: {totalMarks}</p>
        </div>

        {/* Additional Instructions */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Additional information (For better output)</label>
          <textarea
            {...register('additionalInstructions')}
            rows={3}
            // Added text-gray-900 and placeholder:text-gray-400
            className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-gray-200 outline-none transition-all text-sm text-gray-900 placeholder:text-gray-400 font-medium resize-none"
            placeholder="e.g. Generate a question paper for 3 hour exam duration..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-6 mt-4">
          <button
            type="button"
            onClick={() => setView('empty')}
            className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-full text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={18} />
            Previous
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-8 py-3 bg-[#1c1c1c] text-white rounded-full text-sm font-semibold hover:bg-black transition-colors disabled:bg-gray-400"
          >
            {isSubmitting ? 'Generating...' : 'Next'}
            <ChevronRight size={18} />
          </button>
        </div>

      </form>
    </div>
  );
}
