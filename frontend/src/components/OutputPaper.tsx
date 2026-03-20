'use client';

import { Download } from 'lucide-react';
import { useAssignmentStore } from '@/store/useAssignmentStore';

export default function OutputPaper() {
  const { generatedPaper } = useAssignmentStore();

  // Trigger browser's native print dialog which allows saving as PDF
  const handleDownloadPDF = () => {
    window.print();
  };

  if (!generatedPaper) return null;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col shadow-xl rounded-3xl overflow-hidden mt-4 mb-20">
      
      {/* Dark Header Area */}
       <div className="bg-[#2d2d2d] text-white p-6 sm:px-8 sm:py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <p className="text-sm font-medium leading-relaxed max-w-lg">
          Certainly! Here is your customized Question Paper for your classes based on the provided requirements:
        </p>
        <button
          onClick={handleDownloadPDF}
          className="bg-white text-black px-4 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-gray-100 transition-colors shrink-0"
        >
          <Download size={16} />
          Download as PDF
        </button>
      </div>

      {/* The Printable Question Paper */}
      <div id="printable-paper" className="bg-white text-black p-8 sm:p-12">
        
        {/* School & Subject Header */}
        <div className="text-center space-y-1 mb-10">
          <h1 className="text-2xl font-bold">Delhi Public School, Sector-4, Bokaro</h1>
          <h2 className="text-lg font-medium">Subject: {generatedPaper.title}</h2>
          <h2 className="text-md">Class: 8th</h2> {/* Hardcoded for UI, can be dynamic later */}
        </div>

        {/* Exam Meta Info */}
        <div className="flex justify-between text-sm font-medium mb-6">
          <span>Time Allowed: 45 minutes</span>
          <span>Maximum Marks: {generatedPaper.totalMarks}</span>
        </div>

        <p className="text-sm mb-6 font-medium italic">
          All questions are compulsory unless stated otherwise.
        </p>

        {/* Student Information Lines */}
        <div className="space-y-4 text-sm mb-12">
          <div className="flex items-end gap-2">
            <span>Name:</span>
            <div className="border-b border-black flex-1 max-w-[250px]"></div>
          </div>
          <div className="flex items-end gap-2">
            <span>Roll Number:</span>
            <div className="border-b border-black flex-1 max-w-[200px]"></div>
          </div>
          <div className="flex items-end gap-2">
            <span>Class: _________</span>
            <span className="ml-2">Section: _________</span>
          </div>
        </div>

        {/* Dynamic AI Generated Sections & Questions */}
        <div className="space-y-10">
          {generatedPaper.sections?.map((section: any, sIndex: number) => (
            <div key={sIndex} className="space-y-6">
              <div className="text-center">
                <h3 className="font-bold text-lg">{section.title}</h3>
                {section.instruction && (
                  <p className="text-sm italic mt-1">{section.instruction}</p>
                )}
              </div>

              <div className="space-y-5">
                {section.questions?.map((q: any, qIndex: number) => (
                  <div key={qIndex} className="flex gap-2 text-sm leading-relaxed">
                    <span className="font-medium shrink-0">{qIndex + 1}.</span>
                    <div>
                      {/* Visual Difficulty Highlight */}
                      <span className={`font-semibold mr-2 ${
                        q.difficulty === 'Easy' ? 'text-green-700' :
                        q.difficulty === 'Moderate' ? 'text-yellow-600' :
                        'text-red-700'
                      }`}>
                        [{q.difficulty}]
                      </span>
                      
                      <span>{q.text}</span>
                      
                      <span className="font-bold ml-2">
                        [{q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}]
                      </span>
                      {/* --- ADD THIS NEW BLOCK --- */}
                      {q.options && q.options.length > 0 && (
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4">
                          {q.options.map((opt: string, optIndex: number) => (
                            <div key={optIndex} className="text-gray-800">
                              {/* Converts 0,1,2,3 to a), b), c), d) */}
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

        {/* Footer */}
        <div className="mt-16 text-center text-sm font-bold">
          End of Question Paper
        </div>
      </div>
    </div>
  );
}