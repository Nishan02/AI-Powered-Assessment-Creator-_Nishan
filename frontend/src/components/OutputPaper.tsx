'use client';

import { Download, RefreshCw } from 'lucide-react';
import { useAssignmentStore } from '@/store/useAssignmentStore';
import { useRef, useState } from 'react';

interface QuestionOption {
  text?: string;
  options?: string[];
  difficulty?: string;
  marks?: number;
  answer?: string;
}

interface Section {
  title?: string;
  instruction?: string;
  questions?: QuestionOption[];
}

// Helper function to get difficulty text color
const getDifficultyColor = (difficulty?: string): string => {
  switch (difficulty?.toLowerCase()) {
    case 'easy':
      return '#1b5e20';
    case 'challenging':
    case 'hard':
      return '#b71c1c';
    default: // Moderate
      return '#f57f17';
  }
};

export default function OutputPaper() {
  const { generatedPaper, schoolName, assignmentId, setAssignmentId, setView, setGenerationError } = useAssignmentStore();
  const printableRef = useRef<HTMLDivElement>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Always prioritize the assignment currently displayed in this view.
  const currentAssignmentId = (generatedPaper as any)?._id || assignmentId;

  const handleDownloadPDF = async () => {
    if (!printableRef.current) return;

    try {
      // Dynamically import html2pdf
      const html2pdf = (await import('html2pdf.js')).default;

      const element = printableRef.current;
      const filename = `${generatedPaper?.title || 'Assignment'}-${new Date().getTime()}.pdf`;

      const options = {
        margin: 10,
        filename: filename,
        image: { type: 'png' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { orientation: 'portrait' as const, unit: 'mm' as const, format: 'a4' as const },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] as const }
      };

      await html2pdf().set(options).from(element).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleRegenerate = async () => {
    if (!currentAssignmentId) {
      console.error('Assignment ID not found:', { assignmentId, generatedPaperId: (generatedPaper as any)?._id });
      alert('Assignment ID not found. Please refresh the page.');
      return;
    }
    
    setIsRegenerating(true);
    setGenerationError(null); // Clear any previous errors
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      console.log(`🔄 Regenerating assignment: ${currentAssignmentId}`);
      
      // Trigger regeneration of the same assignment
      const response = await fetch(`${API_URL}/api/assignments/${currentAssignmentId}/regenerate`, {
        method: 'POST'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to regenerate assignment');
      }

      console.log('✅ Regeneration job queued successfully');
      setAssignmentId(currentAssignmentId);

      // Switch to loading state
      setView('loading');
    } catch (error) {
      console.error('Error regenerating assignment:', error);
      alert(`Failed to regenerate assignment. ${error instanceof Error ? error.message : 'Please try again.'}`);
      setIsRegenerating(false);
    }
  };

  if (!generatedPaper) return null;

  const sections: Section[] = generatedPaper.sections || [];
  const selectedClass = generatedPaper.className || 'Not specified';
  const selectedSchool = schoolName || 'School Name';
  const allQuestions = sections.flatMap((section) => section.questions || []);
  const answerKeyItems = allQuestions.map((question) => question.answer?.trim() || '');
  const hasAnyAnswer = answerKeyItems.some((answer) => answer.length > 0);

  return (
    <div className="w-full max-w-5xl mx-auto mt-4 mb-20 rounded-3xl overflow-hidden shadow-xl border border-gray-200">
      <div className="bg-[#1f2022] text-white p-4 md:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <p className="text-xs md:text-sm font-medium leading-relaxed max-w-2xl">
          Here is your customized question paper generated from your assignment inputs.
        </p>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="bg-orange-500 text-white px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw size={16} className={isRegenerating ? 'animate-spin' : ''} />
            Regenerate
          </button>
          <button
            onClick={handleDownloadPDF}
            className="bg-white text-black px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2 hover:bg-gray-100 transition-colors"
          >
            <Download size={16} />
            Download as PDF
          </button>
        </div>
      </div>

      <div 
        ref={printableRef} 
        style={{
          backgroundColor: '#ffffff',
          color: '#000000',
          padding: '40px',
          fontFamily: 'Arial, sans-serif',
          lineHeight: '1.6'
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '8px 0', color: '#000' }}>
            {selectedSchool}
          </h1>
          <h2 style={{ fontSize: '18px', fontWeight: '500', margin: '4px 0', color: '#000' }}>
            Subject: {generatedPaper.title}
          </h2>
          <h2 style={{ fontSize: '18px', margin: '4px 0', color: '#000' }}>
            Class: {selectedClass}
          </h2>
        </div>

        {/* Time and Marks */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '500', marginBottom: '20px' }}>
          <span>Time Allowed: {generatedPaper.duration || '1 Hour'}</span>
          <span>Maximum Marks: {generatedPaper.totalMarks}</span>
        </div>

        {/* Instructions */}
        <p style={{ fontSize: '13px', marginBottom: '24px', fontWeight: '500', fontStyle: 'italic', color: '#000' }}>
          All questions are compulsory unless stated otherwise.
        </p>

        {/* Student Info */}
        <div style={{ marginBottom: '36px', fontSize: '13px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginBottom: '12px' }}>
            <span>Name:</span>
            <div style={{ borderBottom: '1px solid #000', flex: 1, maxWidth: '260px' }}></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginBottom: '12px' }}>
            <span>Roll Number:</span>
            <div style={{ borderBottom: '1px solid #000', flex: 1, maxWidth: '230px' }}></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
            <span>Class: {selectedClass}</span>
            <span style={{ marginLeft: '12px' }}>Section: _________</span>
          </div>
        </div>

        {/* Questions Sections */}
        <div>
          {sections.map((section, sIndex) => (
            <div key={sIndex} style={{ marginBottom: '32px' }}>
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontWeight: 'bold', fontSize: '16px', margin: '0', color: '#000' }}>
                  {section.title || `Section ${sIndex + 1}`}
                </h3>
                {section.instruction && (
                  <p style={{ fontSize: '13px', fontStyle: 'italic', margin: '4px 0 0 0', color: '#000' }}>
                    {section.instruction}
                  </p>
                )}
              </div>

              <div>
                {section.questions?.map((q, qIndex) => {
                  const diffColor = getDifficultyColor(q.difficulty);
                  return (
                    <div key={qIndex} style={{ display: 'flex', gap: '8px', marginBottom: '16px', fontSize: '13px', lineHeight: '1.6' }}>
                      <span style={{ fontWeight: '500', flex: '0 0 auto' }}>{qIndex + 1}.</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                          <span style={{ color: '#000' }}>
                            <span style={{ color: diffColor, fontWeight: '600' }}>
                              [{q.difficulty || 'Moderate'}]
                            </span>{' '}
                            {q.text}
                          </span>
                          <span style={{ color: '#000', whiteSpace: 'nowrap' }}>
                            [{q.marks || 1} Marks]
                          </span>
                        </div>

                        {q.options && q.options.length > 0 && (
                          <div style={{ marginTop: '8px', paddingLeft: '16px' }}>
                            {q.options.map((opt: string, optIndex: number) => (
                              <div key={optIndex} style={{ color: '#000', marginBottom: '4px' }}>
                                <span style={{ fontWeight: '500', marginRight: '8px' }}>
                                  {String.fromCharCode(97 + optIndex)})
                                </span>
                                {opt}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '48px', textAlign: 'center', fontSize: '13px', fontWeight: 'bold', color: '#000' }}>
          End of Question Paper
        </div>

        {allQuestions.length > 0 && (
          <div style={{ marginTop: '44px' }}>
            <h3 style={{ fontSize: '32px', fontWeight: '700', color: '#000', margin: '0 0 14px 0' }}>
              Answer Key:
            </h3>
            {!hasAnyAnswer ? (
              <p style={{ color: '#000', fontSize: '13px', margin: 0 }}>
                Answers unavailable in this older generation. Regenerate once to fetch full answer key.
              </p>
            ) : (
              <div>
                {answerKeyItems.map((answer, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      marginBottom: '10px',
                      color: '#000',
                      fontSize: '13px',
                      lineHeight: '1.5'
                    }}
                  >
                    <span style={{ flex: '0 0 auto' }}>{index + 1}.</span>
                    <span>{answer || 'Model answer unavailable for this question.'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
