import { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ClaudiaIntroProps {
  onPreferenceSelected: (useVoice: boolean) => void;
}

export function ClaudiaIntro({ onPreferenceSelected }: ClaudiaIntroProps) {
  const [selected, setSelected] = useState<boolean | null>(null);

  const handleSelect = (useVoice: boolean) => {
    setSelected(useVoice);
    onPreferenceSelected(useVoice);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 transform transition-all duration-500">
      <div className="flex items-center gap-4 mb-8">
        <img
          src="https://storage.googleapis.com/msgsndr/5yufDyfhuTKFx8nCQCP6/media/67cf74cf3d10884c18db2871.webp"
          alt="Claudia AI Assistant"
          className="w-24 h-24 rounded-full object-cover border-2 border-primary"
        />
        <div>
          <h3 className="font-montserrat text-xl font-bold text-gray-900">
            Hi, I'm Claudia!
          </h3>
          <p className="font-open-sans text-gray-600">
            Your AI Assessment Assistant
          </p>
        </div>
      </div>
      
      <p className="text-lg font-open-sans text-gray-800 mb-8">
        Would you like me to read the questions and record your answers, or would you prefer to do it yourself?
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => handleSelect(true)}
          className={cn(
            "flex items-center justify-center gap-3 p-6 rounded-xl border-2 transition-all duration-200",
            selected === true
              ? "border-primary bg-primary bg-opacity-10 text-primary"
              : "border-gray-200 hover:border-primary hover:bg-gray-50"
          )}
        >
          <Volume2 className="w-6 h-6" />
          <div className="text-left">
            <p className="font-montserrat font-bold">Voice Mode</p>
            <p className="text-sm text-gray-600">I'll guide you through the assessment</p>
          </div>
        </button>

        <button
          onClick={() => handleSelect(false)}
          className={cn(
            "flex items-center justify-center gap-3 p-6 rounded-xl border-2 transition-all duration-200",
            selected === false
              ? "border-primary bg-primary bg-opacity-10 text-primary"
              : "border-gray-200 hover:border-primary hover:bg-gray-50"
          )}
        >
          <VolumeX className="w-6 h-6" />
          <div className="text-left">
            <p className="font-montserrat font-bold">Standard Mode</p>
            <p className="text-sm text-gray-600">Complete the assessment at your own pace</p>
          </div>
        </button>
      </div>

      {selected !== null && (
        <div className="mt-8 text-center">
          <button
            onClick={() => onPreferenceSelected(selected)}
            className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}