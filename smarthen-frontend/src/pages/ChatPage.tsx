import { useEffect, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import type { UIMessage } from 'ai';
import { Bot, Loader2, MessageSquare, Send, User, Wrench } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const suggestedPrompts = [
  'What is the current temperature in the farm?',
  'Show me the readings from the last 24 hours',
  'What are the current thresholds?',
  'When was the last feed dispensed?',
];

export const ChatPage = () => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const token = localStorage.getItem('smarthen-token');

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: `${API_URL}/ai/chat`,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    sendMessage({ text: trimmed });
    setInput('');
  };

  return (
    <div className="flex h-[calc(100dvh-8rem)] flex-col">
      <div className="mb-4 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary-600" />
        <h1 className="text-2xl font-bold text-neutral-900">Assistant</h1>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex min-h-full items-center justify-center px-4 py-6">
              <div className="w-full max-w-xl text-center">
                <div className="mx-auto mb-4 inline-flex rounded-full bg-primary-50 p-4">
                  <Bot className="h-8 w-8 text-primary-600" />
                </div>
                <h2 className="text-lg font-semibold text-neutral-900">Ask me about your farm</h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Sensor data, history, and configuration in plain English.
                </p>
                <div className="mt-6 grid gap-2 sm:grid-cols-2">
                  {suggestedPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleSend(prompt)}
                      className="rounded-lg border border-neutral-200 px-4 py-2.5 text-left text-sm text-neutral-700 transition-colors hover:border-primary-300 hover:bg-primary-50"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 text-sm text-neutral-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Thinking...
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          )}
        </div>

        {error && (
          <div className="border-t border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error.message || 'Something went wrong. Please try again.'}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex items-center gap-2 border-t border-neutral-200 p-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the farm..."
            disabled={isLoading}
            className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-neutral-50"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </Card>
    </div>
  );
};

interface MessageBubbleProps {
  message: UIMessage;
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUser ? 'bg-neutral-200' : 'bg-primary-100'
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4 text-neutral-600" />
        ) : (
          <Bot className="h-4 w-4 text-primary-600" />
        )}
      </div>

      <div className={`flex max-w-[80%] flex-col gap-2 ${isUser ? 'items-end' : ''}`}>
        {message.parts.map((part, idx) => {
          if (part.type === 'text') {
            return (
              <div
                key={idx}
                className={`rounded-lg px-3 py-2 text-sm ${
                  isUser ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-900'
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap">{part.text}</p>
                ) : (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      hr: () => <hr className="my-3 border-neutral-300" />,
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      strong: ({ children }) => (
                        <strong className="font-semibold text-neutral-900">{children}</strong>
                      ),
                      ul: ({ children }) => (
                        <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>
                      ),
                      li: ({ children }) => <li>{children}</li>,
                      code: ({ children }) => (
                        <code className="rounded bg-neutral-200 px-1 py-0.5 text-xs">
                          {children}
                        </code>
                      ),
                      a: ({ href, children }) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-700 underline"
                        >
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {part.text}
                  </ReactMarkdown>
                )}
              </div>
            );
          }

          if (part.type.startsWith('tool-')) {
            const toolName = part.type.slice(5).replace(/_/g, ' ');
            return (
              <div
                key={idx}
                className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700"
              >
                <Wrench className="h-3 w-3" />
                {toolName}
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
};
