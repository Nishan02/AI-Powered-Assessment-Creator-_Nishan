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
  className: string;
  dueDate: string;
  questionRows: QuestionRow[];
  additionalInstructions: string;
  file?: FileList;
}

export default function AssignmentForm() {
  const { setAssignmentId, setView, setAssignments, isGuest, ownerId, addGuestAssignmentId } = useAssignmentStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, control, handleSubmit, watch } = useForm<IFormInput>({
    defaultValues: {
      questionRows: [{ type: 'Multiple Choice Questions', count: 4, marks: 1 }],
    },
  });

  const selectedFile = watch('file');
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questionRows',
  });

  const watchedRows = useWatch({ control, name: 'questionRows' });
  const totalQuestions = watchedRows?.reduce((acc, row) => acc + (Number(row.count) || 0), 0) || 0;
  const totalMarks = watchedRows?.reduce((acc, row) => acc + (Number(row.count) || 0) * (Number(row.marks) || 0), 0) || 0;

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    setIsSubmitting(true);
    try {
      if (!ownerId) throw new Error('Missing owner identity');

      const questionTypes = Array.from(new Set(data.questionRows.map((r) => r.type)));

      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('className', data.className);
      formData.append('dueDate', data.dueDate);
      formData.append('questionTypes', JSON.stringify(questionTypes));
      formData.append('totalQuestions', totalQuestions.toString());
      formData.append('totalMarks', totalMarks.toString());
      formData.append('ownerId', ownerId);

      const breakdownInfo = `Generate exactly: ${data.questionRows.map((r) => `${r.count} ${r.type} (${r.marks} marks each)`).join(', ')}. `;
      formData.append('additionalInstructions', breakdownInfo + (data.additionalInstructions || ''));

      if (data.file && data.file.length > 0) formData.append('file', data.file[0]);

      const response = await fetch('http://localhost:5000/api/assignments', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to submit assignment');

      const result = await response.json();
      setAssignmentId(result.assignmentId);
      if (isGuest) addGuestAssignmentId(result.assignmentId);

      // Refresh local list immediately so newly created assignment appears without page refresh.
      const latestAssignments = await fetch(
        `http://localhost:5000/api/assignments?ownerId=${encodeURIComponent(ownerId)}`
      );
      if (latestAssignments.ok) {
        const latest = await latestAssignments.json();
        setAssignments(latest);
      }

      setView('loading');
    } catch (error) {
      console.error(error);
      alert('Failed to submit assignment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-24">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Create Assignment</h2>
        </div>
        <p className="text-sm text-gray-500 mt-1">Set up a new assignment for your students.</p>
      </div>

      <div className="h-1.5 rounded-full bg-gray-200 mb-8 overflow-hidden">
        <div className="h-full w-1/2 bg-gray-600 rounded-full"></div>
      </div>

      <div className="bg-white rounded-[28px] border border-gray-200 shadow-sm p-5 md:p-7">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900">Assignment Details</h3>
          <p className="text-sm text-gray-500 mt-1">Basic information about your assignment</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
          <div className="border-2 border-dashed border-gray-300 rounded-3xl p-8 md:p-10 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100/60 transition-colors cursor-pointer relative">
            <input
              type="file"
              accept=".pdf,.txt,.jpg,.jpeg,.png"
              {...register('file')}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            />

            <CloudUpload className={`w-9 h-9 mb-3 ${selectedFile?.length ? 'text-green-600' : 'text-gray-400'}`} />

            {selectedFile?.length ? (
              <div className="text-center z-10 pointer-events-none">
                <p className="font-semibold text-green-700 text-sm">File ready for upload</p>
                <p className="text-gray-900 font-medium text-sm mt-2 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm inline-block">
                  {selectedFile[0].name}
                </p>
                <p className="text-xs text-gray-400 mt-2">Click or drag again to replace</p>
              </div>
            ) : (
              <div className="text-center z-10 pointer-events-none">
                <p className="font-medium text-gray-900 text-sm">Choose a file or drag and drop it here</p>
                <p className="text-xs text-gray-500 mt-1">PDF, TXT, JPG, PNG up to 10MB</p>
                <button type="button" className="mt-4 px-4 py-2 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-900 shadow-sm">
                  Browse Files
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-800 mb-2">Topic / Subject</label>
              <input
                type="text"
                {...register('title', { required: 'Required' })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-gray-300 outline-none text-sm text-gray-900 font-medium"
                placeholder="e.g. Science"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Class</label>
              <input
                type="text"
                {...register('className', { required: 'Required' })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-gray-300 outline-none text-sm text-gray-900 font-medium"
                placeholder="e.g. 8th"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-semibold text-gray-800 mb-2">Due Date</label>
              <input
                type="date"
                {...register('dueDate', { required: 'Required' })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-gray-300 outline-none text-sm text-gray-900 font-medium"
              />
            </div>
          </div>

          <div>
            <div className="grid grid-cols-12 gap-3 text-xs font-semibold text-gray-500 mb-3 px-1">
              <div className="col-span-7 md:col-span-8">Question Type</div>
              <div className="col-span-2 text-center">No.</div>
              <div className="col-span-2 text-center">Marks</div>
              <div className="col-span-1"></div>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-2 md:gap-3 items-center">
                  <select
                    {...register(`questionRows.${index}.type` as const)}
                    className="col-span-7 md:col-span-8 px-3 md:px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none text-sm text-gray-900 font-medium appearance-none"
                  >
                    <option value="Multiple Choice Questions">Multiple Choice Questions</option>
                    <option value="Short Questions">Short Questions</option>
                    <option value="Long Answer Questions">Long Answer Questions</option>
                    <option value="Diagram/Graph-Based">Diagram/Graph-Based Questions</option>
                    <option value="Numerical Problems">Numerical Problems</option>
                  </select>

                  <input
                    type="number"
                    min="1"
                    {...register(`questionRows.${index}.count` as const)}
                    className="col-span-2 px-2 py-3 text-center bg-gray-50 border border-gray-200 rounded-2xl outline-none text-sm text-gray-900 font-semibold"
                  />

                  <input
                    type="number"
                    min="1"
                    {...register(`questionRows.${index}.marks` as const)}
                    className="col-span-2 px-2 py-3 text-center bg-gray-50 border border-gray-200 rounded-2xl outline-none text-sm text-gray-900 font-semibold"
                  />

                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="col-span-1 p-1 text-gray-400 hover:text-red-500 transition-colors justify-self-center"
                    aria-label="Remove row"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => append({ type: 'Short Questions', count: 1, marks: 2 })}
              className="flex items-center gap-2 mt-4 text-sm font-semibold text-gray-800 hover:text-black transition-colors"
            >
              <div className="bg-black text-white p-1 rounded-full">
                <Plus size={14} />
              </div>
              Add Question Type
            </button>
          </div>

          <div className="flex flex-col items-end text-sm font-bold text-gray-900 space-y-1">
            <p>Total Questions: {totalQuestions}</p>
            <p>Total Marks: {totalMarks}</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Additional information (for better output)</label>
            <textarea
              {...register('additionalInstructions')}
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-gray-300 outline-none text-sm text-gray-900 resize-none"
              placeholder="e.g. Generate a question paper for 3 hour exam duration..."
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => setView('empty')}
              className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-full text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-7 py-2.5 bg-black text-white rounded-full text-sm font-semibold hover:bg-zinc-900 transition-colors disabled:bg-gray-400"
            >
              {isSubmitting ? 'Generating...' : 'Next'}
              <ChevronRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
