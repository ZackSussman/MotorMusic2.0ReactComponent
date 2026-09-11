import React, { useState, useRef } from "react";

import MonacoEditor from "@monaco-editor/react";

import { processVisual, MotorMusicTokensProvider } from "motormusic-runtime";

import { FaPlay } from "react-icons/fa";

const DEFAULT_CODE = `[MotorMusic -> [<"Motormusic" "MM> -> MotorMusic]]`;

const EDITOR_BACKGROUND_COLOR = "#171617";

function registerLanguageAndTheme(monaco) {
    if (!monaco) {
        console.error("Monaco is undefined in registerLanguageAndTheme");
        return;
    }
    monaco.languages.register({id: "MotorMusic"});
    monaco.languages.setTokensProvider('MotorMusic', new MotorMusicTokensProvider());
    
    monaco.editor.defineTheme('MotorMusicTheme', {
    base: 'vs',
    inherit: false,
    colors: {
      "editor.background": EDITOR_BACKGROUND_COLOR,
      "editor.lineHighlightBorder": '#424242',
      "editorLineNumber.foreground": "#00ffe0",
      "editorLineNumber.activeForeground": '#0bf098',
      "editorCursor.foreground": "#c933ffa6",
      "editor.selectionBackground": "#547a7a5c",
      "editor.lineHighlightBackground": "#111111",
      "editor.lineHighlightBorder": "#00000000",
      "editorBracketHighlight.foreground1": "#1ca182",
      "editorBracketHighlight.foreground2": "#6b90ff",
      "editorBracketHighlight.foreground3": "#fe00ff",
      "editorBracketHighlight.unexpectedBracket.foreground": "#ff0000"
    },
    rules: [
      { token: 'lparen1.MotorMusic', foreground: '#1ca182', fontStyle: 'bold' },
      { token: 'rparen1.MotorMusic', foreground: '#1ca182', fontStyle: 'bold' },
      { token: 'lparen2.MotorMusic', foreground: '#6b90ff', fontStyle: 'bold' },
      { token: 'rparen2.MotorMusic', foreground: '#6b90ff', fontStyle: 'bold' },
      { token: 'lparen0.MotorMusic', foreground: '#fe00ff', fontStyle: 'bold' },
      { token: 'rparen0.MotorMusic', foreground: '#fe00ff', fontStyle: 'bold' },
      { token: 'lcurly0.MotorMusic', foreground: '#1ca182', fontStyle: 'bold' },
      { token: 'lcurly1.MotorMusic', foreground: '#6b90ff', fontStyle: 'bold' },
      { token: 'lcurly2.MotorMusic', foreground: '#fe00ff', fontStyle: 'bold' },
      { token: 'rcurly0.MotorMusic', foreground: '#1ca182', fontStyle: 'bold' },
      { token: 'rcurly1.MotorMusic', foreground: '#6b90ff', fontStyle: 'bold' },
      { token: 'rcurly2.MotorMusic', foreground: '#fe00ff', fontStyle: 'bold' },
      { token: 'named_symbol.MotorMusic', foreground: '#0075ff' },
      { token: 'lsqbracket.MotorMusic', foreground: '#b3ff00' },
      { token: 'rsqbracket.MotorMusic', foreground: '#b3ff00' },
      { token: 'unrecognized.MotorMusic', foreground: '#ff005d' },
      { token: 'langle.MotorMusic', foreground: '#8080B0' },
      { token: 'rangle.MotorMusic', foreground: '#8080B0' },
      { token: '', foreground: '#ef0e0e' } 
    ]
  });

  monaco.languages.setLanguageConfiguration('MotorMusic', {
    autoClosingPairs: [
      { open: '(', close: ' )' },
    ],
    surroundingPairs: [
      { open: '(', close: ')' },
    ]
  });

    console.log(
        "MotorMusic language:",
        monaco.languages
            .getLanguages()
            .find(language => language.id === "MotorMusic")
    );
}


// width used to default to 600px
function MotorMusicEditor({
    fontSize = 18,
    height = "100px",
    initialCode = DEFAULT_CODE,
    onCodeChange = (newCode) => {},
    lineNumbers = "on"
}) {
    const editorRef = useRef(null);
    const monacoRef = useRef(null);

    const [code, setCode] = useState(initialCode);
    const [isCurrentCodeCompiled, setIsCurrentCodeCompiled] = useState(false);
    const [isEditorReady, setIsEditorReady] = useState(false);
    const [hasHorizontalOverflow, setHasHorizontalOverflow] = useState(false);

    function consumeText(newCode) {
        onCodeChange(newCode);

        setCode(newCode);

        const errors = processVisual(newCode);

        if (errors.length === 0) {
            setIsCurrentCodeCompiled(true);
        } else {
            setIsCurrentCodeCompiled(false);
            console.log("Compilation errors: ", errors);
        }

        // Use the Monaco instance stored in the ref.
        if (editorRef.current && monacoRef.current) {
            const model = editorRef.current.getModel();

            if (model) {
                monacoRef.current.editor.setModelMarkers(
                    model,
                    "owner",
                    errors.map(error => ({
                        message: error.message,
                        severity: monacoRef.current.MarkerSeverity.Error,
                        startLineNumber: error.startLine,
                        startColumn: error.startCol,
                        endLineNumber: error.endLine,
                        endColumn: error.endCol
                    }))
                );
            }
        }
    }

    return (
        <div
            className="mm-editor-shell"
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: height,
                width: "100%",
                marginTop: 4,
                minWidth: 0,
                maxWidth: "100%",
                overflow: "hidden",
                boxSizing: "border-box"
            }}
        >
            <div
                style={{
                    height: height,
                    width: "100%",
                    maxWidth: "100%",
                    minWidth: 0,
                    boxSizing: "border-box",
                    border: "1px solid #ccc",
                    borderRadius: "3px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "stretch",
                    gap: 0,
                    padding: 0,
                    margin: 0
                }}
            >
                <div
                    style={{
                        flex: 1,
                        minWidth: 0,
                        maxWidth: "100%",
                        overflow: "hidden",
                        position: "relative"
                    }}
                >
                    <MonacoEditor
                        language="MotorMusic"
                        value={code}
                        theme="MotorMusicTheme"
                        height={height}
                        options={{
                            overviewRulerLanes: 0,

                            automaticLayout: true,

                            fontSize: fontSize,

                            minimap: {
                                enabled: false
                            },

                            matchBrackets: "near",

                            bracketPairColorization: {
                                enabled: false
                            },

                            scrollBeyondLastLine: false,

                            smoothScrolling: false,

                            glyphMargin: false,

                            folding: false,

                            lineNumbers: lineNumbers,

                            renderLineHighlight: "none",

                            stickyScroll: {
                                enabled: false
                            },

                            accessibilitySupport: "off",

                            scrollbar: {
                                vertical: "auto",
                                horizontal: "hidden",
                                alwaysConsumeMouseWheel: false
                            },

                            quickSuggestions: false,

                            suggest: {
                                enabled: false
                            },

                            parameterHints: {
                                enabled: false
                            },

                            hover: {
                                enabled: false
                            },

                            ...(lineNumbers !== "off"
                                ? {
                                      lineNumbersMinChars: 3,

                                      lineDecorationsWidth: 16,

                                      padding: {
                                          top: 0,
                                          bottom: 0,
                                          left: 8,
                                          right: 0
                                      }
                                  }
                                : {
                                      padding: {
                                          top: 0,
                                          bottom: 0,
                                          left: 0,
                                          right: 8
                                      }
                                  })
                        }}
                        beforeMount={registerLanguageAndTheme}
                        onMount={(editor, monaco) => {
                            editorRef.current = editor;
                            monacoRef.current = monaco;

                            // Register the language, token provider, and theme
                            // using the exact Monaco instance used by this editor.
                            //registerLanguageAndTheme(monaco);

                            // Make sure the existing model uses the newly
                            // registered MotorMusic language.
                            const model = editor.getModel();

                            if (model) {
                                monaco.editor.setModelLanguage(
                                    model,
                                    "MotorMusic"
                                );
                            }

                            setIsEditorReady(true);

                            consumeText(code);

                            if (lineNumbers === "off") {
                                editor.addCommand(
                                    monaco.KeyCode.Enter,
                                    () => {
                                        // Do nothing on Enter key.
                                        // Disables new line.
                                    }
                                );
                            }

                            // Check for horizontal overflow
                            const checkOverflow = () => {
                                const domNode = editor.getDomNode();

                                if (domNode) {
                                    const viewLines =
                                        domNode.querySelector(".view-lines");

                                    if (viewLines) {
                                        const hasOverflow =
                                            viewLines.scrollWidth >
                                            viewLines.clientWidth;

                                        setHasHorizontalOverflow(
                                            hasOverflow
                                        );
                                    }
                                }
                            };

                            // Check on mount
                            checkOverflow();

                            // Check when content changes
                            editor.onDidChangeModelContent(() => {
                                setTimeout(checkOverflow, 100);
                            });
                        }}

                        onChange={consumeText}
                    />

                    {hasHorizontalOverflow && (
                        <div
                            style={{
                                position: "absolute",
                                right: 0,
                                top: 0,
                                bottom: 0,
                                width: "40px",
                                background:
                                    "linear-gradient(to left, rgba(23, 22, 23, 0.95), rgba(23, 22, 23, 0.6), transparent)",
                                pointerEvents: "none",
                                zIndex: 10
                            }}
                        />
                    )}
                </div>

                <button
                    disabled={!isCurrentCodeCompiled}
                    onClick={() => console.log('code was "ran"')}
                    style={{
                        backgroundColor: EDITOR_BACKGROUND_COLOR,
                        border: "none",
                        height: "100%",
                        padding: "0 12px",
                        fontSize: "18px",
                        cursor: !isCurrentCodeCompiled
                            ? "not-allowed"
                            : "pointer",
                        display: "flex",
                        outline: "none",
                        boxShadow: "none",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 0
                    }}
                >
                    <FaPlay
                        style={{
                            color: !isCurrentCodeCompiled
                                ? "#888"
                                : "#fff"
                        }}
                    />
                </button>
            </div>
        </div>
    );
}

export default MotorMusicEditor;