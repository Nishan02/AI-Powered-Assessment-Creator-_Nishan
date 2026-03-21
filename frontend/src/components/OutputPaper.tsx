'use client';

import { Download } from 'lucide-react';
import { useAssignmentStore } from '@/store/useAssignmentStore';
import { useRef } from 'react';

interface QuestionOption {
  text?: string;
  options?: string[];
  difficulty?: string;
  marks?: number;
}

interface Section {
  title?: string;
  instruction?: string;
  questions?: QuestionOption[];
}

export default function OutputPaper() {
  const { generatedPaper, schoolName } = useAssignmentStore();
  const printableRef = useRef<HTMLDivElement>(null);

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

  if (!generatedPaper) return null;

  const sections: Section[] = generatedPaper.sections || [];
  const selectedClass = generatedPaper.className || 'Not specified';
  const selectedSchool = schoolName || 'School Name';

  return (
    <div className="w-full max-w-5xl mx-auto mt-4 mb-20 rounded-3xl overflow-hidden shadow-xl border border-gray-200">
      <div className="bg-[#1f2022] text-white p-4 md:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <p className="text-xs md:text-sm font-medium leading-relaxed max-w-2xl">
          Here is your customized question paper generated from your assignment inputs.
        </p>
        <button
          onClick={handleDownloadPDF}
          className="bg-white text-black px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2 hover:bg-gray-100 transition-colors"
        >
          <Download size={16} />
          Download as PDF
        </button>
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
                {section.questions?.map((q, qIndex) => (
                  <div key={qIndex} style={{ display: 'flex', gap: '8px', marginBottom: '16px', fontSize: '13px', lineHeight: '1.6' }}>
                    <span style={{ fontWeight: '500', flex: '0 0 auto' }}>{qIndex + 1}.</span>
                    <div>
                      <span style={{ fontWeight: '500', marginRight: '8px', color: '#000' }}>
                        [{q.difficulty || 'Moderate'}]
                      </span>
                      <span style={{ color: '#000' }}>{q.text}</span>
                      <span style={{ fontWeight: 'bold', marginLeft: '8px', color: '#000' }}>
                        [{q.marks || 1} Marks]
                      </span>

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
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '48px', textAlign: 'center', fontSize: '13px', fontWeight: 'bold', color: '#000' }}>
          End of Question Paper
        </div>
      </div>
    </div>
  );
}
