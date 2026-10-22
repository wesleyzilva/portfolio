import React from 'react';
import { AGENT_NAME, askAgent } from './agent';
import { suggestedQuestions } from './knowledge';

const WELCOME = {
  id: 'welcome',
  role: 'agent',
  text: `Hi, I'm ${AGENT_NAME}. Ask me anything about Wesley's experience, projects, skills, agentic and AI work, education, scheduling an interview, or what he is curious about, in English.`,
  bullets: [],
  sources: [],
};

const MOBILE_QUERY = '(max-width: 720px)';

function AgentMessage({ message, onOpenSource, onAsk, onDownload, canAsk }) {
  const hasMatch = typeof message.matchPercent === 'number';

  return (
    <div className="chat-msg chat-msg-agent">
      {hasMatch ? (
        <span
          className="chat-match"
          title="Share of the topics in your question covered by Wesley's CV. Adjacent experience counts as half."
        >
          {message.matchPercent}% match
        </span>
      ) : null}
      <p>{message.text}</p>
      {message.downloads?.length > 0 ? (
        <div className="chat-downloads" aria-label="CV downloads">
          {message.downloads.map((cv) => (
            <a
              key={cv.id}
              className="chat-download"
              href={`${import.meta.env.BASE_URL}${encodeURIComponent(cv.fileName)}`}
              download
              onClick={() => onDownload(cv)}
            >
              <span aria-hidden="true">📄</span> {cv.label} (PDF)
            </a>
          ))}
        </div>
      ) : null}
      {message.bullets.length > 0 ? (
        <ul>
          {message.bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
      {message.suggestions?.length > 0 ? (
        <div className="chat-suggestions chat-suggestions-inline" aria-label="Suggested questions">
          <span className="chat-suggestions-label">You might also ask</span>
          {message.suggestions.map((question) => (
            <button key={question} type="button" className="chat-chip" disabled={!canAsk} onClick={() => onAsk(question)}>
              {question}
            </button>
          ))}
        </div>
      ) : null}
      {message.sources.length > 0 ? (
        <div className="chat-sources" aria-label="Sources from the CV">
          <span className="chat-sources-label">Sources</span>
          {message.sources.map((source) => (
            <button
              key={source.id}
              type="button"
              className="chat-source"
              title={`Open the ${source.section} section`}
              onClick={() => onOpenSource(source)}
            >
              {source.title}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ChatPopup({ onTrack }) {
  const [open, setOpen] = React.useState(true);
  const [messages, setMessages] = React.useState([WELCOME]);
  const [draft, setDraft] = React.useState('');
  const [status, setStatus] = React.useState(null);
  const inputRef = React.useRef(null);
  const logRef = React.useRef(null);
  const launcherRef = React.useRef(null);
  const busy = status !== null;

  React.useEffect(() => {
    onTrack?.('chat_popup_open', { trigger: 'auto' });
  }, [onTrack]);

  React.useEffect(() => {
    if (open) inputRef.current?.focus({ preventScroll: true });
  }, [open]);

  React.useEffect(() => {
    const log = logRef.current;
    if (!log) return;

    const lastMessage = messages[messages.length - 1];
    const answers = log.querySelectorAll('.chat-msg-agent:not(.chat-status)');
    const newestAnswer = answers[answers.length - 1];

    if (messages.length === 1) {
      log.scrollTop = 0;
    } else if (status === null && lastMessage?.role === 'agent' && newestAnswer) {
      log.scrollTop += newestAnswer.getBoundingClientRect().top - log.getBoundingClientRect().top - 8;
    } else {
      log.scrollTop = log.scrollHeight;
    }
  }, [messages, status]);

  const close = React.useCallback(() => {
    setOpen(false);
    onTrack?.('chat_popup_close');
    window.setTimeout(() => launcherRef.current?.focus({ preventScroll: true }), 0);
  }, [onTrack]);

  const submit = async (rawQuestion) => {
    const question = rawQuestion.trim();
    if (!question || busy) return;

    setMessages((current) => [...current, { id: `u-${Date.now()}`, role: 'user', text: question }]);
    setDraft('');
    setStatus('Thinking…');

    try {
      const history = messages.filter((message) => message.role === 'user').map((message) => message.text);
      const answer = await askAgent(question, { onStatus: setStatus, history });
      setMessages((current) => [...current, { id: `a-${Date.now()}`, role: 'agent', ...answer }]);
      onTrack?.('chat_question', {
        question_length: question.length,
        confidence: answer.confidence,
        match_percent: answer.matchPercent ?? -1,
        top_source: answer.sources[0]?.id ?? 'none',
      });
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: `e-${Date.now()}`,
          role: 'agent',
          text: 'Something went wrong while searching the CV. Please try again.',
          bullets: [],
          sources: [],
        },
      ]);
    } finally {
      setStatus(null);
      inputRef.current?.focus({ preventScroll: true });
    }
  };

  const downloadCv = (cv) => {
    onTrack?.('cv_download_click', { cv_language: cv.label, cv_file: cv.fileName, section: 'chat' });
  };

  const openSource = (source) => {
    onTrack?.('chat_source_click', { source_id: source.id, section: source.section });
    window.location.hash = `#${source.section}`;
    if (window.matchMedia?.(MOBILE_QUERY).matches) close();
  };

  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      close();
    }
  };

  const showSuggestions = messages.length === 1 && !busy;

  if (!open) {
    return (
      <button
        ref={launcherRef}
        type="button"
        className="chat-launcher"
        aria-label={`Open ${AGENT_NAME} chat`}
        onClick={() => {
          setOpen(true);
          onTrack?.('chat_popup_open', { trigger: 'launcher' });
        }}
      >
        <span className="chat-launcher-dot" aria-hidden="true" />
        {AGENT_NAME}
      </button>
    );
  }

  return (
    <div className="chat-popup" role="dialog" aria-label={`${AGENT_NAME} chat`} onKeyDown={onKeyDown}>
      <header className="chat-header">
        <div className="chat-title">
          <span className="chat-avatar" aria-hidden="true">AI</span>
          <div>
            <strong>{AGENT_NAME}</strong>
            <small>Ask about Wesley's CV · demo mode</small>
          </div>
        </div>
        <button type="button" className="chat-close" aria-label="Close chat" onClick={close}>×</button>
      </header>

      <div className="chat-log" ref={logRef} role="log" aria-live="polite">
        {messages.map((message) => (
          message.role === 'user' ? (
            <div key={message.id} className="chat-msg chat-msg-user">{message.text}</div>
          ) : (
            <AgentMessage key={message.id} message={message} onOpenSource={openSource} onAsk={submit} onDownload={downloadCv} canAsk={!busy} />
          )
        ))}

        {showSuggestions ? (
          <div className="chat-suggestions" aria-label="Suggested questions">
            {suggestedQuestions.slice(0, 8).map((question) => (
              <button key={question} type="button" className="chat-chip" onClick={() => submit(question)}>
                {question}
              </button>
            ))}
          </div>
        ) : null}

        {busy ? (
          <div className="chat-msg chat-msg-agent chat-status" aria-label={status}>
            <span className="chat-typing" aria-hidden="true"><i /><i /><i /></span>
            <span>{status}</span>
          </div>
        ) : null}
      </div>

      <form
        className="chat-form"
        onSubmit={(event) => {
          event.preventDefault();
          submit(draft);
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={draft}
          maxLength={280}
          placeholder="e.g. Does he know AWS projects?"
          aria-label="Your question about Wesley"
          autoComplete="off"
          onChange={(event) => setDraft(event.target.value)}
        />
        <button type="submit" disabled={busy || draft.trim() === ''}>Ask</button>
      </form>
      <p className="chat-footnote">Answers come from the CV content of this site. A live LLM + RAG backend is coming soon.</p>
    </div>
  );
}

export default ChatPopup;
