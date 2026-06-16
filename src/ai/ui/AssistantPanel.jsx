import { useDataEngine } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { Button, CircularLoader, IconRedo16, TextArea } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector, useStore } from 'react-redux'
import { runAgentLoop } from '../agent/loop.js'
import { DEMO_SCRIPTS } from '../connectors/demoScripts.js'
import { buildRegistry, selectConnector } from '../connectors/registry.js'
import { buildToolRegistry } from '../tools/executor.js'
import styles from './styles/AssistantPanel.module.css'

const FEATURE_FLAG = 'DHIS2_AI_ASSISTANT'

const isEnabled = () =>
    typeof window !== 'undefined' &&
    (window.__DHIS2_AI_ASSISTANT__ === true ||
        localStorage.getItem(FEATURE_FLAG) === 'true' ||
        process.env.NODE_ENV === 'development')

const AssistantPanel = ({ open }) => {
    const dispatch = useDispatch()
    const reduxStore = useStore()
    const engine = useDataEngine()
    const getStateRef = useRef(null)
    getStateRef.current = reduxStore.getState

    const [history, setHistory] = useState([])
    const [inputText, setInputText] = useState('')
    const [status, setStatus] = useState('idle')
    const [statusText, setStatusText] = useState('')
    const [activeProvider, setActiveProvider] = useState('ollama-3b')
    const [registry] = useState(() =>
        buildRegistry([
            {
                id: 'ollama-3b',
                label: 'Ollama · qwen2.5:3b',
                type: 'openaiCompatible',
                baseURL: 'http://localhost:11434/v1',
                model: 'qwen2.5:3b',
                isLocal: true,
                enabled: true,
            },
            {
                id: 'ollama-7b',
                label: 'Ollama · qwen2.5:7b',
                type: 'openaiCompatible',
                baseURL: 'http://localhost:11434/v1',
                model: 'qwen2.5:7b',
                isLocal: true,
                enabled: true,
            },
            // Dev-only: Vite strips this entire block in production builds so the
            // API key is never inlined into the bundle.
            ...(import.meta.env.DEV && import.meta.env.DHIS2_ANTHROPIC_API_KEY
                ? [
                      {
                          id: 'claude',
                          label: 'Claude (Anthropic)',
                          type: 'anthropic',
                          baseURL: '/anthropic-proxy',
                          model: 'claude-sonnet-4-6',
                          apiKey: import.meta.env.DHIS2_ANTHROPIC_API_KEY,
                          enabled: true,
                      },
                  ]
                : []),
        ])
    )
    const connector = selectConnector(registry, activeProvider)
    const selectableConnectors = registry.filter((c) => c.id !== 'demo')
    const isDemo = connector.id === 'demo'

    const toolRegistry = buildToolRegistry({
        engine,
        dispatch,
        getState: () => getStateRef.current(),
    })

    const handleSend = useCallback(
        async (text) => {
            const userText = text.trim()
            if (!userText || status === 'thinking') {
                return
            }

            setStatus('thinking')
            setStatusText('')
            setInputText('')
            setHistory((prev) => [...prev, { role: 'user', content: userText }])

            const onUpdate = (update) => {
                if (update.type === 'thinking') {
                    setStatusText(i18n.t('Thinking…'))
                }
                if (update.type === 'tool_call') {
                    setStatusText(
                        i18n.t('Running {{name}}…', { name: update.name })
                    )
                }
                if (update.type === 'text') {
                    setStatusText('')
                }
            }

            try {
                console.log('[AI] starting agent loop for:', userText)
                const result = await runAgentLoop({
                    connector,
                    toolRegistry,
                    history,
                    userText,
                    onUpdate,
                })
                console.log('[AI] loop complete. reply:', result.reply)
                setHistory(result.history)
                setStatus('idle')
                setStatusText('')
            } catch (err) {
                console.error('[AI] loop error:', err)
                setStatus('error')
                setStatusText(err.message)
            }
        },
        [connector, history, status, toolRegistry]
    )

    const handleReset = useCallback(() => {
        setHistory([])
        setInputText('')
        setStatus('idle')
        setStatusText('')
    }, [])

    const handleKeyDown = (_payload, e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend(inputText)
        }
    }

    const transcriptRef = useRef(null)
    useEffect(() => {
        if (transcriptRef.current) {
            transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
        }
    }, [history, status])

    const mapViews = useSelector((state) => state.map?.mapViews ?? [])

    // Track which scripts have been triggered via history
    const usedLabels = new Set(
        history
            .filter((m) => m.role === 'user' && typeof m.content === 'string')
            .map((m) => m.content)
    )

    // A script's layer is "present" if a layer with a matching name exists in Redux.
    // This detects manual removal as well as AI-driven removal.
    const isLayerPresent = (script) => {
        const pattern = script.removeSteps?.[0]?.args?.namePattern
        if (!pattern) {
            return false
        }
        return mapViews.some((l) =>
            l.name?.toLowerCase().includes(pattern.toLowerCase())
        )
    }

    const unusedScripts = DEMO_SCRIPTS.filter((s) => !usedLabels.has(s.label))
    const removableScripts = DEMO_SCRIPTS.filter(
        (s) => usedLabels.has(s.label) && isLayerPresent(s)
    )
    if (!open) {
        return null
    }

    return (
        <div className={styles.panel}>
            <div className={styles.header}>
                <div className={styles.titleArea}>
                    <div className={styles.title}>
                        {i18n.t('Map assistant')}
                    </div>
                    {isDemo ? (
                        <div className={styles.providerText}>
                            {i18n.t('Demo mode — no AI model connected')}
                        </div>
                    ) : (
                        <select
                            className={styles.modelSelect}
                            value={activeProvider}
                            onChange={(e) => setActiveProvider(e.target.value)}
                            disabled={status === 'thinking'}
                        >
                            {selectableConnectors.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.label}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
                {history.length > 0 && (
                    <button
                        className={styles.closeBtn}
                        onClick={handleReset}
                        title={i18n.t('New conversation')}
                        aria-label={i18n.t('New conversation')}
                    >
                        <IconRedo16 />
                    </button>
                )}
            </div>

            <div
                className={styles.transcript}
                ref={transcriptRef}
                role="log"
                aria-live="polite"
            >
                {history.length === 0 && (
                    <div className={styles.emptyState}>
                        <p>
                            {i18n.t(
                                'Add, edit, or remove map layers using plain language.'
                            )}
                        </p>
                        <div className={styles.examplesLabel}>
                            {i18n.t('Try an example')}
                        </div>
                        <div className={styles.chips}>
                            {DEMO_SCRIPTS.map((s) => (
                                <button
                                    key={s.label}
                                    className={styles.chip}
                                    onClick={() => handleSend(s.label)}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {history
                    .filter(
                        (m) =>
                            (m.role === 'user' || m.role === 'assistant') &&
                            typeof m.content === 'string' &&
                            m.content.trim() !== ''
                    )
                    .map((msg, i) => (
                        <div
                            key={i}
                            className={
                                msg.role === 'user'
                                    ? styles.userMsg
                                    : styles.assistantMsg
                            }
                        >
                            <span className={styles.msgLabel}>
                                {msg.role === 'user'
                                    ? i18n.t('You')
                                    : i18n.t('Assistant')}
                            </span>
                            <span className={styles.msgText}>
                                {msg.content}
                            </span>
                        </div>
                    ))}

                {status === 'thinking' && (
                    <div className={styles.statusRow}>
                        <CircularLoader small />
                        <span>{statusText}</span>
                    </div>
                )}
                {status === 'error' && (
                    <div className={styles.errorRow}>{statusText}</div>
                )}

                {isDemo &&
                    status === 'idle' &&
                    history.length > 0 &&
                    (removableScripts.length > 0 ||
                        unusedScripts.length > 0) && (
                        <div className={styles.postCompletion}>
                            {removableScripts.length > 0 && (
                                <>
                                    <div className={styles.examplesLabel}>
                                        {i18n.t('Remove a layer')}
                                    </div>
                                    <div className={styles.chips}>
                                        {removableScripts.map((s) => (
                                            <button
                                                key={s.removeLabel}
                                                className={`${styles.chip} ${styles.chipRemove}`}
                                                onClick={() =>
                                                    handleSend(s.removeLabel)
                                                }
                                            >
                                                {s.removeLabel}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                            {unusedScripts.length > 0 && (
                                <>
                                    <div className={styles.examplesLabel}>
                                        {i18n.t('Try another example')}
                                    </div>
                                    <div className={styles.chips}>
                                        {unusedScripts.map((s) => (
                                            <button
                                                key={s.label}
                                                className={styles.chip}
                                                onClick={() =>
                                                    handleSend(s.label)
                                                }
                                            >
                                                {s.label}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
            </div>

            <div className={styles.inputRow}>
                <TextArea
                    value={inputText}
                    onChange={({ value }) => setInputText(value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                        isDemo
                            ? i18n.t('Try one of the examples above…')
                            : i18n.t('Ask me to add, edit, or remove a layer…')
                    }
                    rows={2}
                    disabled={status === 'thinking'}
                    resize="none"
                    dense
                />
                <div className={styles.sendRow}>
                    <Button
                        primary
                        small
                        onClick={() => handleSend(inputText)}
                        disabled={!inputText.trim() || status === 'thinking'}
                    >
                        {i18n.t('Send')}
                    </Button>
                </div>
            </div>
        </div>
    )
}

AssistantPanel.propTypes = {
    open: PropTypes.bool.isRequired,
}

export { isEnabled }
export default AssistantPanel
