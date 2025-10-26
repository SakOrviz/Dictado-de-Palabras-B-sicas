import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Category, Feedback } from '../types';
import { WORD_LISTS } from '../constants';
import { textToSpeech } from '../services/geminiService';
import { SpeakerIcon, CheckIcon, CrossIcon, NextIcon, HomeIcon, LoadingIcon } from './icons';

interface DictationViewProps {
  category: Category;
  onFinish: () => void;
}

const decode = (base64: string) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

const decodeAudioData = async (
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> => {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
};

const normalizeWord = (str: string) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
};

const DictationView: React.FC<DictationViewProps> = ({ category, onFinish }) => {
  const words = WORD_LISTS[category];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<Feedback>('idle');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [isFirstTry, setIsFirstTry] = useState(true);

  const audioContextRef = useRef<AudioContext | null>(null);
  const currentWord = words[currentIndex];

  const playAudio = useCallback(async (base64Audio: string) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    const ctx = audioContextRef.current;
    
    try {
      const decodedBytes = decode(base64Audio);
      const audioBuffer = await decodeAudioData(decodedBytes, ctx, 24000, 1);
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.start();
    } catch (e) {
      console.error("Error playing audio:", e);
      setError("No se pudo reproducir el audio.");
    }
  }, []);

  const speakCurrentWord = useCallback(async () => {
    setIsSpeaking(true);
    setError(null);
    try {
      const audioData = await textToSpeech(currentWord);
      await playAudio(audioData);
    } catch (e) {
      console.error(e);
      setError('Error al obtener el audio. Inténtalo de nuevo.');
    } finally {
      setIsSpeaking(false);
    }
  }, [currentWord, playAudio]);

  useEffect(() => {
    speakCurrentWord();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  const handleCheck = () => {
    const formattedInput = normalizeWord(userInput);
    const formattedWord = normalizeWord(currentWord);
    if (formattedInput === formattedWord) {
      setFeedback('correct');
      if (isFirstTry) {
        setScore(prev => prev + 10);
        setCorrectCount(prev => prev + 1);
      }
    } else {
      setFeedback('incorrect');
      if (isFirstTry) {
        setIncorrectCount(prev => prev + 1);
        setIsFirstTry(false);
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserInput('');
      setFeedback('idle');
      setIsFirstTry(true); // Reset for the next word
    } else {
      onFinish();
    }
  };
  
  const getBorderColor = () => {
    switch (feedback) {
      case 'correct': return 'border-green-500';
      case 'incorrect': return 'border-red-500';
      default: return 'border-slate-300';
    }
  };

  return (
    <div className="flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-slate-600">{category}</h3>
            <span className="text-slate-500 font-medium">{currentIndex + 1} / {words.length}</span>
        </div>

      <div className="w-full grid grid-cols-3 gap-4 text-center mb-6">
          <div className="bg-yellow-100 text-yellow-800 p-3 rounded-lg shadow-sm">
              <p className="font-bold text-2xl">{score}</p>
              <p className="text-sm font-semibold">Puntuación</p>
          </div>
          <div className="bg-green-100 text-green-800 p-3 rounded-lg shadow-sm">
              <p className="font-bold text-2xl">{correctCount}</p>
              <p className="text-sm font-semibold">Correctas</p>
          </div>
          <div className="bg-red-100 text-red-800 p-3 rounded-lg shadow-sm">
              <p className="font-bold text-2xl">{incorrectCount}</p>
              <p className="text-sm font-semibold">Incorrectas</p>
          </div>
      </div>

      <div className="w-full bg-slate-50 p-8 rounded-lg flex flex-col items-center gap-6">
        <button
          onClick={speakCurrentWord}
          disabled={isSpeaking}
          className="bg-sky-500 text-white rounded-full p-6 disabled:bg-sky-300 hover:bg-sky-600 focus:outline-none focus:ring-4 focus:ring-sky-300 transition-all duration-200"
        >
          {isSpeaking ? <LoadingIcon /> : <SpeakerIcon />}
        </button>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        
        <div className="w-full relative">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Escribe la palabra aquí..."
              disabled={feedback === 'correct'}
              className={`w-full p-4 text-2xl text-center border-2 rounded-lg transition-colors duration-300 focus:ring-2 focus:ring-sky-400 focus:outline-none ${getBorderColor()}`}
              onKeyPress={(e) => e.key === 'Enter' && feedback !== 'correct' && handleCheck()}
            />
            {feedback === 'correct' && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500"><CheckIcon /></div>}
            {feedback === 'incorrect' && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500"><CrossIcon /></div>}
        </div>
        
        {feedback === 'incorrect' && <p className="text-red-500 font-semibold">¡Inténtalo de nuevo!</p>}
        {feedback === 'correct' && (
            isFirstTry ?
            <p className="text-green-500 font-bold text-xl">¡Muy bien! ¡+10 puntos!</p> :
            <p className="text-blue-600 font-bold text-xl">¡Correcto! La palabra era "{currentWord}".</p>
        )}
      </div>

      <div className="w-full mt-6 flex flex-col sm:flex-row gap-4">
        {feedback === 'correct' ? (
          <button onClick={handleNext} className="w-full flex-1 bg-green-500 text-white font-bold py-4 px-6 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-300 transition duration-200 flex items-center justify-center gap-2">
            {currentIndex === words.length - 1 ? 'Finalizar' : 'Siguiente'}
            <NextIcon />
          </button>
        ) : (
          <button onClick={handleCheck} disabled={!userInput.length} className="w-full flex-1 bg-sky-500 text-white font-bold py-4 px-6 rounded-lg hover:bg-sky-600 disabled:bg-slate-300 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-sky-300 transition duration-200">
            Comprobar
          </button>
        )}
      </div>

      <button onClick={onFinish} className="mt-6 text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-2 transition-colors">
        <HomeIcon />
        Volver al menú
      </button>
    </div>
  );
};

export default DictationView;