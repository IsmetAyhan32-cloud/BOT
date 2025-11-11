import React from 'react';
import { Brain, Loader2, Send } from 'lucide-react';

const ChatTab = ({ chatHistory, isLoading, currentInput, setCurrentInput, onSendMessage }) => (
  <div className="bg-slate-800/70 rounded-3xl p-6 shadow-2xl border border-slate-700">
    <h2 className="text-2xl font-bold mb-6 text-green-300 flex items-center space-x-3">
      <Brain className="w-6 h-6" />
      <span>AI Borsa Asistanı</span>
    </h2>

    <div className="h-[450px] overflow-y-auto p-4 space-y-4 bg-slate-900 rounded-xl mb-6 border border-slate-700">
      {chatHistory.map((message, index) => (
        <div key={message.id ?? index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div
            className={`max-w-[80%] p-3 rounded-xl shadow-lg ${
              message.role === 'user'
                ? 'bg-blue-600 text-white rounded-br-none'
                : 'bg-slate-700 text-slate-200 rounded-tl-none'
            }`}
          >
            <span className="font-semibold text-xs opacity-70 block mb-1">
              {message.role === 'user' ? 'Siz' : 'AI Asistan'}
            </span>
            <p className="whitespace-pre-wrap">{message.text}</p>
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex justify-start">
          <div className="p-3 rounded-xl bg-slate-700 text-slate-200 rounded-tl-none">
            <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" />
            <span className="text-sm">Yanıtlanyor...</span>
          </div>
        </div>
      )}
    </div>

    <form onSubmit={onSendMessage} className="flex space-x-4">
      <input
        type="text"
        value={currentInput}
        onChange={(event) => setCurrentInput(event.target.value)}
        placeholder="Sorunuzu buraya yazın..."
        className="flex-grow bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500 transition"
        disabled={isLoading}
      />
      <button
        type="submit"
        className={`p-3 rounded-xl transition duration-200 ${
          isLoading ? 'bg-slate-600 text-slate-400' : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
        disabled={isLoading}
      >
        <Send className="w-6 h-6" />
      </button>
    </form>
  </div>
);

export default ChatTab;
