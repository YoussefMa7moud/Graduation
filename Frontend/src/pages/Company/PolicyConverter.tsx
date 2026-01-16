
import React, { useState } from 'react';
import Header from '../../components/Company/PolicyConverter/Header';
import HistoryBar from '../../components/Company/PolicyConverter/HistoryBar';
import PolicyInputPanel from '../../components/Company/PolicyConverter/PolicyInputPanel';
import LogicOutputPanel from '../../components/Company/PolicyConverter/LogicOutputPanel';
import { type OCLGenerationResponse, LegalFramework, type PolicyInput, type HistoryItem } from '../../components/Company/PolicyConverter/Data/types';
import { generateOCLLogic } from '../../services/geminiService';

const PolicyConverter: React.FC = () => {
  const [inputs, setInputs] = useState<PolicyInput[]>([
    { id: '1', name: 'Standard Return Policy', framework: LegalFramework.EgyptianCivilCode, text: 'No return after 14 days of purchase.' }
  ]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<OCLGenerationResponse | null>(null);

  const handleGenerate = async () => {
    // For simplicity, we generate logic for the first valid input in the list
    const activeInput = inputs.find(i => i.text.trim().length > 0);
    if (!activeInput) return;
    
    setIsGenerating(true);
    try {
      const result = await generateOCLLogic(activeInput.name, activeInput.framework, activeInput.text);
      setGeneratedResult(result);
      
      // Add to history
      const newHistoryItem: HistoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        name: activeInput.name,
        timestamp: Date.now(),
        result: result
      };
      setHistory(prev => [newHistoryItem, ...prev]);
    } catch (error) {
      console.error("Generation failed:", error);
      alert("Failed to generate logic.");
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const selectHistoryItem = (item: HistoryItem) => {
    setGeneratedResult(item.result);
  };

  return (
    
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-900/50">
       <div className="container page-fade-in">
      <Header />
      <HistoryBar 
        items={history} 
        onDelete={deleteHistoryItem} 
        onSelect={selectHistoryItem} 
      />
      
      <div className="flex-1 flex overflow-hidden">
        <PolicyInputPanel 
          inputs={inputs}
          setInputs={setInputs}
          isGenerating={isGenerating}
          onGenerate={handleGenerate}
        />

        <LogicOutputPanel 
          result={generatedResult}
          isGenerating={isGenerating}
          onDiscard={() => setGeneratedResult(null)}
        />
      </div>
    </div>
    </div>
  );
};

export default PolicyConverter;
