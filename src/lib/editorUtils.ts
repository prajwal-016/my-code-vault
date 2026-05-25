import { formatCode } from './formatter';

// Auto-populate custom completion suggestions and snippets for supported IDE languages
export function getLanguageSuggestions(monaco: any, language: string) {
  const lang = language.toLowerCase();
  
  const suggestions: any[] = [];
  
  // Helper to add keyword
  const addKeyword = (label: string, detail?: string) => {
    suggestions.push({
      label,
      kind: monaco.languages.CompletionItemKind.Keyword,
      detail: detail || 'Keyword',
      insertText: label,
      range: undefined as any,
    });
  };

  // Helper to add standard library function
  const addFunction = (label: string, insertText: string, detail: string, documentation?: string) => {
    suggestions.push({
      label,
      kind: monaco.languages.CompletionItemKind.Function,
      detail,
      documentation,
      insertText,
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.None,
      range: undefined as any,
    });
  };

  // Helper to add code snippet autocomplete
  const addSnippet = (label: string, insertText: string, detail: string, documentation?: string) => {
    suggestions.push({
      label,
      kind: monaco.languages.CompletionItemKind.Snippet,
      detail,
      documentation,
      insertText,
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: undefined as any,
    });
  };

  if (lang === 'python') {
    // Keywords
    const kws = [
      'def', 'class', 'return', 'if', 'elif', 'else', 'for', 'while', 'in', 'is', 'and', 'or', 'not', 
      'import', 'from', 'as', 'try', 'except', 'finally', 'raise', 'assert', 'pass', 'break', 'continue', 
      'lambda', 'yield', 'global', 'nonlocal', 'with', 'None', 'True', 'False', 'self'
    ];
    kws.forEach(k => addKeyword(k));

    // Functions
    addFunction('print', 'print(${1:value})', 'print(value)', 'Prints values to the stream.');
    addFunction('len', 'len(${1:iterable})', 'len(iterable)', 'Returns the number of items in an object.');
    addFunction('range', 'range(${1:stop})', 'range(stop)', 'Returns a sequence of numbers, starting from 0 by default.');
    addFunction('enumerate', 'enumerate(${1:iterable})', 'enumerate(iterable)', 'Returns an enumerate object.');
    addFunction('zip', 'zip(${1:iterables})', 'zip(*iterables)', 'Returns an iterator of tuples, where the i-th tuple contains the i-th element.');
    addFunction('sum', 'sum(${1:iterable})', 'sum(iterable)', 'Sums the start and the items of an iterable.');
    addFunction('min', 'min(${1:iterable})', 'min(iterable)', 'Returns the smallest item in an iterable.');
    addFunction('max', 'max(${1:iterable})', 'max(iterable)', 'Returns the largest item in an iterable.');
    addFunction('abs', 'abs(${1:x})', 'abs(x)', 'Returns the absolute value of a number.');
    addFunction('int', 'int(${1:x})', 'int(x)', 'Converts a number or string to an integer.');
    addFunction('str', 'str(${1:object})', 'str(object)', 'Returns a string version of an object.');
    addFunction('dict', 'dict()', 'dict()', 'Creates a dictionary.');
    addFunction('list', 'list()', 'list()', 'Creates a list.');
    addFunction('set', 'set()', 'set()', 'Creates a set.');
    addFunction('tuple', 'tuple()', 'tuple()', 'Creates a tuple.');

    // Snippets
    addSnippet('for (loop)', 'for ${1:item} in ${2:iterable}:\n\t${3:pass}', 'for item in iterable', 'Create a standard Python for-in loop');
    addSnippet('def (method)', 'def ${1:func_name}(self, ${2:params}):\n\t${3:pass}', 'def func_name(self, params)', 'Create a Python class method definition');
    addSnippet('class (init)', 'class ${1:ClassName}:\n\tdef __init__(self):\n\t\t${2:pass}', 'class ClassName', 'Create a new class with constructor');
    addSnippet('listcomp', '[${1:x} for ${2:x} in ${3:iterable}]', 'List Comprehension', 'Generate a list comprehension snippet');
    addSnippet('ifmain', 'if __name__ == "__main__":\n\t${1:main()}', 'if __name__ == "__main__"', 'Create boilerplate standard main execution wrapper');

  } else if (lang === 'cpp' || lang === 'c++') {
    // Keywords
    const kws = [
      'class', 'struct', 'public', 'private', 'protected', 'virtual', 'override', 'const', 'constexpr', 
      'inline', 'template', 'typename', 'auto', 'void', 'int', 'double', 'float', 'char', 'bool', 'true', 
      'false', 'if', 'else', 'switch', 'case', 'default', 'for', 'while', 'do', 'break', 'continue', 
      'return', 'new', 'delete', 'this', 'throw', 'try', 'catch', 'namespace', 'using', 'std', 'vector', 
      'string', 'unordered_map', 'unordered_set', 'map', 'set', 'pair', 'queue', 'stack', 'NULL', 'nullptr'
    ];
    kws.forEach(k => addKeyword(k));

    // Snippets
    addSnippet('for (loop)', 'for (int i = 0; i < ${1:n}; ++i) {\n\t${2:// code}\n}', 'for (int i = 0; i...)', 'Standard index-based for loop');
    addSnippet('forrange', 'for (const auto& ${1:x} : ${2:vec}) {\n\t${3:// code}\n}', 'for (const auto& x : vec)', 'Range-based auto loop');
    addSnippet('cout', 'std::cout << ${1:value} << std::endl;', 'std::cout << ...', 'Print output to stdout');
    addSnippet('vector', 'std::vector<${1:int}> ${2:vec};', 'std::vector<T>', 'Declare a standard C++ vector list');
    addSnippet('umap', 'std::unordered_map<${1:int}, ${2:int}> ${3:map};', 'std::unordered_map<K, V>', 'Declare a standard unordered hashmap');
    addSnippet('uset', 'std::unordered_set<${1:int}> ${2:set};', 'std::unordered_set<T>', 'Declare a standard unordered hashset');
    addSnippet('main', 'int main() {\n\t${1:// code}\n\treturn 0;\n}', 'int main() {}', 'Standard C++ main function entry point');

  } else if (lang === 'java') {
    // Keywords
    const kws = [
      'public', 'private', 'protected', 'class', 'interface', 'extends', 'implements', 'static', 'final', 
      'void', 'int', 'double', 'float', 'boolean', 'char', 'long', 'new', 'return', 'if', 'else', 'for', 
      'while', 'do', 'switch', 'case', 'default', 'break', 'continue', 'try', 'catch', 'finally', 'throw', 
      'throws', 'import', 'package', 'this', 'super', 'null', 'true', 'false', 'List', 'ArrayList', 'Map', 
      'HashMap', 'Set', 'HashSet', 'String', 'Override'
    ];
    kws.forEach(k => addKeyword(k));

    // Snippets
    addSnippet('for (loop)', 'for (int i = 0; i < ${1:n}; i++) {\n\t${2:// code}\n}', 'for (int i = 0; i...)', 'Index loop');
    addSnippet('foreach', 'for (${1:Type} ${2:item} : ${3:collection}) {\n\t${4:// code}\n}', 'for (Type item : collection)', 'Enhanced for loop');
    addSnippet('sysout', 'System.out.println(${1:value});', 'System.out.println()', 'Print string with newline to stdout');
    addSnippet('hashmap', 'Map<${1:Integer}, ${2:Integer}> ${3:map} = new HashMap<>();', 'Map<K, V> = new HashMap<>()', 'Instantiate a new HashMap object');
    addSnippet('arraylist', 'List<${1:Integer}> ${2:list} = new ArrayList<>();', 'List<T> = new ArrayList<>()', 'Instantiate a new ArrayList object');
    addSnippet('psvm', 'public static void main(String[] args) {\n\t${1:// code}\n}', 'public static void main', 'Java program main method entry');

  } else if (lang === 'javascript' || lang === 'typescript') {
    // Keywords
    const kws = [
      'const', 'let', 'var', 'function', 'class', 'extends', 'constructor', 'this', 'super', 'return', 
      'if', 'else', 'switch', 'case', 'default', 'for', 'while', 'do', 'break', 'continue', 'try', 'catch', 
      'finally', 'throw', 'import', 'export', 'from', 'async', 'await', 'promise', 'null', 'undefined', 
      'true', 'false', 'new', 'typeof', 'instanceof', 'interface', 'type', 'any', 'number', 'string', 'boolean'
    ];
    kws.forEach(k => addKeyword(k));

    // Snippets
    addSnippet('for (loop)', 'for (let i = 0; i < ${1:n}; i++) {\n\t${2:// code}\n}', 'for (let i = 0...)', 'Standard Javascript for index loop');
    addSnippet('forof', 'for (const ${1:item} of ${2:iterable}) {\n\t${3:// code}\n}', 'for (const item of iterable)', 'For-Of loop to traverse array elements');
    addSnippet('clg', 'console.log(${1:value});', 'console.log()', 'Print debug output variables');
    addSnippet('arrow', 'const ${1:func} = (${2:params}) => {\n\t${3:// code}\n};', 'const func = () => {}', 'Shorthand ES6 arrow function');
    addSnippet('promise', 'new Promise((resolve, reject) => {\n\t${1:// code}\n});', 'new Promise()', 'Return a new ES6 async promise wrapper');
    addSnippet('map', 'const ${1:map} = new Map();', 'new Map()', 'Instantiate a new key-value JS Map class');

  } else if (lang === 'go') {
    // Keywords
    const kws = [
      'func', 'package', 'import', 'var', 'const', 'type', 'struct', 'interface', 'map', 'range', 'make', 
      'len', 'append', 'if', 'else', 'for', 'switch', 'case', 'default', 'fallthrough', 'break', 'continue', 
      'return', 'go', 'chan', 'select', 'defer', 'panic', 'recover', 'nil', 'true', 'false', 'string', 
      'int', 'float64', 'bool'
    ];
    kws.forEach(k => addKeyword(k));

    // Snippets
    addSnippet('for (loop)', 'for i := 0; i < ${1:n}; i++ {\n\t${2:// code}\n}', 'for i := 0; i...', 'Go standard integer iteration loop');
    addSnippet('forrange', 'for ${1:index}, ${2:value} := range ${3:collection} {\n\t${4:// code}\n}', 'for idx, val := range', 'Loop over index and value of slice/map');
    addSnippet('func', 'func ${1:funcName}(${2:params}) ${3:type} {\n\t${4:// code}\n}', 'func funcName()', 'Declare a Go function');
    addSnippet('fmt', 'fmt.Println(${1:value})', 'fmt.Println()', 'Print string to console');
    addSnippet('slice', '${1:slice} := make([]${2:int}, ${3:length})', 'make([]T, len)', 'Create dynamic array using make buffer');

  } else if (lang === 'rust') {
    // Keywords
    const kws = [
      'fn', 'struct', 'enum', 'impl', 'trait', 'let', 'mut', 'pub', 'use', 'mod', 'crate', 'self', 
      'Self', 'super', 'return', 'if', 'else', 'match', 'for', 'while', 'loop', 'break', 'continue', 
      'in', 'as', 'ref', 'move', 'static', 'const', 'unsafe', 'where', 'type', 'true', 'false', 'String', 
      'Vec', 'HashMap', 'HashSet', 'Option', 'Result', 'Some', 'None', 'Ok', 'Err'
    ];
    kws.forEach(k => addKeyword(k));

    // Snippets
    addSnippet('for (loop)', 'for ${1:i} in 0..${2:n} {\n\t${3:// code}\n}', 'for i in 0..n', 'Iterate over index range in Rust');
    addSnippet('foriter', 'for ${1:item} in ${2:iter}.iter() {\n\t${3:// code}\n}', 'for item in iter', 'Traverse items from vector reference iterator');
    addSnippet('fn', 'fn ${1:func_name}(${2:params}) -> ${3:type} {\n\t${4:// code}\n}', 'fn func_name() -> T', 'Declare a Rust function signature');
    addSnippet('println', 'println!("${1:{} }", ${2:value});', 'println!()', 'Format standard output console macro');
    addSnippet('vec', 'let mut ${1:v} = vec![${2:value}];', 'vec![]', 'Instantiate a new vector macro allocation');
  }

  return suggestions;
}

let isConfigured = false;

// Custom document formatter and autocomplete setup hook for Monaco Editor instances
export function configureMonacoIDE(monaco: any) {
  if (isConfigured) return;
  isConfigured = true;

  const languages = ['python', 'cpp', 'java', 'javascript', 'typescript', 'go', 'rust'];

  languages.forEach((lang) => {
    // 1. Register a document formatting edit provider for right-click formatting
    monaco.languages.registerDocumentFormattingEditProvider(lang, {
      provideDocumentFormattingEdits(model: any) {
        const rawCode = model.getValue();
        const formatted = formatCode(rawCode, lang);
        
        return [
          {
            range: model.getFullModelRange(),
            text: formatted,
          },
        ];
      },
    });

    // 2. Register completion items provider for autocomplete suggestions while typing
    monaco.languages.registerCompletionItemProvider(lang, {
      triggerCharacters: ['.', ' ', ':', '('], // trigger suggestions on standard programming syntax tokens
      provideCompletionItems(model: any, position: any) {
        const textUntilPosition = model.getValueInRange({
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        });

        // Generate clean language specific items
        const suggestions = getLanguageSuggestions(monaco, lang);

        return {
          suggestions: suggestions,
        };
      },
    });
  });
}

// Custom method to register programmatic context menu actions on active Editor mounting
export function registerCustomFormatAction(editor: any, monaco: any) {
  editor.addAction({
    id: 'format-document-custom',
    label: 'Format Document',
    keybindings: [
      monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF
    ],
    precondition: null,
    keybindingContext: null,
    contextMenuGroupId: '9_cutcopypaste', // Place directly inside Cut, Copy, Paste group!
    contextMenuOrder: 4,                  // Place at order 4 (Cut is 1, Copy is 2, Paste is 3)
    run: function (ed: any) {
      const model = ed.getModel();
      if (!model) return;

      const rawCode = ed.getValue();
      const currentLanguage = model.getLanguageId();
      const formatted = formatCode(rawCode, currentLanguage);

      // Perform transaction-safe edit replacement supporting undo/redo stack
      ed.pushUndoStop();
      ed.executeEdits('custom-formatter', [
        {
          range: model.getFullModelRange(),
          text: formatted,
          forceMoveMarkers: true,
        },
      ]);
      ed.pushUndoStop();
    },
  });
}
