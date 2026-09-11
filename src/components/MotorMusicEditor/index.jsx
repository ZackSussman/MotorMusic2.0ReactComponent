import React, {useState, useEffect, useRef} from "react";
import MonacoEditor, {loader} from "@monaco-editor/react";
import {MotorMusicTokensProvider, processVisual} from "motormusic-runtime";
import {FaPlay} from 'react-icons/fa';

const DEFAULT_CODE = `[MotorMusic -> [<"Motormusic" "MM> -> MotorMusic]]`;

const EDITOR_BACKGROUND_COLOR = "#171617";

function registerLanguageAndTheme(monaco) {
    if (!monaco) {
      console.error("Monaco is undefined in registerLanguageAndTheme");
      return;
    }
    monaco.languages.register({id: "MotorMusic"});
    //monaco.languages.setTokensProvider('MotorMusic', new MotorMusicTokensProvider());
    
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
      { token: 'rcurly1.MotorMusic', foreground: '6b90ff', fontStyle: 'bold' },
      { token: 'rcurly2.MotorMusic', foreground: '#fe00ff', fontStyle: 'bold' },
      { token: 'named_symbol.MotorMusic', foreground: '#0075ff' },
      { token: 'lsqbracket.MotorMusic', foreground: '#b3ff00' },
      { token: 'rsqbracket.MotorMusic', foreground: '#b3ff00' },
      { token: 'unrecognized.MotorMusic', foreground: '#ff005d' },
      { token: 'langle.MotorMusic', foreground: '#8080B0' },
      { token: 'rangle.MotorMusic', foreground: '#8080B0' },
      { token: '', foreground: '#0075ff' } 
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

}

//width used to default to 600px

function MotorMusicEditor({fontSize = 18, height = '100px', initialCode = DEFAULT_CODE, onCodeChange = (newCode) => {},  lineNumbers = "on"}) {

    const editorRef = useRef(null);
    const currentColorMap = useRef(); //TODO: understand why there is no null here (any difference?)
    const [code, setCode] = useState(initialCode);
    const [isCurrentCodeCompiled, setIsCurrentCodeCompiled] = useState(false);
    const [isEditorReady, setIsEditorReady] = useState(false);
    const [hasHorizontalOverflow, setHasHorizontalOverflow] = useState(false);


    useEffect(() => {
        loader.init().then(monaco => {
          registerLanguageAndTheme(monaco);
        }).catch(error => {
          console.log("failed to initialize monaco: ", error);
        });
     }, []);



    
    function consumeText(newCode) {
        onCodeChange(newCode); //client's callback
        setCode(newCode);
        const errors = processVisual(newCode);
        if (errors.length === 0) {
            setIsCurrentCodeCompiled(true);
        }
        else {
            setIsCurrentCodeCompiled(false); 
            console.log("Compilation errors: ", errors);
        }
        if (editorRef.current) {
           monaco.editor.setModelMarkers(editorRef.current.getModel(), "owner", errors.map(
                error => ({
                    message: error.message,
                    severity: monaco.MarkerSeverity.Error,
                    startLineNumber: error.startLine,
                    startColumn: error.startCol,
                    endLineNumber: error.endLine,
                    endColumn: error.endCol,
                })
           )) 
        }
    }

    return (
      <div className="mm-editor-shell"
       style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'cetner',
        height: height,
        width: '100%',
        marginTop: 4, // reduce top margin for more space
        minWidth: 0,
        maxWidth: '100%',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}>
        <div style = {{
          height: height,
          width: '100%',
          maxWidth: '100%',
          minWidth: 0,
          boxSizing: 'border-box',
          border: '1px solid #ccc',
          borderRadius: '3px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'stretch',
          gap: 0,
          padding: 0,
          margin: 0,
        }}>
          <div style = {{flex: 1, minWidth: 0, maxWidth: '100%', overflow: 'hidden', position: 'relative'}} >
            <MonacoEditor
              language="MotorMusic"
              value={code}
              theme="MotorMusicTheme"
              height={height}
              options={{
                overviewRulerLanes: 0,
                automaticLayout: true,
                fontSize: fontSize,
                minimap: { enabled: false },
                matchBrackets: "near",
                bracketPairColorization: { enabled: false },
                scrollBeyondLastLine: false,
                smoothScrolling: false,
                glyphMargin: false,
                folding: false,
                lineNumbers: lineNumbers,
                renderLineHighlight: 'none',
                stickyScroll: { enabled: false },
                accessibilitySupport: "off",
                scrollbar: {
                  vertical: 'auto',
                  horizontal: 'hidden',
                  alwaysConsumeMouseWheel: false
                },
                automaticLayout: true,
                quickSuggestions: false,
                suggest: {enabled: false},
                parameterHints: {enabled: false},
                hover: {enabled: false},
                ...(lineNumbers !== "off" ? {
                  lineNumbersMinChars: 3,
                  lineDecorationsWidth: 16,
                  padding: {
                    top: 0,
                    bottom: 0,
                    left: 8,
                    right: 0
                  }
                } : {
                  padding: {
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 8
                  }
                })
              }}
              onMount={(editor) => {
                editorRef.current = editor;
                setIsEditorReady(true);
                consumeText(code);
                if (lineNumbers == "off") {
                  editor.addCommand(monaco.KeyCode.Enter, () => {
                    // Do nothing on Enter key — disables new line
                  });
                }
                
                // Check for horizontal overflow
                const checkOverflow = () => {
                  const domNode = editor.getDomNode();
                  if (domNode) {
                    const viewLines = domNode.querySelector('.view-lines');
                    if (viewLines) {
                      const hasOverflow = viewLines.scrollWidth > viewLines.clientWidth;
                      setHasHorizontalOverflow(hasOverflow);
                    }
                  }
                };
                
                // Check on mount and when content changes
                checkOverflow();
                editor.onDidChangeModelContent(() => {
                  setTimeout(checkOverflow, 100);
                });
              }}
              onChange={consumeText}
            />
            {hasHorizontalOverflow && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: 0,
                bottom: 0,
                width: '40px',
                background: 'linear-gradient(to left, rgba(23, 22, 23, 0.95), rgba(23, 22, 23, 0.6), transparent)',
                pointerEvents: 'none',
                zIndex: 10
              }} />
            )}
          </div>
          <button
            disabled={!isCurrentCodeCompiled}
            onClick={console.log("code was \"ran\"")}
            style={{
              backgroundColor: EDITOR_BACKGROUND_COLOR,
              border: 'none',
              height: '100%',
              padding: '0 12px',
              fontSize: '18px',
              cursor: (!isCurrentCodeCompiled) ? 'not-allowed' : 'pointer',
              display: 'flex',
              outline: 'none',
              boxShadow: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 0
            }}
          >
            <FaPlay style={{ color: (!isCurrentCodeCompiled) ? '#888' : '#fff' }} />
          </button>
        </div>
        { !disableDSTPMInput && (
          <div style={{ width: '100%', marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
            <label htmlFor="dstpm-input" style={{ marginRight: 8, color: '#fff', fontSize: 14, display: 'flex', alignItems: 'center', padding: 0, background: 'none', border: 'none' }}>
              <span style={{ position: 'relative', display: 'inline-block' }}>
                <span
                  tabIndex={0}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: '#23232b',
                    color: '#00ffe0',
                    fontWeight: 700,
                    fontSize: 13,
                    border: '1.2px solid #00ffe0',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                  onFocus={e => e.target.nextSibling.style.visibility = 'visible'}
                  onBlur={e => e.target.nextSibling.style.visibility = 'hidden'}
                  onMouseEnter={e => e.target.nextSibling.style.visibility = 'visible'}
                  onMouseLeave={e => e.target.nextSibling.style.visibility = 'hidden'}
                  aria-label="What is DSTPM?"
                >
                  ?
                </span>
                <span
                  style={{
                    visibility: 'hidden',
                    width: 220,
                    background: '#23232b',
                    color: '#fff',
                    textAlign: 'left',
                    borderRadius: 6,
                    padding: '8px 12px',
                    position: 'absolute',
                    zIndex: 10,
                    left: '110%',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                    fontSize: 13,
                    fontWeight: 400,
                    pointerEvents: 'none',
                  }}
                  role="tooltip"
                >
                  Default syllable time in milliseconds
                </span>
              </span>
            </label>
            <input
              id="dstpm-input"
              type="number"
              min={1}
              step="any"
              value={syllableTime}
              onChange={e => {
                const val = e.target.value;
                // Allow empty string for editing
                if (val === "") {
                  setSyllableTime("");
                } else {
                  const num = Number(val);

                  if((num >= 1)  && (num <= 2000)) setSyllableTime(val);
                }
              }}
              onBlur={e => {
                // If left empty, reset to 1
                if (e.target.value === "") setSyllableTime(1);
                else setSyllableTime(Number(e.target.value));
                e.target.style.border = '1.5px solid #444';
              }}
              style={{
                width: 90,
                fontSize: 15,
                padding: '6px 8px',
                borderRadius: 6,
                border: '1.5px solid #444',
                background: '#23232b',
                color: '#00ffe0',
                outline: 'none',
                marginRight: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                transition: 'border 0.2s, box-shadow 0.2s',
                fontWeight: 500,
                letterSpacing: 0.5,
                appearance: 'textfield',
                MozAppearance: 'textfield',
                WebkitAppearance: 'none',
                opacity: 1,
                cursor: 'auto',
              }}
              onFocus={e => e.target.style.border = '1.5px solid #00ffe0'}
            />
            <style>{`
              #dstpm-input::-webkit-outer-spin-button, #dstpm-input::-webkit-inner-spin-button {
                -webkit-appearance: none;
                margin: 0;
              }
              #dstpm-input[type=number] {
                -moz-appearance: textfield;
              }
            `}</style>
            {/* Tooltip replaced by question mark icon above */}
          </div>
        )}
      </div>
    );

}


export default MotorMusicEditor;