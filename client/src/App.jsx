import React, { useState } from 'react';
import axios from 'axios';
import { AlertCircle, ChevronDown, ChevronRight, Activity, Database, Server } from 'lucide-react';

function TreeViewer({ tree, name }) {
  const [isOpen, setIsOpen] = useState(true);
  const keys = Object.keys(tree);

  if (keys.length === 0) {
    return (
      <div className="ml-6 text-gray-400 py-1 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-accent"></div> {name} (leaf)
      </div>
    );
  }

  return (
    <div className="ml-6">
      <div 
        className="flex items-center gap-2 cursor-pointer py-1 hover:text-white transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <span className="font-semibold text-primary">{name}</span>
      </div>
      {isOpen && (
        <div className="border-l border-gray-700 ml-2 pl-2 mt-1">
          {keys.map((key) => (
            <TreeViewer key={key} name={key} tree={tree[key]} />
          ))}
        </div>
      )}
    </div>
  );
}

function App() {
  const [input, setInput] = useState('{\n  "data": [\n    "A->B", "A->C", "B->D", "C->E", "E->F",\n    "X->Y", "Y->Z", "Z->X",\n    "P->Q", "Q->R",\n    "G->H", "G->H", "G->I",\n    "hello", "1->2", "A->"\n  ]\n}');
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      setResponse(null);
      
      let parsed;
      try {
        parsed = JSON.parse(input);
      } catch (err) {
        throw new Error("Invalid JSON format");
      }

      const res = await axios.post('http://localhost:3001/bfhl', parsed);
      setResponse(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-gray-300 p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex items-center gap-4 pb-6 border-b border-gray-800">
          <div className="p-3 bg-surface rounded-xl border border-gray-700">
            <Activity className="text-accent" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Graph Analyzer</h1>
            <p className="text-gray-500 mt-1">Hierarchical Tree & Cycle Detection Engine</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Input Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Database size={20} className="text-primary"/> Input Payload
              </h2>
            </div>
            <div className="bg-surface rounded-xl border border-gray-800 overflow-hidden shadow-2xl transition-all focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50">
              <div className="bg-gray-900/50 px-4 py-2 border-b border-gray-800 text-xs font-mono text-gray-500 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                <span className="ml-2">POST /bfhl</span>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full h-80 bg-transparent text-gray-300 p-4 font-mono text-sm resize-none focus:outline-none"
                spellCheck="false"
              />
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-primary hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Server size={18} />
              )}
              {loading ? 'Processing...' : 'Analyze Graph'}
            </button>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-start gap-3">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Output Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Activity size={20} className="text-accent"/> Analysis Results
            </h2>
            
            {response ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-surface p-4 rounded-xl border border-gray-800">
                    <div className="text-xs text-gray-500 mb-1">Total Trees</div>
                    <div className="text-2xl font-bold text-white">{response.summary.total_trees}</div>
                  </div>
                  <div className="bg-surface p-4 rounded-xl border border-gray-800">
                    <div className="text-xs text-gray-500 mb-1">Total Cycles</div>
                    <div className="text-2xl font-bold text-white">{response.summary.total_cycles}</div>
                  </div>
                  <div className="bg-surface p-4 rounded-xl border border-gray-800">
                    <div className="text-xs text-gray-500 mb-1">Largest Root</div>
                    <div className="text-2xl font-bold text-primary">{response.summary.largest_tree_root || 'N/A'}</div>
                  </div>
                </div>

                {/* Meta Information */}
                <div className="bg-surface rounded-xl border border-gray-800 p-4 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">User ID</span>
                    <span className="text-gray-300 font-mono">{response.user_id}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Email</span>
                    <span className="text-gray-300">{response.email_id}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Roll Number</span>
                    <span className="text-gray-300 font-mono">{response.college_roll_number}</span>
                  </div>
                </div>

                {/* Arrays */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface rounded-xl border border-gray-800 p-4">
                    <div className="text-sm text-gray-400 mb-2 font-medium">Invalid Entries</div>
                    {response.invalid_entries.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {response.invalid_entries.map((v, i) => (
                          <span key={i} className="px-2 py-1 bg-red-500/10 text-red-400 text-xs rounded border border-red-500/20">{v}</span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600">None</div>
                    )}
                  </div>
                  <div className="bg-surface rounded-xl border border-gray-800 p-4">
                    <div className="text-sm text-gray-400 mb-2 font-medium">Duplicate Edges</div>
                    {response.duplicate_edges.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {response.duplicate_edges.map((v, i) => (
                          <span key={i} className="px-2 py-1 bg-yellow-500/10 text-yellow-400 text-xs rounded border border-yellow-500/20">{v}</span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600">None</div>
                    )}
                  </div>
                </div>

                {/* Hierarchies */}
                <div className="bg-surface rounded-xl border border-gray-800 overflow-hidden">
                  <div className="bg-gray-900/50 px-4 py-3 border-b border-gray-800 text-sm font-medium text-gray-300">
                    Forest Visualization
                  </div>
                  <div className="p-4 space-y-6">
                    {response.hierarchies.length > 0 ? response.hierarchies.map((h, idx) => (
                      <div key={idx} className="bg-gray-900/30 rounded-lg p-4 border border-gray-800/50">
                        <div className="flex items-center justify-between mb-3 border-b border-gray-800/50 pb-2">
                          <span className="text-white font-bold flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-accent"></span> Root: {h.root}
                          </span>
                          {h.has_cycle ? (
                            <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full border border-orange-500/20">Cycle Detected</span>
                          ) : (
                            <span className="text-xs text-gray-500">Depth: {h.depth}</span>
                          )}
                        </div>
                        <div className="font-mono text-sm overflow-x-auto">
                          {h.has_cycle ? (
                            <div className="text-gray-500 italic ml-2">Cyclic structure (no tree)</div>
                          ) : (
                            <TreeViewer name={h.root} tree={h.tree[h.root]} />
                          )}
                        </div>
                      </div>
                    )) : (
                      <div className="text-sm text-gray-500 text-center py-4">No hierarchies detected</div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-gray-600 border border-dashed border-gray-800 rounded-xl bg-surface/30">
                <Database size={32} className="mb-3 opacity-50" />
                <p>Submit payload to view results</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
