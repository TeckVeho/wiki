import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import styles from './RAGComponent.module.css';

export default function RAGComponent() {
  const [input, setInput] = useState('');
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [agents, setAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [isFetchingAgents, setIsFetchingAgents] = useState(true);

  // Agent一覧を取得
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch('http://localhost:4111/api/agents', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Agent取得エラー: ${response.status}`);
        }

        const data = await response.json();
        
        const agentList = Object.entries(data).map(([id, agentData]) => ({
          id,
          name: agentData.name,
          description: agentData.instructions,
          tools: Object.keys(agentData.tools || {}),
          model: agentData.modelId
        }));

        setAgents(agentList);
        
        if (agentList.length > 0) {
          setSelectedAgentId(agentList[0].id);
        }
      } catch (err) {
        setError(`Agent一覧の取得に失敗しました: ${err.message}`);
        console.error('Agent fetch error:', err);
      } finally {
        setIsFetchingAgents(false);
      }
    };

    fetchAgents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedAgentId) return;

    setIsLoading(true);
    setError(null);

    try {
      // ユーザーメッセージを会話に追加
      const userMessage = { 
        sender: 'user', 
        text: input,
        agentId: selectedAgentId,
        timestamp: new Date().toISOString()
      };
      setConversation(prev => [...prev, userMessage]);

      const response = await fetch(
        `http://localhost:4111/api/agents/${selectedAgentId}/generate`, 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [{
              role: "user",
              content: input
            }],
            threadId: "veho-wiki-thread",
            resourceId: "veho-knowledge-base"
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      
      // レスポンスからテキストを抽出
      let aiResponseText = extractResponseText(data);
      
      const aiMessage = { 
        sender: 'ai', 
        text: aiResponseText,
        agentId: selectedAgentId,
        timestamp: new Date().toISOString(),
        toolsUsed: extractToolsUsed(data)
      };
      
      setConversation(prev => [...prev, aiMessage]);

    } catch (err) {
      setError(err.message);
      console.error('API Error:', err);
    } finally {
      setIsLoading(false);
      setInput('');
    }
  };

  // レスポンスからテキストを抽出するヘルパー関数
  const extractResponseText = (data) => {
    if (data.text) return data.text;
    if (data.body?.choices?.[0]?.message?.content) return data.body.choices[0].message.content;
    if (data.messages && Array.isArray(data.messages)) {
      const lastMessage = data.messages[data.messages.length - 1];
      if (lastMessage.content && Array.isArray(lastMessage.content)) {
        return lastMessage.content
          .filter(item => item.type === "text" && item.text)
          .map(item => item.text)
          .join("\n");
      } else if (typeof lastMessage.content === 'string') {
        return lastMessage.content;
      }
    }
    return JSON.stringify(data, null, 2);
  };

  // 使用ツールを抽出するヘルパー関数
  const extractToolsUsed = (data) => {
    if (data.tools_used) return data.tools_used;
    if (data.messages && Array.isArray(data.messages)) {
      const lastMessage = data.messages[data.messages.length - 1];
      if (lastMessage.content && Array.isArray(lastMessage.content)) {
        return lastMessage.content
          .filter(item => item.type === "tool-call")
          .map(item => item.toolName);
      }
    }
    return [];
  };

  // メッセージテキストをレンダリングする関数
  const renderMessageText = (text) => {
    if (!text) return null;
    
    const lines = typeof text === 'string' ? text.split('\n') : [String(text)];
    let inCodeBlock = false;
    let codeBlockContent = [];

    return lines.map((line, i) => {
      // コードブロックの開始/終了を検出
      if (line.trim().startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        if (!inCodeBlock && codeBlockContent.length > 0) {
          const codeContent = codeBlockContent.join('\n');
          codeBlockContent = [];
          return (
            <pre key={`code-${i}`} className={styles.codeBlock}>
              {codeContent}
            </pre>
          );
        }
        return null;
      }

      // コードブロック内のコンテンツ
      if (inCodeBlock) {
        codeBlockContent.push(line);
        return null;
      }

      // 通常のテキスト行
      return <p key={i}>{line}</p>;
    });
  };

  const selectedAgent = agents.find(agent => agent.id === selectedAgentId);

  return (
    <div className={styles.ragContainer}>
      <div className={styles.agentSection}>
        <div className={styles.agentSelector}>
          <label htmlFor="agent-select">使用するAgent: </label>
          {isFetchingAgents ? (
            <span className={styles.loadingText}>Loading agents...</span>
          ) : (
            <select
              id="agent-select"
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              disabled={isLoading || agents.length === 0}
              className={styles.agentDropdown}
            >
              {agents.length === 0 ? (
                <option value="">利用可能なAgentがありません</option>
              ) : (
                agents.map(agent => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} ({agent.model})
                  </option>
                ))
              )}
            </select>
          )}
        </div>
      </div>

      <div className={styles.chatWindow}>
        {conversation.map((msg, index) => {
          const agent = agents.find(a => a.id === msg.agentId);
          return (
            <div 
              key={index} 
              className={clsx(
                styles.message, 
                msg.sender === 'user' ? styles.userMessage : styles.aiMessage
              )}
            >
              <div className={styles.messageHeader}>
                <span className={styles.senderName}>
                  {msg.sender === 'user' ? 'You' : agent?.name || msg.agentId}
                </span>
                <span className={styles.timestamp}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className={styles.messageContent}>
                {renderMessageText(msg.text)}
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className={clsx(styles.message, styles.aiMessage)}>
            <div className={styles.messageContent}>
              <div className={styles.typingIndicator}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className={styles.inputForm}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={selectedAgent ? `${selectedAgent.name}に質問してください...` : 'Agentを選択してください...'}
          className={styles.textarea}
          disabled={isLoading || !selectedAgentId}
          rows={3}
        />
        <div className={styles.formFooter}>
          <button 
            type="submit" 
            className={clsx('button button--primary', styles.submitButton)}
            disabled={isLoading || !input.trim() || !selectedAgentId}
          >
            {isLoading ? '送信中...' : '送信'}
          </button>
        </div>
      </form>

      {error && (
        <div className={clsx('alert alert--danger', styles.error)}>
          {error}
        </div>
      )}
    </div>
  );
}