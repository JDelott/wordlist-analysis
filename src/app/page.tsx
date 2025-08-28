'use client';

import { useState } from 'react';

interface AnalysisResult {
  totalWords: number;
  uniqueWords: number;
  bip39Matches: string[];
  matchCount: number;
  entropy: string;
  sequences?: SequenceResult[];
}

interface SequenceResult {
  sequence: string[];
  startPosition: number;
  context: string;
  bookLocation?: {
    line: number;
    chapter: string;
    pageContext: string;
  };
}

interface TestResult {
  phrase: string;
  totalWords: number;
  bip39Matches: string[];
  nonMatches: string[];
  matchPercentage: number;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  sequence: SequenceResult | null;
}

interface TestResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: TestResult | null;
}

const LocationModal = ({ isOpen, onClose, sequence }: ModalProps) => {
  if (!isOpen || !sequence) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Sequence Location in Book</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 rounded">
            <h4 className="font-semibold text-blue-800">Sequence Found:</h4>
            <p className="font-mono text-lg bg-yellow-100 p-2 rounded mt-1">
              {sequence.sequence.join(' ')}
            </p>
            <p className="text-sm text-blue-600 mt-1">
              Length: {sequence.sequence.length} words | Position: {sequence.startPosition}
            </p>
          </div>

          <div className="p-3 bg-gray-50 rounded">
            <h4 className="font-semibold text-gray-800">Context in Book:</h4>
            <p className="text-sm mt-1 leading-relaxed">
              ...{sequence.context}...
            </p>
          </div>

          {sequence.bookLocation && (
            <div className="p-3 bg-green-50 rounded">
              <h4 className="font-semibold text-green-800">Book Location:</h4>
              <p className="text-sm text-green-700 mt-1">
                <strong>Chapter:</strong> {sequence.bookLocation.chapter}
              </p>
              <p className="text-sm text-green-700">
                <strong>Approximate Line:</strong> {sequence.bookLocation.line}
              </p>
              <div className="mt-2 p-2 bg-white rounded border text-xs">
                <p className="font-mono leading-relaxed">
                  {sequence.bookLocation.pageContext}
                </p>
              </div>
            </div>
          )}

          <div className="p-3 bg-red-50 rounded">
            <h4 className="font-semibold text-red-800">Security Impact:</h4>
            <p className="text-sm text-red-700 mt-1">
              This exact sequence could be used as part of a seed phrase attack vector. 
              An attacker knowing someone uses this book could focus on sequences like this 
              to dramatically reduce the brute force search space.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button 
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const TestResultModal = ({ isOpen, onClose, result }: TestResultModalProps) => {
  if (!isOpen || !result) return null;

  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return 'text-red-600 bg-red-50';
    if (percentage >= 50) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };

  const getSecurityLevel = (percentage: number) => {
    if (percentage >= 80) return { level: 'HIGH RISK', color: 'text-red-600' };
    if (percentage >= 50) return { level: 'MEDIUM RISK', color: 'text-orange-600' };
    return { level: 'LOW RISK', color: 'text-green-600' };
  };

  const security = getSecurityLevel(result.matchPercentage);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">Phrase Analysis Results</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Test Phrase */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Test Phrase:</h4>
            <p className="font-mono text-lg bg-white p-3 rounded border">
              {result.phrase}
            </p>
          </div>

          {/* Overall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{result.totalWords}</div>
              <div className="text-sm text-blue-800">Total Words</div>
            </div>
            <div className={`p-4 rounded-lg text-center ${getMatchColor(result.matchPercentage)}`}>
              <div className="text-2xl font-bold">{result.bip39Matches.length}</div>
              <div className="text-sm">BIP39 Matches</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-gray-600">{result.nonMatches.length}</div>
              <div className="text-sm text-gray-800">Non-Matches</div>
            </div>
          </div>

          {/* Match Percentage */}
          <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold">BIP39 Match Rate</h4>
              <span className={`font-bold text-lg ${security.color}`}>
                {security.level}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-6 mb-2">
              <div 
                className={`h-6 rounded-full transition-all duration-500 ${
                  result.matchPercentage >= 80 ? 'bg-red-500' :
                  result.matchPercentage >= 50 ? 'bg-orange-500' : 'bg-green-500'
                }`}
                style={{ width: `${result.matchPercentage}%` }}
              ></div>
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold">{result.matchPercentage.toFixed(1)}%</span>
              <span className="text-sm text-gray-600 ml-2">of words match BIP39</span>
            </div>
          </div>

          {/* Word Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* BIP39 Matches */}
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-3">
                ✅ BIP39 Matches ({result.bip39Matches.length})
              </h4>
              {result.bip39Matches.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {result.bip39Matches.map((word, index) => (
                    <span 
                      key={index} 
                      className="bg-green-200 text-green-800 px-2 py-1 rounded font-mono text-sm"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-green-700 text-sm">No words match the BIP39 wordlist</p>
              )}
            </div>

            {/* Non-matches */}
            <div className="p-4 bg-red-50 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-3">
                ❌ Not in BIP39 ({result.nonMatches.length})
              </h4>
              {result.nonMatches.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {result.nonMatches.map((word, index) => (
                    <span 
                      key={index} 
                      className="bg-red-200 text-red-800 px-2 py-1 rounded font-mono text-sm"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-red-700 text-sm">All words match the BIP39 wordlist!</p>
              )}
            </div>
          </div>

          {/* Security Assessment */}
          <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
            <h4 className="font-semibold text-yellow-800 mb-2">Security Assessment:</h4>
            <div className="text-sm text-yellow-700 space-y-1">
              {result.matchPercentage === 100 ? (
                <>
                  <p>🚨 <strong>CRITICAL:</strong> All words in this phrase are valid BIP39 words!</p>
                  <p>This phrase could potentially be used as a seed phrase, making it extremely vulnerable if an attacker knows the source.</p>
                </>
              ) : result.matchPercentage >= 80 ? (
                <>
                  <p>⚠️ <strong>HIGH RISK:</strong> Most words match BIP39 wordlist.</p>
                  <p>An attacker could easily modify this phrase to create a valid seed phrase.</p>
                </>
              ) : result.matchPercentage >= 50 ? (
                <>
                  <p>⚡ <strong>MEDIUM RISK:</strong> Significant portion matches BIP39.</p>
                  <p>Could be used as a starting point for seed phrase generation.</p>
                </>
              ) : (
                <>
                  <p>✅ <strong>LOW RISK:</strong> Few words match BIP39 wordlist.</p>
                  <p>This phrase would not be practical for seed phrase generation.</p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button 
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [testPhrase, setTestPhrase] = useState('');
  const [sequenceLength, setSequenceLength] = useState(4);
  const [findingSequences, setFindingSequences] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSequence, setSelectedSequence] = useState<SequenceResult | null>(null);
  const [testResultModalOpen, setTestResultModalOpen] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const findBookLocation = async (sequence: SequenceResult): Promise<SequenceResult> => {
    try {
      const response = await fetch('/moby_dick.txt');
      const bookText = await response.text();
      const lines = bookText.split('\n');
      
      // Find the line containing this sequence
      const sequenceText = sequence.sequence.join(' ');
      let foundLine = -1;
      let chapter = "Unknown";
      
      // Look for the sequence in the text
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].toLowerCase().replace(/[^\w\s]/g, ' ');
        if (line.includes(sequenceText)) {
          foundLine = i + 1;
          
          // Look backwards for the most recent chapter
          for (let j = i; j >= 0; j--) {
            if (lines[j].includes('CHAPTER')) {
              chapter = lines[j].trim();
              break;
            }
          }
          break;
        }
      }
      
      // Get more context around the found location
      let pageContext = "";
      if (foundLine > 0) {
        const contextStart = Math.max(0, foundLine - 6);
        const contextEnd = Math.min(lines.length, foundLine + 5);
        pageContext = lines.slice(contextStart, contextEnd)
          .map((line, idx) => {
            const lineNum = contextStart + idx + 1;
            const prefix = lineNum === foundLine ? ">>> " : "    ";
            return `${prefix}${lineNum}: ${line}`;
          })
          .join('\n');
      }

      return {
        ...sequence,
        bookLocation: {
          line: foundLine,
          chapter,
          pageContext
        }
      };
    } catch (error) {
      console.error('Error finding book location:', error);
      return sequence;
    }
  };

  const openSequenceModal = async (sequence: SequenceResult) => {
    console.log('Opening modal for sequence:', sequence.sequence.join(' '));
    const enrichedSequence = await findBookLocation(sequence);
    setSelectedSequence(enrichedSequence);
    setModalOpen(true);
  };

  const analyzeBook = async (bookFile: string) => {
    setLoading(true);
    try {
      // Fetch both files
      const [bookResponse, bip39Response] = await Promise.all([
        fetch(`/${bookFile}`),
        fetch('/bip39.txt')
      ]);

      const bookText = await bookResponse.text();
      const bip39Text = await bip39Response.text();

      // Parse BIP39 words (one per line)
      const bip39Words = new Set(
        bip39Text
          .split('\n')
          .map(line => line.trim().toLowerCase())
          .filter(word => word.length > 0)
      );

      console.log('BIP39 words loaded:', bip39Words.size);

      // Extract words from book
      const bookWords = bookText
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
        .split(/\s+/)
        .filter(word => word.length > 0);

      console.log('Total book words:', bookWords.length);

      const uniqueBookWords = [...new Set(bookWords)];
      console.log('Unique book words:', uniqueBookWords.length);

      // Filter words that match BIP39
      const bip39Matches = uniqueBookWords.filter(word => bip39Words.has(word));
      console.log('BIP39 matches found:', bip39Matches.length);
      console.log('First 20 BIP39 matches:', bip39Matches.slice(0, 20));

      // Calculate entropy reduction
      const originalEntropy = `2^${2048} (full BIP39)`;
      const reducedEntropy = `2^${bip39Matches.length} (${Math.pow(2, bip39Matches.length).toLocaleString()} combinations for 24 words)`;

      setAnalysisResult({
        totalWords: bookWords.length,
        uniqueWords: uniqueBookWords.length,
        bip39Matches,
        matchCount: bip39Matches.length,
        entropy: `Original: ${originalEntropy} → Reduced: ${reducedEntropy}`
      });

    } catch (error) {
      console.error('Error analyzing book:', error);
    } finally {
      setLoading(false);
    }
  };

  const findBip39Sequences = async (bookFile: string, minLength: number = 4) => {
    setFindingSequences(true);
    try {
      // Fetch both files
      const [bookResponse, bip39Response] = await Promise.all([
        fetch(`/${bookFile}`),
        fetch('/bip39.txt')
      ]);

      const bookText = await bookResponse.text();
      const bip39Text = await bip39Response.text();

      // Parse BIP39 words (one per line)
      const bip39Words = new Set(
        bip39Text
          .split('\n')
          .map(line => line.trim().toLowerCase())
          .filter(word => word.length > 0)
      );

      // Extract words from book with positions
      const bookWords = bookText
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 0);

      console.log('Starting sequence search with minLength:', minLength);
      console.log('Total words to scan:', bookWords.length);

      // Find sequences of consecutive BIP39 words
      const sequences: SequenceResult[] = [];
      let foundCount = 0;
      
      for (let i = 0; i < bookWords.length; i++) {
        if (bip39Words.has(bookWords[i])) {
          // Found a BIP39 word, now check how many consecutive ones we can find
          const sequence = [bookWords[i]];
          let j = i + 1;
          
          while (j < bookWords.length && bip39Words.has(bookWords[j])) {
            sequence.push(bookWords[j]);
            j++;
          }
          
          // Log all sequences for debugging
          if (sequence.length >= 2) {
            console.log(`Found ${sequence.length}-word sequence at position ${i}:`, sequence.join(' '));
          }
          
          // Only keep sequences of minimum length
          if (sequence.length >= minLength) {
            foundCount++;
            // Get some context around the sequence
            const contextStart = Math.max(0, i - 5);
            const contextEnd = Math.min(bookWords.length, j + 5);
            const context = bookWords.slice(contextStart, contextEnd).join(' ');
            
            sequences.push({
              sequence,
              startPosition: i,
              context
            });
            
            console.log(`✅ Sequence #${foundCount} (${sequence.length} words):`, sequence.join(' '));
            console.log('   Context:', context);
            
            // Skip ahead to avoid overlapping sequences
            i = j - 1;
          }
        }
      }

      console.log(`Total sequences found with ${minLength}+ words:`, sequences.length);

      // Sort by sequence length (longest first)
      sequences.sort((a, b) => b.sequence.length - a.sequence.length);

      // Log the best sequences
      console.log('Top 10 longest sequences:');
      sequences.slice(0, 10).forEach((seq, idx) => {
        console.log(`${idx + 1}. [${seq.sequence.length} words]: ${seq.sequence.join(' ')}`);
      });

      setAnalysisResult(prev => prev ? {
        ...prev,
        sequences: sequences.slice(0, 50) // Limit to top 50 sequences
      } : null);

    } catch (error) {
      console.error('Error finding sequences:', error);
    } finally {
      setFindingSequences(false);
    }
  };

  const testPhraseFilter = async () => {
    if (!testPhrase) return;
    
    const words = testPhrase.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    console.log('Testing phrase:', testPhrase);
    console.log('Words to test:', words);
    
    try {
      const response = await fetch('/bip39.txt');
      const bip39Text = await response.text();
      const bip39Words = new Set(
        bip39Text
          .split('\n')
          .map(line => line.trim().toLowerCase())
          .filter(word => word.length > 0)
      );

      const matches = words.filter(word => bip39Words.has(word));
      const nonMatches = words.filter(word => !bip39Words.has(word));
      const matchPercentage = (matches.length / words.length) * 100;
      
      console.log('BIP39 matches:', matches);
      console.log('Non-matches:', nonMatches);
      
      const result: TestResult = {
        phrase: testPhrase,
        totalWords: words.length,
        bip39Matches: matches,
        nonMatches: nonMatches,
        matchPercentage: matchPercentage
      };

      setTestResult(result);
      setTestResultModalOpen(true);

    } catch (error) {
      console.error('Error testing phrase:', error);
    }
  };

  const testMobyDickSentence = () => {
    setTestPhrase('little or no money in my purse and nothing particular to interest me');
    setTimeout(() => testPhraseFilter(), 100);
  };

  const findAndTestBestSequence = () => {
    if (analysisResult?.sequences && analysisResult.sequences.length > 0) {
      // Find the longest sequence that's closest to 12 words
      const bestSequence = analysisResult.sequences.find(seq => seq.sequence.length >= 12) 
        || analysisResult.sequences[0]; // fallback to longest available
      
      if (bestSequence) {
        const testPhrase = bestSequence.sequence.slice(0, 12).join(' '); // Take first 12 words
        console.log('Testing best sequence:', testPhrase);
        setTestPhrase(testPhrase);
        setTimeout(() => testPhraseFilter(), 100);
      }
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">BIP39 Wordlist Analysis</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Book Analysis</h2>
          <p className="text-gray-600 mb-4">
            Analyze how many words from classic books match the BIP39 wordlist, 
            demonstrating how book-based seed phrases reduce entropy space.
          </p>
          
          <div className="flex gap-4 mb-4 flex-wrap">
            <button 
              onClick={() => analyzeBook('moby_dick.txt')}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded"
            >
              {loading ? 'Analyzing...' : 'Analyze Moby Dick'}
            </button>
            
            <div className="flex items-center gap-2">
              <label className="text-sm">Min sequence length:</label>
              <input
                type="number"
                value={sequenceLength}
                onChange={(e) => setSequenceLength(parseInt(e.target.value) || 4)}
                min="2"
                max="24"
                className="w-16 px-2 py-1 border rounded text-sm"
              />
              <button 
                onClick={() => findBip39Sequences('moby_dick.txt', sequenceLength)}
                disabled={findingSequences || !analysisResult}
                className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-4 py-2 rounded text-sm"
              >
                {findingSequences ? 'Finding...' : 'Find Sequences'}
              </button>
            </div>
          </div>

          {analysisResult && (
            <div className="mt-6 p-4 bg-gray-100 rounded">
              <h3 className="font-semibold mb-2">Analysis Results:</h3>
              <ul className="space-y-1 text-sm">
                <li><strong>Total words in book:</strong> {analysisResult.totalWords.toLocaleString()}</li>
                <li><strong>Unique words:</strong> {analysisResult.uniqueWords.toLocaleString()}</li>
                <li><strong>BIP39 matches:</strong> {analysisResult.matchCount}</li>
                <li><strong>Entropy:</strong> {analysisResult.entropy}</li>
              </ul>
              
              {analysisResult.sequences && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Consecutive BIP39 Sequences Found ({analysisResult.sequences.length})</h4>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {analysisResult.sequences.map((seq, index) => (
                      <div key={index} className="p-2 bg-white rounded border-l-4 border-green-500">
                        <div className="font-mono text-sm">
                          <span className="font-bold text-green-600">
                            [{seq.sequence.length} words]:
                          </span>{' '}
                          <span className="bg-yellow-100 px-1 rounded">
                            {seq.sequence.join(' ')}
                          </span>
                          <button 
                            onClick={() => openSequenceModal(seq)}
                            className="ml-2 text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                          >
                            📍 Find in Book
                          </button>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          Context: ...{seq.context}...
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-50 rounded">
                    <h5 className="font-medium text-blue-800">Security Impact:</h5>
                    <p className="text-sm text-blue-700">
                      Found {analysisResult.sequences.length} sequences of {sequenceLength}+ consecutive BIP39 words. 
                      These represent potential seed phrase patterns that maintain word order from the original text,
                      making brute force attacks more feasible by preserving positional constraints.
                    </p>
                  </div>
                </div>
              )}
              
              <details className="mt-4">
                <summary className="cursor-pointer font-medium">All BIP39 Words Found ({analysisResult.matchCount})</summary>
                <div className="mt-2 p-2 bg-white rounded max-h-40 overflow-y-auto">
                  <div className="text-xs grid grid-cols-4 gap-1">
                    {analysisResult.bip39Matches.map((word, index) => (
                      <span key={index} className="bg-blue-100 px-1 py-0.5 rounded">{word}</span>
                    ))}
                  </div>
                </div>
              </details>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Phrase Filter</h2>
          <p className="text-gray-600 mb-4">
            Enter a test phrase to see which words match the BIP39 wordlist:
          </p>
          
          <div className="mb-4 space-y-2">
            <div className="flex gap-2 flex-wrap">
              <button 
                onClick={testMobyDickSentence}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
              >
                Test Moby Dick Sentence
              </button>
              
              <button 
                onClick={findAndTestBestSequence}
                disabled={!analysisResult?.sequences || analysisResult.sequences.length === 0}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white px-4 py-2 rounded"
              >
                Test Best Found Sequence
              </button>
            </div>
            
            <p className="text-xs text-gray-500">
              Original test: &quot;little or no money in my purse and nothing particular to interest me&quot;
            </p>
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={testPhrase}
              onChange={(e) => setTestPhrase(e.target.value)}
              placeholder="Enter test phrase or click buttons above"
              className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              onClick={testPhraseFilter}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              Analyze Phrase
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            This tool demonstrates how using literary works as entropy sources 
            for cryptocurrency seed phrases significantly reduces the security space.
            The sequence finder shows how word order constraints further limit possibilities.
            <br />
            <strong>Check the browser console for detailed logs!</strong>
          </p>
        </div>
      </div>

      <LocationModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        sequence={selectedSequence}
      />

      <TestResultModal 
        isOpen={testResultModalOpen}
        onClose={() => setTestResultModalOpen(false)}
        result={testResult}
      />
    </div>
  );
}
