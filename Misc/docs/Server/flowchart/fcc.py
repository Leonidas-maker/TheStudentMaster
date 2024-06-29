import ast
from pathlib import Path
from typing import List
from graphviz import Digraph
import sys
from collections import defaultdict


class FunctionAnalysisVisitor(ast.NodeVisitor):
    def __init__(self, own_modules):
        super().__init__()
        self.functions = {}  # Stores function definitions
        self.own_modules = own_modules
        self.imported_own_modules = {}  # Tracks imported modules/functions

    def visit_FunctionDef(self, node):
        # Current function being defined
        self.current_function = node.name
        self.functions[node.name] = []
        self.generic_visit(node)

    def visit_AsyncFunctionDef(self, node):
        # Treat async functions the same as normal functions
        self.current_function = node.name
        self.functions[node.name] = []
        self.generic_visit(node)

    def visit_Call(self, node):
        called_function = None
        module_prefix = None
        # Check if the call is to a function from an imported module
        if (
            isinstance(node.func, ast.Attribute)
            and hasattr(node.func.value, "id")
            and node.func.value.id in self.imported_own_modules
        ):
            module_prefix = self.imported_own_modules[node.func.value.id]
            called_function = node.func.attr
        elif isinstance(node.func, ast.Name):
            if node.func.id in self.imported_own_modules:
                # If the function was imported directly without module prefix
                called_function = self.imported_own_modules[node.func.id]
            elif node.func.id in self.functions:
                called_function = node.func.id
        if called_function:
            # Format with module prefix if available
            if module_prefix:
                formatted_call = f"{module_prefix}.{called_function}"
            else:
                formatted_call = called_function
            # Append the call with line number
            self.functions[self.current_function].append((node.lineno, formatted_call))
        self.generic_visit(node)

    def visit_Import(self, node):
        # Handle standard imports
        for alias in node.names:
            if alias.name in self.own_modules:
                self.imported_own_modules[alias.asname or alias.name] = alias.name
        self.generic_visit(node)

    def visit_ImportFrom(self, node):
        # Handle imports from specific modules
        if node.module in self.own_modules:
            for alias in node.names:
                module_function = f"{node.module}.{alias.name}"
                self.imported_own_modules[alias.asname or alias.name] = module_function
        self.generic_visit(node)


def climb_up(from_path: Path, to_path: Path = Path.cwd()) -> str:
    relative_path = from_path.relative_to(to_path)
    return ".".join(relative_path.parts)[:-3]


def get_own_modules(path: Path = Path.cwd()) -> List[str]:
    own_modules = []
    for file in path.glob("**/*.py"):
        if file.name != "__init__.py":
            own_modules.append(climb_up(file))
    return own_modules


def get_routes(path: Path = Path.cwd()) -> List[Path]:
    routes = []
    for file in path.glob("routes/*.py"):
        if file.name != "__init__.py":
            routes.append(file)
    return routes


def get_non_routes(path: Path = Path.cwd()) -> List[Path]:
    non_routes = []
    routes = get_routes()
    for file in path.glob("**/*.py"):
        if (
            file.name != "__init__.py"
            and file not in routes
            and not file.name == "main.py"
            and not file.name.startswith(("s", "m"))
        ):
            non_routes.append(file)

    return non_routes


def analyse(own_modules: List[str], files: List[Path]) -> dict:
    functions = {}
    for file in files:
        print(f"Analyzing {file.name}")
        code = file.read_text(encoding="utf-8")
        parsed_code = ast.parse(code)
        visitor = FunctionAnalysisVisitor(own_modules)
        visitor.visit(parsed_code)
        for function, calls in visitor.functions.items():
            if function not in functions:
                functions[f"{climb_up(file)}.{function}"] = []
            for call in calls:
                functions[f"{climb_up(file)}.{function}"].append((call[0], f"{climb_up(file)}.{call[1]}"))

    return functions


def depend_on(functions: dict, function: str):
    for main_function, called_functions in functions.items():
        if called_functions:
            _, called_functions_name = zip(*called_functions)
            called_functions_name = list(called_functions_name)

            if function in called_functions_name:
                return True
    return False


def split_function_calls(functions: dict):
    empty_functions = {}
    depending_functions = {}
    independing_functions = {}
    for mainfunction, called_functions in functions.items():
        if called_functions:
            if depend_on(functions, mainfunction):
                depending_functions[mainfunction] = called_functions
            else:
                independing_functions[mainfunction] = called_functions
        else:
            empty_functions[mainfunction] = called_functions
    return empty_functions, depending_functions, independing_functions


# TODO Recusive functions not implemented
def combine_functions(functions: dict) -> dict:
    empty_functions, depending_functions, independing_functions = split_function_calls(functions)

    depending_functions_depending_calls = [elem[1] for value in depending_functions.values() for elem in value]
    combine_needed = False

    for function, calls in depending_functions.items():
        # Using list comprehension to rebuild the list of calls with modified tuples
        modified_calls = []

        for call in calls:
            if empty_functions and call[1] in empty_functions:
                # Reconstruct the tuple with the modified value from empty_functions
                modified_call = (call[0], (call[1], empty_functions[call[1]]))
                modified_calls.append(modified_call)
            else:
                # If no modification is needed, keep the original call
                modified_calls.append(call)
        # Update the dictionary with the modified list of calls
        depending_functions[function] = modified_calls
        if function in depending_functions_depending_calls:
            combine_needed = True

    if combine_needed:
        # print("First\n", depending_functions)
        depending_functions = combine_functions(depending_functions)
        # print("\nSecond", depending_functions)

    for function, calls in independing_functions.items():
        modified_calls = []
        for call in calls:
            if empty_functions and call[1] in empty_functions:
                modified_call = (call[0], (call[1], empty_functions[call[1]]))
                modified_calls.append(modified_call)
            elif depending_functions and get_call_name(call) in depending_functions:
                modified_call = (call[0], (call[1], depending_functions[call[1]]))
                modified_calls.append(modified_call)
            else:
                modified_calls.append(call)
        independing_functions[function] = modified_calls
    return independing_functions


def get_call_name(calls: tuple):
    if isinstance(calls[1], tuple):
        return calls[1][0]
    return calls[1]


def füge_nebenfunktionen_korrigiert_hinzu(dot, startpunkt, aufrufe, pfad_prefix=""):
    letzter_knoten = startpunkt
    for zeile, aufruf in aufrufe:
        if isinstance(aufruf, tuple) and aufruf[1]:  # NF mit weiteren Aufrufen
            nf, unteraufrufe = aufruf
            eindeutige_nf_id = f"{pfad_prefix}{nf}_{zeile}"
            # Erstelle einen umrandeten Kasten für NF, die selbst aufrufen
            with dot.subgraph(name=f"cluster_{eindeutige_nf_id}") as c:
                c.attr(color="red", label=nf)
                untereindeutiger_id = f"{eindeutige_nf_id}_unter"
                c.node(untereindeutiger_id, f"{nf}\n(Zeile {zeile})", shape="box")
                # Rekursiv für untergeordnete Aufrufe
                füge_nebenfunktionen_korrigiert_hinzu(
                    c, untereindeutiger_id, unteraufrufe, pfad_prefix=eindeutige_nf_id + "_"
                )
            # Verweise von der vorherigen NF (oder HF) auf den umrandeten Kasten
            dot.edge(letzter_knoten, untereindeutiger_id, style="dashed")
            letzter_knoten = untereindeutiger_id
        else:  # Einfache NF ohne weitere Aufrufe
            if isinstance(aufruf, tuple):
                nf, _ = aufruf
            else:
                nf = aufruf
            eindeutige_nf_id = f"{pfad_prefix}{nf}_{zeile}"
            dot.node(eindeutige_nf_id, f"{nf}\n(Zeile {zeile})")
            dot.edge(letzter_knoten, eindeutige_nf_id)
            letzter_knoten = eindeutige_nf_id


def draw_graph(functions: dict, file_path: Path = (Path(__file__).parent / "flowchart")):
    aufruf_struktur = defaultdict(list)

    for hf, aufrufe in functions.items():
        for zeile, nf in sorted(aufrufe, key=lambda x: x[0]):
            aufruf_struktur[hf].append((zeile, nf))

    # Neues Diagramm erstellen mit separater Behandlung jeder Hauptfunktion
    dot = Digraph(comment="Flowdiagramm mit separaten Hauptfunktionen", format="png", graph_attr={"rankdir": "LR"})

    # Hauptfunktionen und deren Aufrufe hinzufügen
    for hf, aufrufe in aufruf_struktur.items():
        dot.node(hf, hf, shape="box", color="lightblue2", style="filled")
        füge_nebenfunktionen_korrigiert_hinzu(dot, hf, aufrufe)

    # Diagramm rendern und Pfad zurückgeben
    dot.render(file_path, view=True)


if __name__ == "__main__":
    own_modules = get_own_modules()

    # routes = get_routes()
    # routes_analyse = analyse(own_modules, routes)

    non_routes = get_non_routes()
    non_routes_analyse = analyse(own_modules, non_routes)

    # print("Routes")
    # for file, functions in routes_analyse.items():
    #     print(f"{file}: {functions}\n")

    empty_functions, depending_functions, independing_functions = split_function_calls(non_routes_analyse)

    # print("Non Routes")
    # print("Independing Functions")
    # for file, functions in independing_functions.items():
    #     print(f"{file}: {functions}")

    # print("\nDepending Functions")
    # for file, functions in depending_functions.items():
    #     print(f"{file}: {functions}")

    # print("\nEmpty Functions")
    # for file, functions in empty_functions.items():
    #     print(f"{file}: {functions}")

    combined = combine_functions(non_routes_analyse)

    print("\nCombined")
    for file, functions in combined.items():
        print(f"\n{file}: {functions}")

    draw_graph(combined)
