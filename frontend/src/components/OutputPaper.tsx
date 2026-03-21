'use client';

import { Download } from 'lucide-react';
import { useAssignmentStore } from '@/store/useAssignmentStore';

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

  const handleDownloadPDF = () => {
    window.print();
  };

  if (!generatedPaper) return null;

  const sections: Section[] = generatedPaper.sections || [];
  const selectedClass = generatedPaper.className || 'Not specified';
  const selectedSchool = schoolName || 'School Name';

  return (
    <div className="w-full max-w-5xl mx-auto mt-4 mb-20 rounded-3xl overflow-hidden shadow-xl border border-gray-200">
      <div className="bg-[#1f2022] text-white p-4 md:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 print:hidden">
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

      <div id="printable-paper" className="bg-white text-black p-5 md:p-10">
        <div className="text-center space-y-1 mb-8">
          <h1 className="text-2xl md:text-4xl font-bold leading-tight">{selectedSchool}</h1>
          <h2 className="text-base md:text-xl font-medium">Subject: {generatedPaper.title}</h2>
          <h2 className="text-base md:text-xl">Class: {selectedClass}</h2>
        </div>

        <div className="flex justify-between text-xs md:text-sm font-medium mb-5">
          <span>Time Allowed: {generatedPaper.duration || '1 Hour'}</span>
          <span>Maximum Marks: {generatedPaper.totalMarks}</span>
        </div>

        <p className="text-xs md:text-sm mb-6 font-medium italic">
          All questions are compulsory unless stated otherwise.
        </p>

        <div className="space-y-3 text-xs md:text-sm mb-9">
          <div className="flex items-end gap-2">
            <span>Name:</span>
            <div className="border-b border-black flex-1 max-w-[260px]"></div>
          </div>
          <div className="flex items-end gap-2">
            <span>Roll Number:</span>
            <div className="border-b border-black flex-1 max-w-[230px]"></div>
          </div>
          <div className="flex items-end gap-2">
            <span>Class: {selectedClass}</span>
            <span className="ml-3">Section: _________</span>
          </div>
        </div>

        <div className="space-y-8">
          {sections.map((section, sIndex) => (
            <div key={sIndex} className="space-y-4">
              <div className="text-center">
                <h3 className="font-bold text-base md:text-lg">{section.title || `Section ${sIndex + 1}`}</h3>
                {section.instruction && <p className="text-xs md:text-sm italic mt-1">{section.instruction}</p>}
              </div>

              <div className="space-y-4">
                {section.questions?.map((q, qIndex) => (
                  <div key={qIndex} className="flex gap-2 text-xs md:text-sm leading-relaxed">
                    <span className="font-medium shrink-0">{qIndex + 1}.</span>
                    <div>
                      <span className="font-medium mr-2">[{q.difficulty || 'Moderate'}]</span>
                      <span>{q.text}</span>
                      <span className="font-bold ml-2">[{q.marks || 1} Marks]</span>

                      {q.options && q.options.length > 0 && (
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-4">
                          {q.options.map((opt: string, optIndex: number) => (
                            <div key={optIndex} className="text-gray-900">
                              <span className="font-medium mr-2">{String.fromCharCode(97 + optIndex)})</span>
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

        <div className="mt-12 text-center text-sm font-bold">End of Question Paper</div>
      </div>
    </div>
  );
}
