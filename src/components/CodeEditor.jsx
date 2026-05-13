import { useState, useRef, useEffect, useCallback } from "react";
import { simulatedOutputs } from "../data/dummyData";

const LANGUAGES = ["C++", "Java", "Python", "JavaScript"];

// ─── VS Code colour palette ────────────────────────────────────────────────────
const C = {
  keyword:   "#569cd6",
  string:    "#ce9178",
  comment:   "#6a9955",
  number:    "#b5cea8",
  fn:        "#dcdcaa",
  type:      "#4ec9b0",
  builtin:   "#4fc1ff",
  operator:  "#d4d4d4",
  default:   "#d4d4d4",
  decorator: "#c8c8c8",
  punct:     "#d4d4d4",
  special:   "#c678dd",   // purple for self/this/super
};

const KEYWORDS = {
  "Python": ["def","class","if","elif","else","for","while","return","import","from","as",
             "pass","None","True","False","and","or","not","in","is","lambda","with",
             "try","except","finally","raise","yield","global","nonlocal","del","assert","break","continue"],
  "JavaScript": ["const","let","var","function","return","if","else","for","while","do",
                 "class","extends","import","export","default","new","typeof","instanceof",
                 "null","undefined","true","false","async","await","switch","case","break",
                 "continue","try","catch","finally","throw","delete","of","in","yield"],
  "C++": ["int","float","double","char","bool","void","string","class","struct","public",
          "private","protected","return","if","else","for","while","do","switch","case",
          "break","continue","namespace","using","new","delete","nullptr","true","false",
          "const","auto","include","vector","map","pair","long","short","unsigned","signed",
          "template","typename","this","static","virtual","override","cout","cin","endl"],
  "Java": ["public","private","protected","static","void","int","float","double","char",
           "boolean","String","class","interface","extends","implements","return","if",
           "else","for","while","do","switch","case","break","continue","new","null",
           "true","false","this","super","import","package","abstract","final","throws",
           "throw","try","catch","finally","instanceof","synchronized","volatile"],
};

const SPECIAL_WORDS = {
  "Python": ["self","super","__init__","__str__","__repr__","__len__","print","len","range","list","dict","set","tuple","int","str","float","bool","type","object","enumerate","zip","map","filter","sorted","reversed"],
  "JavaScript": ["this","console","Math","Array","Object","String","Number","Boolean","Promise","async","await","fetch","document","window","JSON"],
  "C++": ["cout","cin","endl","vector","map","pair","string","nullptr","this"],
  "Java": ["System","out","println","this","super","Math","String","Integer","Double","List","ArrayList","Map","HashMap"],
};

const BUILTINS = {
  "Python": ["print","len","range","input","open","type","isinstance","hasattr","getattr","setattr","enumerate","zip","map","filter","sorted","reversed","min","max","sum","abs","round"],
  "JavaScript": ["console","Math","JSON","parseInt","parseFloat","isNaN","Array","Object","String","Number","Boolean","Promise","setTimeout","setInterval","fetch"],
  "C++": ["printf","scanf","cout","cin","endl","push_back","size","empty","begin","end","find","insert","erase","sort","reverse"],
  "Java": ["System.out.println","System.out.print","Integer.parseInt","Double.parseDouble","Math.max","Math.min","Arrays.sort"],
};

function escHtml(s) {
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

function span(color, text) {
  return `<span style="color:${color}">${escHtml(text)}</span>`;
}

function tokenize(code, lang) {
  const kws     = new Set(KEYWORDS[lang]    || []);
  const specials = new Set(SPECIAL_WORDS[lang] || []);
  const builtins = new Set(BUILTINS[lang]    || []);

  const lines = code.split("\n");
  return lines.map(line => {
    let out = "";
    let i   = 0;
    while (i < line.length) {
      // Line comment
      if ((lang === "Python" && line[i] === "#") ||
          ((lang === "C++" || lang === "Java" || lang === "JavaScript") && line[i] === "/" && line[i+1] === "/")) {
        out += span(C.comment, line.slice(i));
        i = line.length;
        continue;
      }
      // Block comment start /* (one-liner for simplicity)
      if ((lang !== "Python") && line[i] === "/" && line[i+1] === "*") {
        const end = line.indexOf("*/", i+2);
        if (end !== -1) {
          out += span(C.comment, line.slice(i, end+2));
          i = end + 2;
        } else {
          out += span(C.comment, line.slice(i));
          i = line.length;
        }
        continue;
      }
      // String single quote
      if (line[i] === "'" || line[i] === '"' || (lang === "Python" && line[i] === '`')) {
        const q = line[i];
        let j = i + 1;
        while (j < line.length && line[j] !== q) {
          if (line[j] === "\\") j++;
          j++;
        }
        out += span(C.string, line.slice(i, j + 1));
        i = j + 1;
        continue;
      }
      // Template literal (JS)
      if (lang === "JavaScript" && line[i] === "`") {
        let j = i + 1;
        while (j < line.length && line[j] !== "`") { if (line[j]==="\\") j++; j++; }
        out += span(C.string, line.slice(i, j + 1));
        i = j + 1;
        continue;
      }
      // Number
      if (/[0-9]/.test(line[i]) && (i === 0 || !/\w/.test(line[i-1]))) {
        let j = i;
        while (j < line.length && /[\d._x]/.test(line[j])) j++;
        out += span(C.number, line.slice(i, j));
        i = j;
        continue;
      }
      // Decorator (Python)
      if (lang === "Python" && line[i] === "@") {
        let j = i + 1;
        while (j < line.length && /\w/.test(line[j])) j++;
        out += span(C.decorator, line.slice(i, j));
        i = j;
        continue;
      }
      // Preprocessor directive (C++)
      if (lang === "C++" && line[i] === "#") {
        out += span(C.keyword, line.slice(i));
        i = line.length;
        continue;
      }
      // Word (keyword / identifier)
      if (/[a-zA-Z_$]/.test(line[i])) {
        let j = i;
        while (j < line.length && /[\w$]/.test(line[j])) j++;
        const word = line.slice(i, j);
        // Detect function call: word followed by (
        const nextNonSpace = line.slice(j).trimStart();
        if (kws.has(word))                         out += span(C.keyword, word);
        else if (word === "self" || word === "this" || word === "super") out += span(C.special, word);
        else if (builtins.has(word))               out += span(C.builtin, word);
        else if (nextNonSpace.startsWith("("))     out += span(C.fn, word);
        else if (/^[A-Z]/.test(word))              out += span(C.type, word);
        else if (specials.has(word))               out += span(C.special, word);
        else                                        out += span(C.default, word);
        i = j;
        continue;
      }
      // Operators / punctuation
      if (/[=+\-*/<>!&|^~%]/.test(line[i])) {
        out += span(C.operator, line[i]);
        i++;
        continue;
      }
      // Everything else (spaces, brackets, etc.)
      out += escHtml(line[i]);
      i++;
    }
    return out;
  }).join("\n");
}

const COPY_PASTE_WARN = "⛔ Copy-paste is disabled during the exam.";

export default function CodeEditor({ question, onCodeChange }) {
  const [language,  setLanguage]  = useState("Python");
  const [code,      setCode]      = useState(question?.starterCode?.["Python"] ?? "");
  const [output,    setOutput]    = useState("");
  const [running,   setRunning]   = useState(false);
  const [cpWarn,    setCpWarn]    = useState(false);
  const [runCount,  setRunCount]  = useState(0);
  const [highlighted, setHighlighted] = useState("");

  const textareaRef = useRef(null);
  const preRef      = useRef(null);
  const warnTimer   = useRef(null);

  // Re-highlight whenever code or language changes
  useEffect(() => {
    setHighlighted(tokenize(code, language));
  }, [code, language]);

  // Switch language → load starter code
  useEffect(() => {
    const starter = question?.starterCode?.[language] ?? "";
    setCode(starter);
    setOutput("");
    onCodeChange?.(starter, language);
  }, [language, question]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync textarea & pre scroll
  const syncScroll = () => {
    if (preRef.current && textareaRef.current) {
      preRef.current.scrollTop  = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const showCpWarning = useCallback(() => {
    setCpWarn(true);
    clearTimeout(warnTimer.current);
    warnTimer.current = setTimeout(() => setCpWarn(false), 3000);
  }, []);

  const blockPaste = (e) => { e.preventDefault(); showCpWarning(); };
  const blockCopy  = (e) => { e.preventDefault(); showCpWarning(); };
  const blockCtx   = (e) => { e.preventDefault(); showCpWarning(); };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && ["v","c","x"].includes(e.key)) {
      e.preventDefault(); showCpWarning(); return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end   = e.target.selectionEnd;
      const next  = code.substring(0, start) + "    " + code.substring(end);
      setCode(next);
      onCodeChange?.(next, language);
      requestAnimationFrame(() => {
        textareaRef.current.selectionStart = start + 4;
        textareaRef.current.selectionEnd   = start + 4;
      });
    }
  };

  const handleChange = (e) => {
    setCode(e.target.value);
    onCodeChange?.(e.target.value, language);
  };

  const handleRun = () => {
    if (running) return;
    setRunning(true);
    setOutput("⟳  Running your code…");
    const delay = 800 + Math.random() * 1200;
    setTimeout(() => {
      const pool = runCount < 2
        ? simulatedOutputs.success
        : Math.random() > 0.35 ? simulatedOutputs.success : simulatedOutputs.error;
      const result = pool[Math.floor(Math.random() * pool.length)];
      setOutput(result);
      setRunning(false);
      setRunCount(c => c + 1);
    }, delay);
  };

  return (
    <div className="code-editor-wrap">
      {/* Header */}
      <div className="code-editor-header">
        <div className="code-editor-lang-wrap">
          <span className="code-editor-lang-label">Language:</span>
          <div className="code-lang-tabs">
            {LANGUAGES.map(l => (
              <button
                key={l}
                className={`code-lang-tab ${language === l ? "active" : ""}`}
                onClick={() => setLanguage(l)}
              >{l}</button>
            ))}
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"0.625rem" }}>
          <span style={{ fontSize:"0.7rem", color:"#484f58", fontWeight:600 }}>
            VS Code theme · Syntax highlighting active
          </span>
          <button
            id="run-code-btn"
            className={`btn-run-code ${running ? "running" : ""}`}
            onClick={handleRun}
            disabled={running}
          >{running ? "▶ Running…" : "▶ Run Code"}</button>
        </div>
      </div>

      {/* Copy-paste warning */}
      {cpWarn && <div className="code-cp-warning">{COPY_PASTE_WARN}</div>}

      {/* Editor area: highlighted pre + transparent textarea overlay */}
      <div className="code-editor-inner" style={{ position:"relative" }}>
        {/* Syntax-highlighted background */}
        <pre
          ref={preRef}
          className="code-highlight-pre"
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: highlighted + "\n" }}
        />
        {/* Transparent textarea on top */}
        <textarea
          ref={textareaRef}
          id="code-editor-textarea"
          className="code-editor-textarea code-editor-overlay"
          value={code}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onScroll={syncScroll}
          onCopy={blockCopy}
          onCut={blockCopy}
          onPaste={blockPaste}
          onContextMenu={blockCtx}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          rows={22}
        />
      </div>

      {/* Output panel */}
      <div className="code-output-panel">
        <div className="code-output-header">
          <span>⬛ Output</span>
          {output && (
            <button className="code-clear-btn" onClick={() => setOutput("")}>Clear</button>
          )}
        </div>
        <pre className={`code-output-body ${output.startsWith("All test") || output.startsWith("Accepted") || output.startsWith("Compilation s") ? "output-success" : output ? "output-error" : ""}`}>
          {output || "// Output will appear here after you run your code"}
        </pre>
      </div>
    </div>
  );
}
