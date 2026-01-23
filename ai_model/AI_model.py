"""
UNIFIED EGYPTIAN LEGAL CONTRACT ANALYZER
Combines RAG + Violation Detection Model in ONE file

FOLDER STRUCTURE:
AI_MODEL/
├── data/                      # Your 11 Egyptian law PDFs
├── legal_rag_db/             # Auto-created vector database
└── AI_model.py               # This file

USAGE:
    python AI_model.py
"""

import re
import warnings
import sys
from pathlib import Path
from typing import List, Dict, Tuple
from dataclasses import dataclass

warnings.filterwarnings('ignore')

# RAG imports
try:
    from langchain_community.document_loaders import PyPDFLoader, DirectoryLoader
    from langchain_text_splitters import RecursiveCharacterTextSplitter
    from langchain_community.vectorstores import Chroma
except ImportError as e:
    print(f"\n❌ ERROR: Missing required package!")
    print(f"   {e}")
    print(f"\n📦 Please install required packages:")
    print(f"   pip install langchain langchain-community chromadb pypdf")
    sys.exit(1)


# ============================================================================
# CONFIGURATION - All paths are relative to this script
# ============================================================================

SCRIPT_DIR = Path(__file__).parent.absolute()
DATA_FOLDER = SCRIPT_DIR / "data"
DB_PATH = SCRIPT_DIR / "legal_rag_db"


# ============================================================================
# DATA STRUCTURES
# ============================================================================

@dataclass
class ContractClause:
    """Represents a contract clause"""
    clause_id: str
    clause_text: str
    is_problematic: bool


@dataclass
class Law:
    """Represents a retrieved law"""
    law_number: int
    source_file: str
    page: str
    full_content: str


@dataclass
class Violation:
    """Represents a detected violation"""
    clause: ContractClause
    violated_law: Law
    confidence: float
    reason: str
    suggestion: str


# ============================================================================
# RAG SYSTEM
# ============================================================================

class EgyptianLegalRAG:
    """Retrieval-Augmented Generation system for Egyptian laws"""
    
    def __init__(self):
        self.data_folder = DATA_FOLDER
        self.db_path = DB_PATH
        self.vectorstore = None
    
    def initialize(self):
        """Load or build vector database"""
        
        print(f"\n🔍 Checking data folder: {self.data_folder}")
        
        # Check if data folder exists
        if not self.data_folder.exists():
            print(f"\n❌ ERROR: Data folder not found!")
            print(f"   Expected location: {self.data_folder}")
            print(f"\n📁 Please create a 'data' folder with your 11 Egyptian law PDFs")
            raise FileNotFoundError(f"Data folder not found: {self.data_folder}")
        
        # Check if PDFs exist
        pdf_files = list(self.data_folder.glob("*.pdf"))
        print(f"✅ Found {len(pdf_files)} PDF files in data folder")
        
        if len(pdf_files) == 0:
            print(f"\n❌ ERROR: No PDF files found in data folder!")
            print(f"   Please add your Egyptian law PDFs to: {self.data_folder}")
            raise FileNotFoundError("No PDF files in data folder")
        
        # Load or build database
        if self.db_path.exists():
            print("📂 Loading existing law database...")
            try:
                self.vectorstore = Chroma(persist_directory=str(self.db_path))
                print("✅ Database loaded successfully")
            except Exception as e:
                print(f"\n⚠️  Database load failed: {e}")
                print("🔄 Rebuilding database...")
                self._build_database()
        else:
            print("🔧 Building vector database (first time only)...")
            self._build_database()
        
        print()
    
    def _build_database(self):
        """Build the vector database from PDFs"""
        try:
            print(f"   📖 Reading PDFs from: {self.data_folder}")
            
            loader = DirectoryLoader(
                str(self.data_folder),
                glob="**/*.pdf",
                loader_cls=PyPDFLoader,
                show_progress=True
            )
            documents = loader.load()
            print(f"   ✅ Loaded {len(documents)} pages")
            
            splitter = RecursiveCharacterTextSplitter(
                chunk_size=1500,
                chunk_overlap=300
            )
            chunks = splitter.split_documents(documents)
            print(f"   ✅ Created {len(chunks)} chunks")
            
            print(f"   💾 Saving database to: {self.db_path}")
            self.vectorstore = Chroma.from_documents(
                documents=chunks,
                persist_directory=str(self.db_path)
            )
            print(f"   ✅ Database built successfully!")
        except Exception as e:
            print(f"\n❌ ERROR building database: {e}")
            raise
    
    def get_critical_laws(self):
        """Force retrieve critical Egyptian laws"""
        critical = []
        
        # Commercial Law Article 87
        results = self.vectorstore.similarity_search(
            "Article 87 Egyptian courts jurisdiction technology transfer", k=3
        )
        for doc in results:
            if 'article (87)' in doc.page_content.lower():
                critical.append(doc)
                break
        
        # Data Protection Laws
        critical.extend(self.vectorstore.similarity_search(
            "data protection personal data consent egypt", k=2
        ))
        
        # E-Signature Laws
        critical.extend(self.vectorstore.similarity_search(
            "electronic signature certification authority", k=2
        ))
        
        # Copyright Laws
        critical.extend(self.vectorstore.similarity_search(
            "copyright intellectual property derivative works", k=2
        ))
        
        return critical
    
    def extract_sections(self, contract: str) -> List[Dict]:
        """Extract contract sections by topic"""
        keywords = {
            'arbitration': ['dispute', 'arbitration', 'london', 'english law'],
            'data': ['data', 'privacy', 'collect', 'sell', 'monetize'],
            'signature': ['signature', 'electronic', 'typed name'],
            'ip': ['intellectual property', 'derivative', 'modification'],
        }
        
        sections = []
        clause_pattern = r'(\d+\.\d+)\s+(.+?)(?=\d+\.\d+|\Z)'
        clauses = re.findall(clause_pattern, contract, re.DOTALL)
        
        if clauses:
            for topic, kws in keywords.items():
                topic_clauses = [
                    f"{cid} {content}" 
                    for cid, content in clauses 
                    if any(kw in content.lower() for kw in kws)
                ]
                if topic_clauses:
                    sections.append({
                        'topic': topic,
                        'text': '\n'.join(topic_clauses)
                    })
        
        return sections if sections else [{'topic': 'full', 'text': contract}]
    
    def analyze(self, contract: str) -> List[Law]:
        """Main RAG analysis"""
        print("\n" + "="*80)
        print("🔍 RAG: RETRIEVING RELEVANT LAWS")
        print("="*80)
        
        # Get critical laws
        print("\n📚 Fetching mandatory Egyptian laws...")
        all_docs = self.get_critical_laws()
        
        # Get section-specific laws
        sections = self.extract_sections(contract)
        print(f"✂️  Extracted {len(sections)} contract sections")
        
        for section in sections:
            docs = self.vectorstore.similarity_search(section['text'], k=2)
            all_docs.extend(docs)
        
        # Deduplicate
        seen = set()
        unique_docs = []
        for doc in all_docs:
            key = (
                doc.metadata.get("source", ""),
                doc.metadata.get("page", ""),
                doc.page_content[:100]
            )
            if key not in seen:
                seen.add(key)
                unique_docs.append(doc)
        
        # Convert to Law objects
        laws = []
        for i, doc in enumerate(unique_docs[:12], 1):
            source = Path(doc.metadata.get("source", "Unknown")).name
            page = doc.metadata.get("page", "Unknown")
            
            if 'nda template' in source.lower():
                continue
            
            laws.append(Law(
                law_number=i,
                source_file=source,
                page=str(page),
                full_content=doc.page_content
            ))
        
        print(f"✅ Retrieved {len(laws)} relevant laws\n")
        return laws


# ============================================================================
# VIOLATION DETECTOR
# ============================================================================

class ViolationDetector:
    """Analyzes contract clauses against Egyptian laws"""
    
    def __init__(self):
        self.law_keywords = {
            'arbitration': ['arbitration', 'dispute', 'london', 'english law'],
            'e_signature': ['signature', 'electronic', 'typed name', 'scanned'],
            'data': ['data', 'collect', 'sell', 'monetize', 'singapore'],
            'ip': ['derivative', 'modification', 'enhancement', 'property'],
        }
    
    def extract_clauses(self, contract: str) -> List[ContractClause]:
        """Extract numbered clauses"""
        pattern = r'(\d+\.\d+)\s+(.+?)(?=\d+\.\d+|\Z)'
        matches = re.findall(pattern, contract, re.DOTALL)
        
        clauses = []
        for clause_id, content in matches:
            content = content.strip()
            if len(content) > 30:
                clauses.append(ContractClause(
                    clause_id=clause_id,
                    clause_text=content,
                    is_problematic=False
                ))
        
        return clauses
    
    def match_clause_to_laws(self, clause: ContractClause, laws: List[Law]) -> List[Tuple[Law, float]]:
        """Find relevant laws"""
        matches = []
        clause_lower = clause.clause_text.lower()
        
        for law in laws:
            relevance = 0.0
            law_lower = law.full_content.lower()
            
            for category, keywords in self.law_keywords.items():
                clause_has = any(kw in clause_lower for kw in keywords)
                law_has = any(kw in law_lower for kw in keywords)
                if clause_has and law_has:
                    relevance += 0.3
            
            if 'london' in clause_lower and 'article (87)' in law_lower:
                relevance += 0.6
            if 'sell' in clause_lower and 'data' in clause_lower:
                if 'data' in law.source_file.lower():
                    relevance += 0.6
            if 'typed name' in clause_lower and 'electronic' in law.source_file.lower():
                relevance += 0.6
            
            matches.append((law, min(relevance, 1.0)))
        
        matches.sort(key=lambda x: x[1], reverse=True)
        return [(law, score) for law, score in matches if score > 0.3]
    
    def detect_violation(self, clause: ContractClause, law: Law) -> Tuple[bool, str, str]:
        """Check if clause violates law"""
        clause_lower = clause.clause_text.lower()
        law_lower = law.full_content.lower()
        
        # ARBITRATION
        if 'london' in clause_lower and 'arbitration' in clause_lower:
            if 'egyptian courts' in law_lower or 'null and void' in law_lower:
                return (True,
                    "Arbitration in London violates Egyptian law requiring Egypt jurisdiction.",
                    "Change to: 'Disputes resolved through arbitration in Egypt under Egyptian law.'")
        
        if 'english law' in clause_lower and 'governed' in clause_lower:
            if 'egyptian law' in law_lower:
                return (True,
                    "English law violates Egyptian jurisdiction requirements.",
                    "Replace with: 'Governed by Egyptian law.'")
        
        # E-SIGNATURE
        if 'typed name' in clause_lower or 'scanned signature' in clause_lower:
            if 'electronic' in law.source_file.lower() and 'certification' in law_lower:
                return (True,
                    "Typed names/scanned signatures invalid. Egyptian law requires certified digital signatures.",
                    "Use certified digital signatures from Egyptian Electronic Signature Authority.")
        
        # DATA
        data_actions = ['sell', 'monetize', 'share', 'transfer']
        consent_issues = ['without consent', 'sole discretion', 'without permission']
        
        if 'data' in clause_lower:
            has_action = any(a in clause_lower for a in data_actions)
            lacks_consent = any(c in clause_lower for c in consent_issues)
            is_data_law = 'data' in law.source_file.lower() or 'information' in law.source_file.lower()
            
            if has_action and lacks_consent and is_data_law:
                return (True,
                    "Selling/monetizing data without consent violates Egyptian Data Protection Law.",
                    "Add: 'Requires explicit written consent. Cannot sell/transfer without authorization.'")
        
        if 'singapore' in clause_lower and 'data' in clause_lower:
            if 'egypt' in law_lower:
                return (True,
                    "Data outside Egypt requires compliance. Must appoint Egyptian representative.",
                    "Ensure: 'Foreign processors must appoint legal representative in Egypt.'")
        
        # IP
        if 'derivative' in clause_lower and 'automatically' in clause_lower:
            if 'copyright' in law.source_file.lower():
                return (True,
                    "Automatic derivative work transfer may violate copyright law.",
                    "Modify: 'Derivative works jointly owned or with fair compensation.'")
        
        return (False, "", "")
    
    def analyze(self, contract: str, laws: List[Law]) -> Dict:
        """Main violation detection"""
        print("\n" + "="*80)
        print("⚖️  MODEL: DETECTING VIOLATIONS")
        print("="*80)
        
        clauses = self.extract_clauses(contract)
        print(f"\n📄 Extracted {len(clauses)} clauses")
        
        violations = []
        
        for clause in clauses:
            relevant_laws = self.match_clause_to_laws(clause, laws)
            
            for law, relevance in relevant_laws:
                is_violation, reason, suggestion = self.detect_violation(clause, law)
                
                if is_violation:
                    violations.append(Violation(
                        clause=clause,
                        violated_law=law,
                        confidence=relevance,
                        reason=reason,
                        suggestion=suggestion
                    ))
        
        violated_clauses = len(set(v.clause.clause_id for v in violations))
        compliance = ((len(clauses) - violated_clauses) / len(clauses) * 100) if clauses else 100
        
        return {
            'total_clauses': len(clauses),
            'violations': violations,
            'compliance_score': compliance
        }


# ============================================================================
# OUTPUT
# ============================================================================

def print_results(rag_laws: List[Law], model_results: Dict):
    """Print report"""
    print("\n" + "="*80)
    print("📊 ANALYSIS COMPLETE - FINAL REPORT")
    print("="*80)
    
    print(f"\n📈 Summary:")
    print(f"   Laws Retrieved: {len(rag_laws)}")
    print(f"   Clauses Analyzed: {model_results['total_clauses']}")
    print(f"   Violations Found: {len(model_results['violations'])}")
    print(f"   Compliance Score: {model_results['compliance_score']:.1f}%")
    
    if model_results['violations']:
        print(f"\n{'='*80}")
        print("⚠️  VIOLATIONS DETECTED")
        print(f"{'='*80}")
        
        for i, v in enumerate(model_results['violations'], 1):
            print(f"\n{'█'*80}")
            print(f"🚨 VIOLATION #{i}")
            print(f"{'█'*80}")
            
            print(f"\n📍 Clause {v.clause.clause_id}:")
            # Show full clause text with proper wrapping
            clause_lines = v.clause.clause_text.split('\n')
            for line in clause_lines:
                if line.strip():
                    # Wrap long lines at 75 characters
                    words = line.split()
                    current_line = "   "
                    for word in words:
                        if len(current_line) + len(word) + 1 > 78:
                            print(current_line)
                            current_line = "   " + word
                        else:
                            current_line += (" " + word) if current_line.strip() else word
                    if current_line.strip():
                        print(current_line)
            
            print(f"\n❌ Violates Law #{v.violated_law.law_number}:")
            print(f"   📁 {v.violated_law.source_file} (Page {v.violated_law.page})")
            print(f"   🎯 Confidence: {v.confidence:.0%}")
            
            print(f"\n⚠️  Why: {v.reason}")
            print(f"\n💡 Fix: {v.suggestion}")
    else:
        print(f"\n✅ NO VIOLATIONS - Contract is compliant!")
    
    print("\n" + "="*80)


def get_contract_input():
    """Get contract from terminal"""
    print("="*80)
    print("📄 PASTE YOUR CONTRACT")
    print("="*80)
    print("Instructions:")
    print("  1. Paste contract")
    print("  2. Press Enter")
    print("  3. Type 'DONE' and Enter")
    print("-"*80)
    
    lines = []
    while True:
        try:
            line = input()
            if line.strip().upper() == "DONE":
                break
            lines.append(line)
        except (EOFError, KeyboardInterrupt):
            break
    
    return "\n".join(lines)


def main():
    """Main execution"""
    print("\n" + "="*80)
    print("🏛️  EGYPTIAN LEGAL CONTRACT ANALYZER")
    print("="*80)
    print(f"📂 Working Directory: {SCRIPT_DIR}")
    print(f"📁 Data Folder: {DATA_FOLDER}")
    print(f"🗄️  Database: {DB_PATH}")
    print("="*80)
    
    try:
        # Get contract
        contract = get_contract_input()
        
        if not contract.strip():
            print("\n⚠️  No contract provided. Exiting.")
            return
        
        # Initialize RAG
        rag = EgyptianLegalRAG()
        rag.initialize()
        
        # Run RAG
        laws = rag.analyze(contract)
        
        if not laws:
            print("\n⚠️  No laws retrieved. Check your database.")
            return
        
        # Run Model
        detector = ViolationDetector()
        results = detector.analyze(contract, laws)
        
        # Print Results
        print_results(laws, results)
        
    except FileNotFoundError as e:
        print(f"\n❌ {e}")
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    print("\n🚀 Starting Egyptian Legal Contract Analyzer...")
    main()
    print("\n✅ Program finished.\n")