
import React, { useState } from 'react';
import Header from '../../components/Company/PolicyConverter/Header';
import HistoryBar from '../../components/Company/PolicyConverter/HistoryBar';
import PolicyInputPanel from '../../components/Company/PolicyConverter/PolicyInputPanel';
import LogicOutputPanel from '../../components/Company/PolicyConverter/LogicOutputPanel';
import { type OCLGenerationResponse, LegalFramework, type PolicyInput, type HistoryItem } from '../../components/Company/PolicyConverter/Data/types';
import { convertPolicy } from '../../services/Policy/policyService';

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
      const result = await convertPolicy({
        policyName: activeInput.name,
        legalFramework: activeInput.framework,
        policyText: activeInput.text
      });
      setGeneratedResult(result);
      
      // Add to history
      const newHistoryItem: HistoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        name: activeInput.name,
        timestamp: Date.now(),
        result: result
      };
      setHistory(prev => [newHistoryItem, ...prev]);
    } catch (error: any) {
      console.error("Generation failed:", error);
      const errorMessage = error.message || "Failed to generate logic.";
      
      // If it's an authentication error, suggest logging in
      if (errorMessage.includes('session') || errorMessage.includes('logged in')) {
        if (confirm(`${errorMessage}\n\nWould you like to go to the login page?`)) {
          window.location.href = '/auth';
        }
      } else {
        alert(errorMessage);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async (saveData: {
    policyName: string;
    legalFramework: string;
    policyText: string;
    oclCode: string;
    explanation: string;
    articleRef: string;
  }) => {
    try {
      const { savePolicy } = await import('../../services/Policy/policyService');
      if (!generatedResult) {
        throw new Error('No generated result to save.');
      }

      await savePolicy({
        ...saveData,
        category: generatedResult.category,
        keywords: generatedResult.keywords ?? []
      });
      alert('Policy saved successfully!');
    } catch (error: any) {
      console.error("Save failed:", error);
      alert(error.message || "Failed to save policy.");
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
          onSave={handleSave}
          currentInput={inputs.find(i => i.text.trim().length > 0) || null}
        />
      </div>
    </div>
    </div>
  );
};

export default PolicyConverter;
